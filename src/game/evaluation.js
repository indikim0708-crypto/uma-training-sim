import { racePlacementBonuses, ratingThresholds } from '../data/ratingThresholds.js'
import { titleDefinitions } from '../data/titles.js'

const raceBonus = (result) => (racePlacementBonuses[result.grade] ?? racePlacementBonuses.DEFAULT)[result.finish] ?? 0

export function evaluateRating(game) {
  const statTotal = Object.values(game.stats).reduce((total, value) => total + value, 0)
  const raceBonusTotal = game.raceResults.reduce((total, result) => total + raceBonus(result), 0)
  const score = statTotal + raceBonusTotal
  return { grade: ratingThresholds.find((threshold) => score >= threshold.minScore)?.grade ?? 'C', score, statTotal, raceBonus: raceBonusTotal }
}

export function selectPrimaryTitle(titles) {
  return titles[0] ?? null
}

export function evaluateTitles(game) {
  const results = game.raceResults ?? []
  const summary = {
    stats: game.stats,
    starts: game.starts,
    totalWins: results.filter((result) => result.finish === 1).length,
    g1Wins: results.filter((result) => result.grade === 'G1' && result.finish === 1).length,
    secondPlaces: results.filter((result) => result.finish === 2).length,
    wonRaceIds: new Set(results.filter((result) => result.finish === 1).map((result) => result.id)),
  }
  const earnedTitles = titleDefinitions.filter((title) => title.condition(summary)).sort((a, b) => b.priority - a.priority)
  return { ...summary, earnedTitles, primaryTitle: selectPrimaryTitle(earnedTitles) }
}
