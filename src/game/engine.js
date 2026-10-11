import { trainings } from '../data/trainings.js'
import { gradeGrowthMultiplier, placementGrowthMultiplier } from '../data/races.js'

export const CONDITIONS = ['절부진', '부진', '보통', '호조', '절호조']
export const months = ['1월', '2월', '3월', '4월', '5월', '6월']
export const rng = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

const weighted = (items) => {
  let roll = Math.random() * items.reduce((sum, item) => sum + item.weight, 0)
  return items.find((item) => (roll -= item.weight) <= 0) ?? items[0]
}
export const getConditionIndex = (condition) => CONDITIONS.indexOf(condition)
export const conditionFrom = (condition, delta = 0) => CONDITIONS[Math.max(0, Math.min(4, getConditionIndex(condition) + delta))]
export const statSum = (stats) => Object.values(stats).reduce((a, b) => a + b, 0)
export function trainingFailureRate(stamina) {
  if (stamina <= 0) return 100
  if (stamina <= 10) return 80
  if (stamina <= 20) return 50
  if (stamina <= 30) return 25
  if (stamina <= 40) return 10
  return 0
}

export function runTraining(game, selectedId = null) {
  const before = game.stamina
  if (selectedId === 'ForcedRest') return { id: 'ForcedRest', label: '강제 휴식', gains: {}, before, after: Math.min(100, before + rng(30, 80)), conditionChange: 0, forcedRest: true, message: '체력이 완전히 소진되어 강제 휴식을 취했다.' }
  if (selectedId === 'Rest' || (!selectedId && before <= 25)) {
    const conditionChange = Math.random() < 0.35 ? 1 : 0
    return { id: 'Rest', label: '휴식', gains: {}, before, after: Math.min(100, before + rng(30, 80)), conditionChange, message: '휴식을 취하며 체력을 회복했다.' }
  }
  const training = selectedId ? trainings.find((item) => item.id === selectedId) : weighted(trainings)
  if (!training) return runTraining(game)
  const failureRate = trainingFailureRate(before)
  if (Math.random() * 100 < failureRate) {
    const gains = Object.fromEntries(Object.keys(training.gains).map((stat) => [stat, 0]))
    return { id: training.id, label: training.label, gains, before, after: Math.max(0, before - 5), conditionChange: Math.random() < 0.2 ? -1 : 0, failed: true, forceRestNext: before === 0, failureRate, message: `${training.label} 훈련에 실패했다.` }
  }
  const gains = Object.fromEntries(Object.entries(training.gains).map(([stat, [min, max]]) => [stat, rng(min, max)]))
  return { id: training.id, label: training.label, gains, before, after: Math.max(0, before - training.staminaCost), conditionChange: 0, failed: false, forceRestNext: false, failureRate, message: `${training.label} 훈련을 진행했다.` }
}

export function applyEffects(game, effects) {
  const stats = { ...game.stats }
  Object.entries(effects.stats ?? {}).forEach(([stat, amount]) => { stats[stat] += amount })
  return { ...game, stats, stamina: Math.max(0, Math.min(100, game.stamina + (effects.stamina ?? 0))), fans: game.fans + (effects.fans ?? 0), condition: conditionFrom(game.condition, effects.condition ?? 0) }
}

export function calculateRaceGrowth(race, finish) {
  const placement = placementGrowthMultiplier[finish] ?? placementGrowthMultiplier.default
  const grade = gradeGrowthMultiplier[race.grade] ?? 1
  return Object.fromEntries(Object.entries(race.growthProfile).map(([stat, base]) => [stat, Math.max(1, Math.round(base * placement * grade))]))
}

export function simulateRace(game, race) {
  const conditionBonus = getConditionIndex(game.condition) * 7
  const base = Object.entries(race.statWeights).reduce((sum, [stat, weight]) => sum + game.stats[stat] * weight, 0)
  const g1Wins = game.raceResults?.filter((result) => result.grade === 'G1' && result.finish === 1).length ?? 0
  const arimaBonus = race.finalBoss ? Math.min(3, g1Wins) / 100 : 0
  const score = (base + conditionBonus) * (1 + arimaBonus) + rng(-Math.round(race.difficulty * .07), Math.round(race.difficulty * .07))
  const normalized = Math.max(0, Math.min(1, (score - race.difficulty * .55) / (race.difficulty * .5)))
  let finish = Math.max(1, Math.min(race.entrants, race.entrants - Math.round(normalized * (race.entrants - 1))))
  const staminaShortage = race.staminaRequirement && game.stats.Stamina < race.staminaRequirement
  if (staminaShortage) {
    const gap = race.staminaRequirement - game.stats.Stamina
    finish = Math.max(2, finish)
    if (gap > 150) finish = Math.max(finish, Math.min(race.entrants, 7))
    else if (gap > 50) finish = Math.max(finish, 4)
  }
  const smart = game.stats.Wisdom + rng(-20, 20) > 115
  const start = Math.min(race.entrants, finish + rng(1, 2))
  const mid = Math.min(race.entrants, Math.max(1, finish + rng(0, 2)))
  const raceStamina = Math.max(15, Math.min(98, 100 - Math.round((race.distanceType === 'LONG' ? 48 : 34) - game.stats.Stamina / 18)))
  const growth = calculateRaceGrowth(race, finish)
  const fans = Math.round(race.fansBase * (race.entrants - finish + 1) / race.entrants)
  return { ...race, finish, score, entrants: race.entrants, growth, fans, logs: [
    { phase: '출전표', text: `${race.name} · ${race.grade} · ${race.distance}\n총 ${race.entrants}명의 우마무스메가 출전한다.\n맥퀸이 게이트 안에서 집중하고 있다.`, rank: null, stamina: null },
    { phase: 'START', text: '출발 신호! 맥퀸이 힘차게 스타트를 끊었다.', rank: start, stamina: 91 },
    { phase: '초반', text: '맥퀸은 무난하게 자리를 잡았다.\n앞쪽의 흐름을 놓치지 않고 있다.', rank: start, stamina: 78 },
    { phase: '중반', text: staminaShortage ? '긴 레이스에서 소모한 체력이 마지막 순간 발목을 잡는다.\n스태미나 부족! 맥퀸은 호흡을 가다듬는다.' : smart ? '선두의 페이스가 빨라졌다.\n지능 판정 성공! 맥퀸은 불필요한 체력 소모를 줄였다.' : '선두의 페이스가 빨라졌다.\n맥퀸은 호흡을 가다듬으며 차분하게 따라붙는다.', rank: mid, stamina: raceStamina },
    { phase: '최종 직선', text: `맥퀸이 스퍼트를 시작했다!\n${mid}위 → ${finish}위, 선두를 추격한다!`, rank: finish, stamina: Math.max(15, raceStamina - 28) },
    { phase: '결과', text: finish === 1 ? '맥퀸이 결승선을 가장 먼저 통과했다!' : `맥퀸이 ${finish}위로 결승선을 통과했다.`, rank: finish, stamina: 0 },
  ] }
}

export function rating(game) {
  const total = statSum(game.stats)
  if (total >= 850) return ['A', '장거리의 귀공자']
  if (total >= 760) return ['B+', '장거리의 싹']
  if (total >= 690) return ['B', '품격 있는 도전자']
  return ['C+', '성장하는 우마무스메']
}
