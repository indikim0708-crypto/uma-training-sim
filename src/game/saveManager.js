export const SAVE_KEY = 'uma-training-sim-save-v1'
export const SAVE_VERSION = 1

const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value)

export function validateSaveGame(value) {
  if (!isRecord(value) || value.version !== SAVE_VERSION || !isRecord(value.game)) return false
  const { game } = value
  const validStats = isRecord(game.stats) && ['Speed', 'Stamina', 'Power', 'Guts', 'Wisdom'].every((stat) => isFiniteNumber(game.stats[stat]))
  return validStats && isFiniteNumber(game.turn) && isFiniteNumber(game.stamina) && typeof game.condition === 'string' && Array.isArray(game.raceResults) && Array.isArray(game.skippedRaceIds) && Array.isArray(game.usedEventIds) && typeof value.selectedTraining === 'string' && [1, 2].includes(value.speed)
}

export function saveGame({ game, selectedTraining, speed }) {
  if (typeof window === 'undefined') return false
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify({ version: SAVE_VERSION, savedAt: new Date().toISOString(), game, selectedTraining, speed }))
    return true
  } catch {
    return false
  }
}

export function loadGame() {
  if (typeof window === 'undefined') return { status: 'empty' }
  try {
    const raw = window.localStorage.getItem(SAVE_KEY)
    if (!raw) return { status: 'empty' }
    const save = JSON.parse(raw)
    if (!validateSaveGame(save) || save.game.phase === 'ENDING') {
      window.localStorage.removeItem(SAVE_KEY)
      return { status: 'invalid' }
    }
    const friendshipTrainingType = typeof save.game.friendshipTrainingType === 'string' ? save.game.friendshipTrainingType : null
    const friendshipTrainingRolled = typeof save.game.friendshipTrainingRolled === 'boolean' ? save.game.friendshipTrainingRolled : false
    return { status: 'valid', save: { ...save, game: { ...save.game, friendshipTrainingType, friendshipTrainingRolled } } }
  } catch {
    try { window.localStorage.removeItem(SAVE_KEY) } catch { /* Storage can be unavailable. */ }
    return { status: 'invalid' }
  }
}

export function deleteSaveGame() {
  if (typeof window === 'undefined') return
  try { window.localStorage.removeItem(SAVE_KEY) } catch { /* Storage can be unavailable. */ }
}
