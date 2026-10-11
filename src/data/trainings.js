export const trainings = [
  { id: 'Speed', label: '스피드', weight: 25, staminaCost: 14, gains: { Speed: [18, 28], Power: [3, 7] } },
  { id: 'Stamina', label: '스태미나', weight: 35, staminaCost: 12, gains: { Stamina: [18, 28], Guts: [3, 7] } },
  { id: 'Power', label: '파워', weight: 15, staminaCost: 15, gains: { Power: [18, 28], Stamina: [3, 7] } },
  { id: 'Guts', label: '근성', weight: 10, staminaCost: 16, gains: { Guts: [18, 28], Speed: [3, 6], Power: [3, 6] } },
  { id: 'Wisdom', label: '지능', weight: 15, staminaCost: -10, gains: { Wisdom: [16, 24], Speed: [2, 5] } },
]

export const FRIENDSHIP_TRAINING_CHANCE = 0.5
export const FRIENDSHIP_TRAINING_MULTIPLIER = 2
export const restTraining = { id: 'Rest', label: '휴식', hint: '체력 회복 · 컨디션 상승 가능' }
