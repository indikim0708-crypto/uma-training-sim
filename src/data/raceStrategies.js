export const raceStrategies = {
  LEADER: {
    label: '선행',
    leadGroupRatio: 0.3,
    lateStartChances: [
      { maxWisdom: 199, chance: 0.15 },
      { maxWisdom: 399, chance: 0.10 },
      { maxWisdom: 599, chance: 0.06 },
      { maxWisdom: 799, chance: 0.03 },
      { maxWisdom: Infinity, chance: 0.01 },
    ],
    recoveryChances: [
      { maxWisdom: 199, chance: 0.35 },
      { maxWisdom: 399, chance: 0.5 },
      { maxWisdom: 599, chance: 0.65 },
      { maxWisdom: 799, chance: 0.8 },
      { maxWisdom: Infinity, chance: 0.9 },
    ],
  },
}

export const leadGroupLimit = (strategy, entrants) => Math.max(1, Math.ceil(entrants * strategy.leadGroupRatio))
export const wisdomChance = (bands, wisdom) => bands.find((band) => wisdom <= band.maxWisdom)?.chance ?? bands.at(-1).chance
