export const events = [
  { title: '금단의 디저트', text: '은은한 향기를 따라가니, 최고급 디저트가 눈앞에 놓여 있다.', choices: [
    { label: '오늘만은 즐기자', hint: '체력 회복 / 컨디션 상승 가능', effects: { stamina: 18, condition: 1, stats: { Guts: 2 } }, result: '달콤한 휴식으로 기분이 한결 가벼워졌다.' },
    { label: '품격 있게 참는다', hint: '스태미나 상승 가능', effects: { stats: { Stamina: 5 } }, result: '절제하는 마음이 장거리의 밑거름이 되었다.' },
  ]},
  { title: '아침 산책', text: '이른 아침, 맥퀸이 산책을 제안했다.', choices: [
    { label: '함께 천천히 걷는다', hint: '체력 회복 / 지능 상승 가능', effects: { stamina: 10, stats: { Wisdom: 4 } }, result: '차분한 대화 덕분에 마음까지 정리되었다.' },
    { label: '가벼운 조깅으로 바꾼다', hint: '스피드 상승 / 체력 소모', effects: { stamina: -6, stats: { Speed: 5 } }, result: '상쾌한 아침 공기를 가르며 발걸음이 빨라졌다.' },
  ]},
  { title: '지나친 특훈', text: '맥퀸이 평소보다 훨씬 강한 훈련을 원한다.', choices: [
    { label: '도전을 받아들인다', hint: '능력치 크게 상승 / 체력 소모', effects: { stamina: -18, stats: { Stamina: 7, Guts: 5 } }, result: '한계를 넘은 훈련은 확실한 자신감이 되었다.' },
    { label: '오늘은 조절한다', hint: '체력 유지 / 컨디션 상승 가능', effects: { condition: 1, stats: { Wisdom: 3 } }, result: '페이스 조절도 훌륭한 트레이닝이다.' },
  ]},
  { title: '명문가의 품격', text: '격식 있는 모임에 초대장이 도착했다.', choices: [
    { label: '참석해 경험을 쌓는다', hint: '지능 상승 / 팬 증가', effects: { fans: 180, stats: { Wisdom: 5 } }, result: '우아한 모습에 새로운 팬들이 생겼다.' },
    { label: '훈련에 집중한다', hint: '파워 상승 / 체력 소모', effects: { stamina: -8, stats: { Power: 5 } }, result: '조용한 집중이 단단한 힘으로 바뀌었다.' },
  ]},
  { title: '다이어트 선언', text: '맥퀸이 식단을 더 엄격히 관리하겠다고 한다.', choices: [
    { label: '균형 잡힌 식단을 제안한다', hint: '컨디션 상승 / 스태미나 상승', effects: { condition: 1, stats: { Stamina: 4 } }, result: '건강한 식사가 안정적인 리듬을 만들었다.' },
    { label: '의지를 믿고 맡긴다', hint: '스피드 상승 / 체력 감소 가능', effects: { stamina: -10, stats: { Speed: 5 } }, result: '몸은 가벼워졌지만 배가 조금 고프다.' },
  ]},
  { title: '발목의 이상', text: '훈련 중 맥퀸이 발목에 작은 불편함을 느꼈다.', choices: [
    { label: '즉시 휴식을 취한다', hint: '체력 회복 / 컨디션 회복', effects: { stamina: 15, condition: 1 }, result: '적절한 휴식으로 불편함은 금세 사라졌다.' },
    { label: '상태를 보며 이어간다', hint: '파워 상승 / 컨디션 하락 가능', effects: { condition: -1, stats: { Power: 6 } }, result: '무리하지 않은 집중 훈련을 마쳤다.' },
  ]},
  { title: '우아한 티타임', text: '훈련 후, 따뜻한 차와 함께 잠시 쉬자는 제안이 왔다.', choices: [
    { label: '차를 마시며 쉰다', hint: '체력 회복 / 지능 상승', effects: { stamina: 13, stats: { Wisdom: 3 } }, result: '향긋한 한 잔이 피로를 녹여 주었다.' },
    { label: '팬들과 인사한다', hint: '팬 증가 / 근성 상승', effects: { fans: 250, stats: { Guts: 3 } }, result: '응원에 답하며 다시 마음을 다잡았다.' },
  ]},
  { title: '트레이너와의 언쟁', text: '훈련 방향을 두고 맥퀸과 의견이 엇갈렸다.', choices: [
    { label: '차분히 이유를 설명한다', hint: '지능 상승 / 컨디션 상승', effects: { condition: 1, stats: { Wisdom: 5 } }, result: '서로의 생각을 이해하며 더 좋은 계획을 세웠다.' },
    { label: '강하게 밀어붙인다', hint: '근성 상승 / 컨디션 하락', effects: { condition: -1, stats: { Guts: 6 } }, result: '뜨거운 마음은 남았지만 조금 지쳤다.' },
  ]},
  { title: '장거리의 재능', text: '긴 거리 훈련에서 맥퀸의 호흡이 유난히 안정적이다.', choices: [
    { label: '롱런 훈련을 늘린다', hint: '스태미나 크게 상승 / 체력 소모', effects: { stamina: -13, stats: { Stamina: 8 } }, result: '긴 주로 끝까지 흔들리지 않는 호흡을 찾았다.' },
    { label: '리듬을 분석한다', hint: '지능 상승 / 스태미나 상승', effects: { stats: { Wisdom: 4, Stamina: 3 } }, result: '자신만의 페이스를 이해하게 되었다.' },
  ]},
  { title: '승부욕', text: '다른 트레센의 우마무스메가 맥퀸에게 도전장을 보냈다.', choices: [
    { label: '모의 대결을 수락한다', hint: '파워 상승 / 근성 상승 / 체력 소모', effects: { stamina: -12, stats: { Power: 4, Guts: 4 } }, result: '팽팽한 경쟁이 더 강한 추진력이 되었다.' },
    { label: '본선에 집중한다', hint: '컨디션 상승 / 스피드 상승', effects: { condition: 1, stats: { Speed: 3 } }, result: '시선은 오직 다음 레이스를 향했다.' },
  ]},
  { title: '맥퀸의 친구', text: '골드쉽이 맥퀸과 놀러가겠다고 한다.', choices: [
    { label: '허락한다', hint: '좋은 시간을 보낼 수도 있다', outcomes: [
      { weight: 50, effects: { stamina: 3, stats: { Stamina: 5 } }, result: '즐거운 외출 덕분에 맥퀸의 기분과 컨디션이 한결 가벼워졌다.' },
      { weight: 50, effects: { stamina: -10 }, result: '골드쉽의 예측 불가한 하루에 맥퀸은 꽤 지쳐 버렸다.' },
    ]},
    { label: '안 된다', hint: '오늘은 훈련에 집중한다', effects: {}, result: '맥퀸은 아쉬움을 뒤로하고 오늘의 훈련에 집중했다.' },
  ]},
  { title: '테이오의 의지', text: '테이오의 분발을 보고 맥퀸도 흥분했다.', phases: ['CLASSIC', 'SENIOR'], choices: [
    { label: '응원한다', hint: '의욕을 살릴 것 같다', outcomes: [
      { weight: 50, effects: { stats: { Power: 20 } }, result: '테이오의 의지에 자극받아 강한 추진력을 얻었다.' },
      { weight: 50, effects: { stats: { Power: 10 } }, result: '응원의 열기가 맥퀸의 발걸음에 힘을 실어 주었다.' },
    ]},
    { label: '진정시킨다', hint: '흥분은 금물', effects: { stamina: 10 }, result: '차분히 마음을 가라앉히며 체력을 회복했다.' },
  ]},
  { title: '라이스의 상담', text: '맥퀸은 라이스와 심각한 레이스 토론 중이다.', phases: ['SENIOR'], choices: [
    { label: '조언한다', hint: '의욕을 살릴 것 같다', outcomes: [
      { weight: 50, effects: { stats: { Speed: 10 } }, result: '서로의 의견을 나누며 더 빠른 레이스 감각을 얻었다.' },
      { weight: 50, effects: { stats: { Power: 10 } }, result: '레이스의 핵심을 짚어 주며 추월에 필요한 힘을 다졌다.' },
    ]},
    { label: '아무 말 하지 않는다', hint: '침묵은 금이다', effects: { stamina: 5 }, result: '잠시 조용히 생각을 정리하며 피로를 덜었다.' },
  ]},
  { title: '라이언의 헬스 트레이닝', text: '맥퀸이 라이언과 근육 훈련을 하겠다고 한다.', phases: ['CLASSIC'], choices: [
    { label: '필요하다', hint: 'PT는 효과가 있다', outcomes: [
      { weight: 50, effects: { stats: { Stamina: 10 } }, result: '탄탄한 기초 체력을 다지며 장거리를 버틸 힘을 길렀다.' },
      { weight: 50, effects: { stats: { Power: 10 } }, result: '라이언의 조언 덕분에 한층 강한 추진력을 얻었다.' },
    ]},
    { label: '불필요하다', hint: '쉬는 게 좋다', effects: { stamina: 10 }, result: '무리하지 않고 휴식을 선택해 체력을 회복했다.' },
  ]},
  { id: 'stamina-battle', title: '스태미나 배틀', text: '나세씨가 슈퍼 크릭과 맥퀸의 병주를 요청했다.', once: true, choices: [
    { label: '허락한다', hint: '좋은 장거리 배틀이다', outcomes: [
      { weight: 50, effects: { stamina: -10, stats: { Stamina: 35 } }, result: '슈퍼 크릭과의 치열한 병주를 끝까지 버텨내며 놀라운 지구력을 얻었다.' },
      { weight: 50, effects: { stamina: -10, stats: { Stamina: 20 } }, result: '힘겨운 병주였지만, 장거리를 위한 단단한 기초를 쌓았다.' },
    ]},
    { label: '쉬어야 한다', hint: '체력을 아껴야 한다', effects: { stamina: 15 }, result: '다음 훈련을 위해 체력을 아끼기로 했다.' },
  ]},
]

export const eligibleEvents = (phaseId, usedEventIds = []) => events.filter((event) => (!event.phases || event.phases.includes(phaseId)) && (!event.once || !usedEventIds.includes(event.id)))
