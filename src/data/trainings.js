export const trainings = [
  { id: 'Speed', label: '스피드', weight: 25, staminaCost: 14, gains: { Speed: [8, 12], Power: [1, 3] } },
  { id: 'Stamina', label: '스태미나', weight: 35, staminaCost: 12, gains: { Stamina: [9, 13], Guts: [1, 3] } },
  { id: 'Power', label: '파워', weight: 15, staminaCost: 15, gains: { Power: [8, 12], Speed: [1, 2] } },
  { id: 'Guts', label: '근성', weight: 10, staminaCost: 16, gains: { Guts: [8, 12], Stamina: [1, 2] } },
  { id: 'Wisdom', label: '지능', weight: 15, staminaCost: 8, gains: { Wisdom: [8, 12], Speed: [1, 2] } },
]

export const restTraining = { id: 'Rest', label: '휴식', hint: '체력 회복 · 컨디션 상승 가능' }
