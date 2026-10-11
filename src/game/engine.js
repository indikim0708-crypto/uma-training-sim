import { trainings } from '../data/trainings'

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

export function runTraining(game, selectedId = null) {
  const before = game.stamina
  if (selectedId === 'Rest' || (!selectedId && before <= 25)) {
    const conditionChange = Math.random() < 0.35 ? 1 : 0
    return { id: 'Rest', label: '휴식', gains: {}, before, after: Math.min(100, before + rng(25, 35)), conditionChange, message: '휴식을 취하며 체력을 회복했다.' }
  }
  const training = selectedId ? trainings.find((item) => item.id === selectedId) : weighted(trainings)
  if (!training) return runTraining(game)
  const gains = Object.fromEntries(Object.entries(training.gains).map(([stat, [min, max]]) => [stat, rng(min, max)]))
  return { id: training.id, label: training.label, gains, before, after: Math.max(0, before - training.staminaCost), conditionChange: 0, message: `${training.label} 훈련을 진행했다.` }
}

export function applyEffects(game, effects) {
  const stats = { ...game.stats }
  Object.entries(effects.stats ?? {}).forEach(([stat, amount]) => { stats[stat] += amount })
  return { ...game, stats, stamina: Math.max(0, Math.min(100, game.stamina + (effects.stamina ?? 0))), fans: game.fans + (effects.fans ?? 0), condition: conditionFrom(game.condition, effects.condition ?? 0) }
}

export function simulateRace(game, race) {
  const conditionBonus = getConditionIndex(game.condition) * 7
  const base = Object.entries(race.focus).reduce((sum, [stat, weight]) => sum + game.stats[stat] * weight, 0)
  const score = base + conditionBonus + rng(-22, 22)
  const normalized = Math.max(0, Math.min(1, (score - 90) / 100))
  const finish = Math.max(1, Math.min(race.entrants, race.entrants - Math.round(normalized * (race.entrants - 1))))
  const smart = game.stats.Wisdom + rng(-20, 20) > 115
  const start = Math.min(race.entrants, finish + rng(1, 2))
  const mid = Math.min(race.entrants, Math.max(1, finish + rng(0, 2)))
  const raceStamina = Math.max(28, Math.min(98, 100 - Math.round((race.distance === '2000m' ? 39 : 32) - game.stats.Stamina / 18)))
  return { finish, score, entrants: race.entrants, logs: [
    { phase: '출전표', text: `${race.title} · ${race.distance} · ${race.surface}\n총 ${race.entrants}명의 우마무스메가 출전한다.\n맥퀸이 게이트 안에서 집중하고 있다.`, rank: null, stamina: null },
    { phase: 'START', text: '출발 신호! 맥퀸이 힘차게 스타트를 끊었다.', rank: start, stamina: 91 },
    { phase: '초반', text: '맥퀸은 무난하게 자리를 잡았다.\n앞쪽의 흐름을 놓치지 않고 있다.', rank: start, stamina: 78 },
    { phase: '중반', text: smart ? '선두의 페이스가 빨라졌다.\n지능 판정 성공! 맥퀸은 불필요한 체력 소모를 줄였다.' : '선두의 페이스가 빨라졌다.\n맥퀸은 호흡을 가다듬으며 차분하게 따라붙는다.', rank: mid, stamina: raceStamina },
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
