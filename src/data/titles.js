const won = (summary, raceId) => summary.wonRaceIds.has(raceId)
const g1Record = (summary) => `현재 기록: G1 ${summary.g1Wins}승`
const statRecord = (stat, label) => (summary) => `현재 ${label}: ${summary.stats[stat]}`

export const titleDefinitions = [
  { id: 'g1-7-wins', name: '7관의 전설', priority: 1007, requirementText: 'G1 레이스 7승 달성', currentRecord: g1Record, condition: (s) => s.g1Wins >= 7 },
  { id: 'g1-6-wins', name: '6관의 지배자', priority: 1006, requirementText: 'G1 레이스 6승 이상 달성', currentRecord: g1Record, condition: (s) => s.g1Wins >= 6 },
  { id: 'g1-5-wins', name: '왕도의 패자', priority: 1005, requirementText: 'G1 레이스 5승 이상 달성', currentRecord: g1Record, condition: (s) => s.g1Wins >= 5 },
  { id: 'g1-4-wins', name: 'G1 킬러', priority: 1004, requirementText: 'G1 레이스 4승 이상 달성', currentRecord: g1Record, condition: (s) => s.g1Wins >= 4 },
  { id: 'g1-3-wins', name: 'G1 헌터', priority: 1003, requirementText: 'G1 레이스 3승 이상 달성', currentRecord: g1Record, condition: (s) => s.g1Wins >= 3 },
  { id: 'g1-2-wins', name: '다관의 귀공자', priority: 1002, requirementText: 'G1 레이스 2승 이상 달성', currentRecord: g1Record, condition: (s) => s.g1Wins >= 2 },
  { id: 'g1-1-win', name: 'G1 위너', priority: 1001, requirementText: 'G1 레이스 첫 승 달성', currentRecord: g1Record, condition: (s) => s.g1Wins >= 1 },
  { id: 'long-distance-king', name: '장거리의 제왕', priority: 800, requirementText: '국화상과 천황상(봄) 모두 우승', condition: (s) => won(s, 'kikuka-sho') && won(s, 'tenno-sho-spring') },
  { id: 'spring-autumn-emperor', name: '봄가을의 천황', priority: 790, requirementText: '천황상(봄)과 천황상(가을) 모두 우승', condition: (s) => won(s, 'tenno-sho-spring') && won(s, 'tenno-sho-autumn') },
  { id: 'grand-prix-queen', name: '그랑프리의 여왕', priority: 780, requirementText: '시니어급 아리마 기념 우승', condition: (s) => won(s, 'arima-kinen') },
  { id: 'spring-shield', name: '봄의 방패를 거머쥔 자', priority: 770, requirementText: '천황상(봄) 우승', condition: (s) => won(s, 'tenno-sho-spring') },
  { id: 'chrysanthemum-crown', name: '국화의 왕관', priority: 760, requirementText: '국화상 우승', condition: (s) => won(s, 'kikuka-sho') },
  { id: 'golden-generation-start', name: '황금 세대의 시작', priority: 750, requirementText: '호프풀 스테이크스 우승', condition: (s) => won(s, 'hopeful-stakes') },
  { id: 'speed-noble', name: '질풍의 귀공자', priority: 500, requirementText: '스피드 1100 이상 달성', currentRecord: statRecord('Speed', '스피드'), condition: (s) => s.stats.Speed >= 1100 },
  { id: 'infinite-stamina', name: '무한의 스태미나', priority: 490, requirementText: '스태미나 1200 달성', currentRecord: statRecord('Stamina', '스태미나'), condition: (s) => s.stats.Stamina >= 1200 },
  { id: 'steel-drive', name: '강철의 추진력', priority: 480, requirementText: '파워 1000 이상 달성', currentRecord: statRecord('Power', '파워'), condition: (s) => s.stats.Power >= 1000 },
  { id: 'indomitable-heart', name: '불굴의 심장', priority: 470, requirementText: '근성 800 이상 달성', currentRecord: statRecord('Guts', '근성'), condition: (s) => s.stats.Guts >= 800 },
  { id: 'perfect-race-management', name: '완벽한 레이스 운영', priority: 460, requirementText: '지능 900 이상 달성', currentRecord: statRecord('Wisdom', '지능'), condition: (s) => s.stats.Wisdom >= 900 },
  { id: 'silver-collector', name: '은빛 수집가', priority: 200, requirementText: '2착 4회 이상, G1 우승 0회', currentRecord: (s) => `현재 기록: 2착 ${s.secondPlaces}회 / G1 ${s.g1Wins}승`, condition: (s) => s.secondPlaces >= 4 && s.g1Wins === 0 },
  { id: 'participation-matters', name: '참가에 의의를', priority: 190, requirementText: '7회 이상 출전하고 한 번도 우승하지 못함', currentRecord: (s) => `현재 기록: ${s.starts}전 ${s.totalWins}승`, condition: (s) => s.totalWins === 0 && s.starts >= 7 },
]
