const won = (summary, raceId) => summary.wonRaceIds.has(raceId)

export const titleDefinitions = [
  { id: 'g1-7-wins', name: '7관의 전설', priority: 1007, condition: (s) => s.g1Wins >= 7 },
  { id: 'g1-6-wins', name: '6관의 지배자', priority: 1006, condition: (s) => s.g1Wins === 6 },
  { id: 'g1-5-wins', name: '왕도의 패자', priority: 1005, condition: (s) => s.g1Wins === 5 },
  { id: 'g1-4-wins', name: 'G1 킬러', priority: 1004, condition: (s) => s.g1Wins === 4 },
  { id: 'g1-3-wins', name: 'G1 헌터', priority: 1003, condition: (s) => s.g1Wins === 3 },
  { id: 'g1-2-wins', name: '다관의 귀공자', priority: 1002, condition: (s) => s.g1Wins === 2 },
  { id: 'g1-1-win', name: 'G1 위너', priority: 1001, condition: (s) => s.g1Wins === 1 },
  { id: 'long-distance-king', name: '장거리의 제왕', priority: 800, condition: (s) => won(s, 'kikuka-sho') && won(s, 'tenno-sho-spring') },
  { id: 'spring-autumn-emperor', name: '봄가을의 천황', priority: 790, condition: (s) => won(s, 'tenno-sho-spring') && won(s, 'tenno-sho-autumn') },
  { id: 'grand-prix-queen', name: '그랑프리의 여왕', priority: 780, condition: (s) => won(s, 'arima-kinen') },
  { id: 'spring-shield', name: '봄의 방패를 거머쥔 자', priority: 770, condition: (s) => won(s, 'tenno-sho-spring') },
  { id: 'chrysanthemum-crown', name: '국화의 왕관', priority: 760, condition: (s) => won(s, 'kikuka-sho') },
  { id: 'golden-generation-start', name: '황금 세대의 시작', priority: 750, condition: (s) => won(s, 'hopeful-stakes') },
  { id: 'speed-noble', name: '질풍의 귀공자', priority: 500, condition: (s) => s.stats.Speed >= 1100 },
  { id: 'infinite-stamina', name: '무한의 스태미나', priority: 490, condition: (s) => s.stats.Stamina >= 1200 },
  { id: 'steel-drive', name: '강철의 추진력', priority: 480, condition: (s) => s.stats.Power >= 1000 },
  { id: 'indomitable-heart', name: '불굴의 심장', priority: 470, condition: (s) => s.stats.Guts >= 800 },
  { id: 'perfect-race-management', name: '완벽한 레이스 운영', priority: 460, condition: (s) => s.stats.Wisdom >= 900 },
  { id: 'silver-collector', name: '은빛 수집가', priority: 200, condition: (s) => s.secondPlaces >= 4 && s.g1Wins === 0 },
  { id: 'participation-matters', name: '참가에 의의를', priority: 190, condition: (s) => s.totalWins === 0 && s.starts >= 7 },
]
