import { FRIENDSHIP_TRAINING_CHANCE, FRIENDSHIP_TRAINING_MULTIPLIER, trainings } from '../data/trainings.js'
import { gradeGrowthMultiplier, placementGrowthMultiplier } from '../data/races.js'
import { phaseTrainingMultiplier, STAT_MAX } from '../data/seasons.js'
import { leadGroupLimit, raceStrategies, wisdomChance } from '../data/raceStrategies.js'
import { pickRaceCommentary, pickSpecificVictory, raceSpecificVictory } from '../data/raceCommentary.js'

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
    return { id: training.id, label: training.label, gains, before, after: Math.max(0, before - 5), conditionChange: Math.random() < 0.2 ? -1 : 0, failed: true, forceRestNext: before === 0, failureRate, friendshipTraining: context.friendshipTraining === training.id, message: `${training.label} 훈련에 실패했다.` }
  }
  const phaseMultiplier = phaseTrainingMultiplier[context.phaseId] ?? 1
  const campMultiplier = context.summerCamp ? 1.35 : 1
  const friendshipTraining = context.friendshipTraining === training.id
  const friendshipMultiplier = friendshipTraining ? FRIENDSHIP_TRAINING_MULTIPLIER : 1
  const gains = Object.fromEntries(Object.entries(training.gains).map(([stat, [min, max]]) => [stat, Math.round(rng(min, max) * phaseMultiplier * campMultiplier * friendshipMultiplier)]))
  return { id: training.id, label: training.label, gains, before, after: Math.max(0, Math.min(100, before - training.staminaCost)), conditionChange: 0, failed: false, forceRestNext: false, failureRate, summerCamp: Boolean(context.summerCamp), friendshipTraining, phaseMultiplier, message: `${training.label} 훈련을 진행했다.` }
}

export function rollFriendshipTraining() {
  if (Math.random() >= FRIENDSHIP_TRAINING_CHANCE) return null
  return trainings[Math.floor(Math.random() * trainings.length)].id
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

const clampRank = (rank, entrants) => Math.max(1, Math.min(entrants, rank))
const moveRank = (from, to, fraction, entrants) => clampRank(Math.round(from + (to - from) * fraction), entrants)
const positionChange = (previous, current) => current < previous ? 'up' : current > previous ? 'down' : 'hold'

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
  const early = start
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
  const late = moveRank(mid, finish, staminaShortage ? .48 : .3, race.entrants)
  const finalCorner = moveRank(late, finish, staminaShortage ? .62 : .48, race.entrants)
  const finalStraight = moveRank(finalCorner, finish, .72, race.entrants)
  const positions = { start, early, mid, late, finalCorner, finalStraight, finish }
  const raceStamina = Math.max(15, Math.min(98, 100 - Math.round((race.distanceType === 'LONG' ? 48 : 34) - game.stats.Stamina / 18)))
  const growth = calculateRaceGrowth(race, finish)
  const fans = Math.round(race.fansBase * (race.entrants - finish + 1) / race.entrants)
  const lossAnalysis = analyzeLoss({ game, race, finish, lateStart, recoverySuccess, leadLimit, randomFactor, conditionPenalty: Math.max(0, (2 - getConditionIndex(game.condition)) * 7) })
  const lossId = lossAnalysis.primaryLossReason?.id
  const victoryType = finish !== 1 ? null : finalCorner - finish >= 2 ? 'COMEBACK' : score >= race.difficulty * 1.15 ? 'DOMINANT' : !lateStart && early <= leadLimit && mid <= leadLimit ? 'FRONT_RUNNING' : Math.abs(score - race.difficulty) < race.difficulty * .08 ? 'CLOSE' : 'NORMAL'
  const midKey = positionChange(early, mid)
  const lateKey = staminaShortage ? 'stamina' : positionChange(mid, late) === 'up' ? 'strong' : 'neutral'
  const cornerKey = staminaShortage || (['power', 'wisdom'].includes(lossId) && positionChange(late, finalCorner) !== 'up') ? 'blocked' : positionChange(late, finalCorner) === 'up' ? 'accelerate' : 'good'
  const straightKey = (staminaShortage || lossId === 'speed') && positionChange(finalCorner, finalStraight) !== 'up' ? 'fade' : finalStraight === 1 ? 'lead' : positionChange(finalCorner, finalStraight) === 'up' ? 'chase' : 'hold'
  const finishText = finish === 1
    ? `${pickRaceCommentary('victory', victoryType === 'NORMAL' ? 'general' : victoryType)}\n${raceSpecificVictory[race.id] && Math.random() < .7 ? pickSpecificVictory(race.id) : pickRaceCommentary('victory', 'general')}`
    : pickRaceCommentary('finish', finish === 2 ? 'second' : finish === 3 ? 'third' : finish <= 5 ? 'upper' : 'lower')
  const logs = [
    { phase: 'START', text: pickRaceCommentary('start', lateStart ? 'late' : 'normal'), rank: start, stamina: 100 },
    { phase: '초반', text: pickRaceCommentary('early', lateStart ? 'rear' : 'lead'), rank: early, stamina: 88 },
    { phase: '중반', text: pickRaceCommentary('mid', lateStart && recoverySuccess ? 'up' : midKey), rank: mid, stamina: raceStamina },
    { phase: '후반', text: pickRaceCommentary('late', lateKey), rank: late, stamina: Math.max(20, raceStamina - 14) },
    { phase: '최종 코너', text: pickRaceCommentary('corner', cornerKey), rank: finalCorner, stamina: Math.max(16, raceStamina - 25) },
    { phase: '최종 직선', text: pickRaceCommentary('straight', straightKey), rank: finalStraight, stamina: Math.max(12, raceStamina - 34) },
    { phase: 'FINISH', text: finishText, rank: finish, stamina: 0 },
  ]
  return { ...race, finish, score, entrants: race.entrants, growth, fans, lateStartPenalty, positions, staminaTrouble: staminaShortage, victoryType, commentaryHistory: logs.map((log) => log.text), ...lossAnalysis, logs }
}

