import { trainings } from '../data/trainings.js'
import { gradeGrowthMultiplier, placementGrowthMultiplier } from '../data/races.js'
import { phaseTrainingMultiplier, STAT_MAX } from '../data/seasons.js'
import { leadGroupLimit, raceStrategies, wisdomChance } from '../data/raceStrategies.js'

export const CONDITIONS = ['최악', '저조', '보통', '양호', '최상']
export const months = ['1월', '2월', '3월', '4월', '5월', '6월']
export const rng = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

const weighted = (items) => {
  let roll = Math.random() * items.reduce((sum, item) => sum + item.weight, 0)
  return items.find((item) => (roll -= item.weight) <= 0) ?? items[0]
}
export const getConditionIndex = (condition) => CONDITIONS.indexOf(condition)
export const conditionFrom = (condition, delta = 0) => CONDITIONS[Math.max(0, Math.min(4, getConditionIndex(condition) + delta))]
export const statSum = (stats) => Object.values(stats).reduce((a, b) => a + b, 0)
export const clampStats = (stats) => Object.fromEntries(Object.entries(stats).map(([stat, value]) => [stat, Math.max(0, Math.min(STAT_MAX, value))]))
export function resolveEventChoice(choice) {
  if (!choice.outcomes?.length) return choice
  const totalWeight = choice.outcomes.reduce((total, outcome) => total + outcome.weight, 0)
  let roll = Math.random() * totalWeight
  const outcome = choice.outcomes.find((item) => {
    if (roll < item.weight) return true
    roll -= item.weight
    return false
  }) ?? choice.outcomes.at(-1)
  return { ...choice, effects: outcome.effects, result: outcome.result }
}
export function trainingFailureRate(stamina) {
  if (stamina <= 0) return 100
  if (stamina <= 10) return 80
  if (stamina <= 20) return 50
  if (stamina <= 30) return 25
  if (stamina <= 40) return 10
  return 0
}

export function runTraining(game, selectedId = null, context = {}) {
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
  const phaseMultiplier = phaseTrainingMultiplier[context.phaseId] ?? 1
  const campMultiplier = context.summerCamp ? 1.35 : 1
  const gains = Object.fromEntries(Object.entries(training.gains).map(([stat, [min, max]]) => [stat, Math.round(rng(min, max) * phaseMultiplier * campMultiplier)]))
  return { id: training.id, label: training.label, gains, before, after: Math.max(0, before - training.staminaCost), conditionChange: 0, failed: false, forceRestNext: false, failureRate, summerCamp: Boolean(context.summerCamp), phaseMultiplier, message: `${training.label} 훈련을 진행했다.` }
}

export function applyEffects(game, effects) {
  const stats = { ...game.stats }
  Object.entries(effects.stats ?? {}).forEach(([stat, amount]) => { stats[stat] += amount })
  return { ...game, stats: clampStats(stats), stamina: Math.max(0, Math.min(100, game.stamina + (effects.stamina ?? 0))), fans: game.fans + (effects.fans ?? 0), condition: conditionFrom(game.condition, effects.condition ?? 0) }
}

export function calculateRaceGrowth(race, finish) {
  const placement = placementGrowthMultiplier[finish] ?? placementGrowthMultiplier.default
  const grade = gradeGrowthMultiplier[race.grade] ?? 1
  return Object.fromEntries(Object.entries(race.growthProfile).map(([stat, base]) => [stat, Math.max(1, Math.round(base * placement * grade) * 2)]))
}

const lossCopy = {
  Speed: ['스피드 부족', '마지막 직선에서 선두권의 속도를 따라가지 못했습니다.'],
  Stamina: ['스태미나 부족', '레이스 후반으로 갈수록 체력이 떨어지며 페이스가 무너졌습니다.'],
  Power: ['파워 부족', '가속과 추월 싸움에서 힘을 발휘하지 못했습니다.'],
  Guts: ['근성 부족', '마지막 승부처에서 버티지 못하고 순위를 내줬습니다.'],
  Wisdom: ['지능 부족', '페이스 조절과 위치 선정이 좋지 않아 불리한 전개가 이어졌습니다.'],
}
const statNames = { Speed: '스피드', Stamina: '스태미나', Power: '파워', Guts: '근성', Wisdom: '지능' }

function analyzeLoss({ game, race, finish, lateStart, recoverySuccess, leadLimit, randomFactor, conditionPenalty }) {
  const statDeficits = Object.fromEntries(Object.entries(race.statWeights).map(([stat, weight]) => {
    const deficit = Math.max(0, race.difficulty - game.stats[stat])
    return [stat, { current: game.stats[stat], target: race.difficulty, deficit, weight, weightedDeficit: deficit * weight }]
  }))
  const biggestStat = Object.entries(statDeficits).sort(([, a], [, b]) => b.weightedDeficit - a.weightedDeficit)[0]
  const staminaDeficit = Math.max(0, (race.staminaRequirement ?? 0) - game.stats.Stamina)
  const lateStartBlockedLead = lateStart && !recoverySuccess
  const make = (id, title, description, detail = null) => ({ id, title, description, detail })
  let primaryLossReason = null

  if (finish > 1) {
    if (staminaDeficit > 0) {
      const isTennoSpring = race.id === 'tenno-sho-spring'
      primaryLossReason = make('stamina-requirement', '스태미나 부족', isTennoSpring ? '긴 거리에서 체력을 지나치게 소모했습니다. 마지막 구간에서 페이스를 유지하지 못했습니다.' : '장거리 레이스를 끝까지 버티기에는 스태미나가 부족했습니다.', `현재 스태미나: ${game.stats.Stamina} · 1착 요구 수준: ${race.staminaRequirement}`)
    } else if (lateStartBlockedLead) {
      primaryLossReason = make('late-start', '늦은 출발', '출발이 늦어 선행 포지션을 잡지 못했습니다. 초반부터 불리한 위치에서 레이스를 진행했습니다.')
    } else if (['저조', '최악'].includes(game.condition) && conditionPenalty > (biggestStat?.[1].weightedDeficit ?? 0)) {
      primaryLossReason = make('condition', '컨디션 난조', '좋지 않은 컨디션 때문에 평소의 능력을 충분히 발휘하지 못했습니다.')
    } else if ((biggestStat?.[1].weightedDeficit ?? 0) > race.difficulty * 0.04) {
      const [stat, data] = biggestStat
      const [title, description] = lossCopy[stat]
      primaryLossReason = make(stat.toLowerCase(), title, description, `현재 ${statNames[stat]}: ${data.current} · 권장 수준: ${data.target}`)
    } else {
      primaryLossReason = make('close-race', '아쉬운 전개', '전체적인 능력은 충분했습니다. 마지막 승부에서 근소한 차이로 밀렸습니다.')
    }
  }
  return { primaryLossReason, secondaryLossReason: null, lateStartOccurred: lateStart, lateStartRecoverySucceeded: recoverySuccess, leadGroupLimit: leadLimit, staminaDeficit, statDeficits, conditionPenalty, randomFactor }
}

export function simulateRace(game, race) {
  const conditionBonus = getConditionIndex(game.condition) * 7
  const base = Object.entries(race.statWeights).reduce((sum, [stat, weight]) => sum + game.stats[stat] * weight, 0)
  const g1Wins = game.raceResults?.filter((result) => result.grade === 'G1' && result.finish === 1).length ?? 0
  const arimaBonus = race.finalBoss ? Math.min(3, g1Wins) / 100 : 0
  const strategy = raceStrategies[game.raceStrategy] ?? raceStrategies.LEADER
  const leadLimit = leadGroupLimit(strategy, race.entrants)
  const lateStart = Math.random() < wisdomChance(strategy.lateStartChances, game.stats.Wisdom)
  const lateStartMax = Math.max(leadLimit + 1, Math.ceil(race.entrants * .75))
  const start = lateStart ? rng(leadLimit + 1, lateStartMax) : rng(1, leadLimit)
  const recoverySuccess = lateStart && Math.random() < wisdomChance(strategy.recoveryChances, game.stats.Wisdom)
  const mid = lateStart ? (recoverySuccess ? rng(1, leadLimit) : Math.max(leadLimit + 1, start - rng(0, 2))) : rng(1, leadLimit)
  const randomFactor = rng(-Math.round(race.difficulty * .07), Math.round(race.difficulty * .07))
  const lateStartPenalty = lateStart && !recoverySuccess ? Math.round(race.difficulty * .025) : 0
  const score = (base + conditionBonus) * (1 + arimaBonus) + randomFactor - lateStartPenalty
  const normalized = Math.max(0, Math.min(1, (score - race.difficulty * .55) / (race.difficulty * .5)))
  let finish = Math.max(1, Math.min(race.entrants, race.entrants - Math.round(normalized * (race.entrants - 1))))
  const staminaShortage = Boolean(race.staminaRequirement && game.stats.Stamina < race.staminaRequirement)
  if (staminaShortage) {
    const gap = race.staminaRequirement - game.stats.Stamina
    finish = Math.max(2, finish)
    if (gap > 150) finish = Math.max(finish, Math.min(race.entrants, 7))
    else if (gap > 50) finish = Math.max(finish, 4)
  }
  const raceStamina = Math.max(15, Math.min(98, 100 - Math.round((race.distanceType === 'LONG' ? 48 : 34) - game.stats.Stamina / 18)))
  const growth = calculateRaceGrowth(race, finish)
  const fans = Math.round(race.fansBase * (race.entrants - finish + 1) / race.entrants)
  const lossAnalysis = analyzeLoss({ game, race, finish, lateStart, recoverySuccess, leadLimit, randomFactor, conditionPenalty: Math.max(0, (2 - getConditionIndex(game.condition)) * 7) })
  return { ...race, finish, score, entrants: race.entrants, growth, fans, lateStartPenalty, ...lossAnalysis, logs: [
    { phase: '출전표', text: `${race.name} · ${race.grade} · ${race.distance}\n총 ${race.entrants}명의 우마무스메가 출전한다.\n맥퀸이 게이트 안에서 집중하고 있다.`, rank: null, stamina: null },
    { phase: 'START', text: lateStart ? '출발이 조금 늦었다! 맥퀸이 예상보다 뒤쪽에서 레이스를 시작한다.' : '출발 신호! 맥퀸이 선두 바로 뒤에 자리를 잡는다.', rank: start, stamina: 91 },
    { phase: '초반', text: lateStart ? '출발이 조금 늦었다!\n맥퀸이 예상보다 뒤쪽에서 레이스를 시작한다.' : '맥퀸은 좋은 출발을 보였다.\n선두 바로 뒤에 자리를 잡는다.', rank: start, stamina: 78 },
    { phase: '중반', text: lateStart ? (recoverySuccess ? `맥퀸이 바깥쪽에서 서서히 순위를 올린다.\n선두 그룹 복귀 성공! ${start}위 → ${mid}위` : `앞이 막혀 좀처럼 자리를 잡지 못한다.\n맥퀸은 아직 중단에 머물러 있다. ${start}위 → ${mid}위`) : staminaShortage ? '선두 그룹에서 페이스를 유지하려 하지만 체력이 빠르게 떨어진다.\n스태미나 부족! 맥퀸은 호흡을 가다듬는다.' : '맥퀸은 선두 그룹에서 안정적으로 페이스를 유지하고 있다.', rank: mid, stamina: raceStamina },
    { phase: '최종 직선', text: `맥퀸이 스퍼트를 시작했다!\n${mid}위 → ${finish}위, 선두를 추격한다!`, rank: finish, stamina: Math.max(15, raceStamina - 28) },
    { phase: '결과', text: finish === 1 ? '맥퀸이 결승선을 가장 먼저 통과했다!' : `맥퀸이 ${finish}위로 결승선을 통과했다.`, rank: finish, stamina: 0 },
  ] }
}

