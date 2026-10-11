const mediumWeights = { Speed: .35, Stamina: .10, Power: .30, Guts: .10, Wisdom: .15 }
const longWeights = { Speed: .22, Stamina: .38, Power: .18, Guts: .14, Wisdom: .08 }
const arimaWeights = { Speed: .30, Stamina: .25, Power: .20, Guts: .15, Wisdom: .10 }

export const phases = [{ id: 'JUNIOR', label: '주니어급' }, { id: 'CLASSIC', label: '클래식급' }, { id: 'SENIOR', label: '시니어급' }]
export const placementGrowthMultiplier = { 1: 1, 2: .8, 3: .65, 4: .45, 5: .45, default: .25 }
export const gradeGrowthMultiplier = { DEBUT: .55, G3: .7, G2: .9, G1: 1.2 }

export const raceSchedule = [
  { id: 'debut', name: '데뷔전', phase: 'JUNIOR', month: 6, half: 'LATE', type: 'REQUIRED', grade: 'DEBUT', distance: '2000m', distanceType: 'MEDIUM', surface: '잔디', entrants: 6, difficulty: 135, statWeights: mediumWeights, growthProfile: { Speed: 5, Power: 4, Wisdom: 2 }, fansBase: 500 },
  { id: 'hopeful-stakes', name: '호프풀 스테이크스', phase: 'JUNIOR', month: 12, half: 'LATE', type: 'OPTIONAL', grade: 'G1', distance: '2000m', distanceType: 'MEDIUM', entrants: 8, difficulty: 225, statWeights: mediumWeights, growthProfile: { Speed: 7, Power: 6, Stamina: 3, Wisdom: 2 }, fansBase: 4800, optionalDecisionText: '첫 G1 무대, 호프풀 스테이크스에 출전할까요?' },
  { id: 'takarazuka-classic', name: '타카라즈카 기념', phase: 'CLASSIC', month: 6, half: 'LATE', type: 'OPTIONAL', grade: 'G1', distance: '2200m', distanceType: 'MEDIUM', entrants: 10, difficulty: 355, statWeights: mediumWeights, growthProfile: { Speed: 9, Power: 8, Stamina: 4, Wisdom: 3 }, fansBase: 12000, optionalDecisionText: '강호들이 모이는 타카라즈카 기념에 도전할까요?' },
  { id: 'kobe-shimbun-hai', name: '고베 신문배', phase: 'CLASSIC', month: 9, half: 'LATE', type: 'REQUIRED', grade: 'G2', distance: '2400m', distanceType: 'MEDIUM', entrants: 9, difficulty: 390, statWeights: mediumWeights, growthProfile: { Speed: 8, Power: 7, Stamina: 5, Wisdom: 2 }, fansBase: 9000 },
  { id: 'kikuka-sho', name: '국화상', phase: 'CLASSIC', month: 10, half: 'LATE', type: 'REQUIRED', grade: 'G1', distance: '3000m', distanceType: 'LONG', entrants: 12, difficulty: 455, statWeights: longWeights, growthProfile: { Stamina: 12, Guts: 6, Speed: 3 }, fansBase: 20000, staminaRequirement: 400 },
  { id: 'tenno-sho-spring', name: '천황상(봄)', phase: 'SENIOR', month: 4, half: 'LATE', type: 'REQUIRED', grade: 'G1', distance: '3200m', distanceType: 'LONG', entrants: 12, difficulty: 625, statWeights: longWeights, growthProfile: { Stamina: 14, Guts: 7, Speed: 4 }, fansBase: 32000, staminaRequirement: 600 },
  { id: 'takarazuka-senior', name: '타카라즈카 기념', phase: 'SENIOR', month: 6, half: 'LATE', type: 'REQUIRED', grade: 'G1', distance: '2200m', distanceType: 'MEDIUM', entrants: 12, difficulty: 675, statWeights: mediumWeights, growthProfile: { Speed: 10, Power: 9, Stamina: 4, Wisdom: 3 }, fansBase: 28000 },
  { id: 'tenno-sho-autumn', name: '천황상(가을)', phase: 'SENIOR', month: 10, half: 'LATE', type: 'REQUIRED', grade: 'G1', distance: '2000m', distanceType: 'MEDIUM', entrants: 12, difficulty: 730, statWeights: mediumWeights, growthProfile: { Speed: 11, Power: 9, Stamina: 4, Wisdom: 4 }, fansBase: 34000 },
  { id: 'arima-kinen', name: '아리마 기념', phase: 'SENIOR', month: 12, half: 'LATE', type: 'OPTIONAL', grade: 'G1', distance: '2500m', distanceType: 'LONG', entrants: 14, difficulty: 820, statWeights: arimaWeights, growthProfile: { Speed: 12, Stamina: 10, Power: 8, Guts: 7, Wisdom: 3 }, fansBase: 50000, optionalDecisionText: '3년 육성의 마지막 무대, 아리마 기념에 출전할까요?', finalBoss: true },
]
export const findScheduledRace = (phase, month, half) => raceSchedule.find((race) => race.phase === phase && race.month === month && race.half === half)
