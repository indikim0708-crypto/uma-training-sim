export const STAT_MAX = 1200

export const phaseTrainingMultiplier = { JUNIOR: 1, CLASSIC: 1.1, SENIOR: 1.2 }

export const isSummerCamp = (phaseId, month) => ['CLASSIC', 'SENIOR'].includes(phaseId) && month >= 7 && month <= 8
export const isSummerCampStart = (phaseId, month, half) => isSummerCamp(phaseId, month) && month === 7 && half === 'EARLY'
export const isSummerCampEnd = (phaseId, month, half) => isSummerCamp(phaseId, month) && month === 8 && half === 'LATE'
