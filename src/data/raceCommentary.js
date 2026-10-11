const recentCommentaryIds = []
const remember = (id) => { recentCommentaryIds.push(id); if (recentCommentaryIds.length > 5) recentCommentaryIds.shift() }

export function pickRaceCommentary(group, key) {
  const candidates = commentaryPools[group]?.[key] ?? commentaryPools[group]?.default ?? []
  const fresh = candidates.filter((item) => !recentCommentaryIds.includes(item.id))
  const selected = (fresh.length ? fresh : candidates)[Math.floor(Math.random() * (fresh.length ? fresh.length : candidates.length))]
  if (!selected) return ''
  remember(selected.id)
  return selected.text
}

export const commentaryPools = {
  start: {
    normal: ['메지로 맥퀸, 좋은 스타트입니다!', '무난하게 게이트를 빠져나온 메지로 맥퀸!', '맥퀸, 침착하게 출발했습니다.', '좋은 출발! 메지로 맥퀸이 앞쪽을 바라봅니다.', '메지로 맥퀸, 자연스럽게 흐름에 올라탑니다.'].map((text, index) => ({ id: `start-normal-${index}`, text })),
    late: ['아, 메지로 맥퀸 출발이 조금 늦었습니다!', '맥퀸, 스타트에서 약간 뒤처집니다!', '출발이 매끄럽지 않았습니다, 메지로 맥퀸!', '맥퀸이 한 박자 늦게 나왔습니다!', '초반부터 조금 불리한 위치, 메지로 맥퀸!'].map((text, index) => ({ id: `start-late-${index}`, text })),
  },
  early: {
    lead: ['메지로 맥퀸, 좋은 위치를 차지합니다.', '선두 바로 뒤, 맥퀸이 안정적으로 자리합니다.', '앞쪽 좋은 위치에 메지로 맥퀸!', '선두 그룹 안쪽, 맥퀸이 흐름을 읽고 있습니다.', '맥퀸은 서두르지 않습니다. 앞을 바라보며 달립니다.', '메지로 맥퀸, 선두권에서 경기를 풀어갑니다.', '좋은 자리입니다, 맥퀸이 선두를 사정권에 둡니다.'].map((text, index) => ({ id: `early-lead-${index}`, text })),
    rear: ['맥퀸은 아직 뒤쪽에 있습니다.', '메지로 맥퀸, 조금 뒤에서 기회를 엿봅니다.', '초반 위치가 좋지 않습니다. 맥퀸이 진로를 찾습니다.', '선두권과 거리가 있습니다, 메지로 맥퀸.', '맥퀸이 서서히 앞쪽을 바라보기 시작합니다.'].map((text, index) => ({ id: `early-rear-${index}`, text })),
  },
  mid: {
    hold: ['메지로 맥퀸, 좋은 위치를 유지하고 있습니다.', '여전히 선두권! 맥퀸의 움직임은 여유가 있어 보입니다.', '큰 변화 없이 선두 그룹을 따라갑니다.', '맥퀸, 안정된 페이스입니다.', '앞을 사정권에 둔 채 메지로 맥퀸이 달립니다.', '맥퀸은 침착합니다. 좋은 리듬을 유지합니다.', '메지로 맥퀸, 아직 힘을 아끼고 있습니다.'].map((text, index) => ({ id: `mid-hold-${index}`, text })),
    up: ['맥퀸이 조금씩 앞으로 올라옵니다!', '메지로 맥퀸, 서서히 위치를 끌어올립니다.', '한 자리, 또 한 자리! 맥퀸이 전진합니다.', '맥퀸이 바깥쪽에서 좋은 움직임을 보입니다.', '선두권을 향해 메지로 맥퀸이 올라옵니다!'].map((text, index) => ({ id: `mid-up-${index}`, text })),
    down: ['맥퀸이 한 자리 밀려났습니다.', '메지로 맥퀸, 조금씩 위치가 내려갑니다.', '주변 말들의 압박을 받는 맥퀸.', '페이스가 조금 흔들립니다, 메지로 맥퀸.', '맥퀸이 선두권을 지키기 위해 버팁니다.'].map((text, index) => ({ id: `mid-down-${index}`, text })),
  },
  late: {
    strong: ['자, 이제 승부처! 맥퀸이 움직이기 시작합니다!', '메지로 맥퀸, 페이스를 올립니다!', '여기서 맥퀸이 전진합니다!', '맥퀸에게 아직 힘이 남아 있습니다!', '메지로 맥퀸, 선두와의 차이를 좁힙니다!', '후반에 접어들며 맥퀸이 본격적으로 움직입니다.'].map((text, index) => ({ id: `late-strong-${index}`, text })),
    stamina: ['맥퀸의 발걸음이 조금 무거워졌습니다.', '긴 거리가 부담이 되는가, 맥퀸의 페이스가 떨어집니다.', '메지로 맥퀸, 여기서 조금 고전합니다.', '후속 주자들이 거리를 좁혀옵니다!', '맥퀸이 버틸 수 있을까요!', '여기서 체력의 한계가 보이기 시작합니다.'].map((text, index) => ({ id: `late-stamina-${index}`, text })),
    neutral: ['후반에 접어듭니다. 맥퀸이 자리를 지킵니다.', '승부처를 향해 메지로 맥퀸이 달립니다.', '맥퀸, 아직 선두를 사정권에 둡니다.', '여기서부터가 진짜 승부입니다.', '메지로 맥퀸, 페이스를 잃지 않습니다.'].map((text, index) => ({ id: `late-neutral-${index}`, text })),
  },
  corner: {
    good: ['마지막 코너! 메지로 맥퀸이 좋은 위치!', '제4코너를 돌아 직선으로 향합니다!', '맥퀸, 선두를 바로 앞에 두고 마지막 코너!', '메지로 맥퀸, 좋은 손응답입니다!', '이제 직선 승부! 맥퀸이 기회를 노립니다!'].map((text, index) => ({ id: `corner-good-${index}`, text })),
    accelerate: ['맥퀸이 바깥으로 진로를 잡습니다!', '메지로 맥퀸, 여기서 가속!', '맥퀸이 한 단계 속도를 올립니다!', '선두가 보입니다! 맥퀸이 추격 준비!', '메지로 맥퀸, 이제 승부를 걸어옵니다!'].map((text, index) => ({ id: `corner-accelerate-${index}`, text })),
    blocked: ['앞이 막혔습니다! 맥퀸이 진로를 찾습니다.', '맥퀸, 원하는 자리를 잡지 못합니다.', '코너에서 조금 밀립니다, 메지로 맥퀸.', '가속이 충분하지 않습니다!', '맥퀸이 바깥으로 돌며 거리를 손해 봅니다.'].map((text, index) => ({ id: `corner-blocked-${index}`, text })),
  },
  straight: {
    chase: ['직선에 들어왔습니다!', '메지로 맥퀸, 여기서 가속!', '맥퀸이 온다! 맥퀸이 온다!', '선두를 잡을 수 있을까! 메지로 맥퀸!', '메지로 맥퀸이 맹렬하게 추격합니다!', '맥퀸, 선두와의 차이를 줄여갑니다!'].map((text, index) => ({ id: `straight-chase-${index}`, text })),
    lead: ['메지로 맥퀸이 선두!', '맥퀸, 선두를 지킵니다!', '메지로 맥퀸 앞장섭니다!', '맥퀸이 한 발 앞서 나갑니다!', '선두는 메지로 맥퀸! 그대로 갈 수 있을까요!'].map((text, index) => ({ id: `straight-lead-${index}`, text })),
    hold: ['맥퀸 버틴다! 맥퀸 버틴다!', '뒤에서 추격해옵니다! 맥퀸이 버팁니다!', '메지로 맥퀸, 마지막 힘을 짜냅니다!', '남은 것은 마지막 한 걸음!', '맥퀸이 이를 악물고 버팁니다!'].map((text, index) => ({ id: `straight-hold-${index}`, text })),
    fade: ['맥퀸의 발이 무거워집니다!', '뒤에서 하나둘 넘어옵니다!', '메지로 맥퀸, 마지막에 고전합니다.', '맥퀸이 더 이상 속도를 올리지 못합니다.', '선두와의 차이가 벌어지고 있습니다.'].map((text, index) => ({ id: `straight-fade-${index}`, text })),
  },
  finish: {
    second: ['아쉽습니다! 메지로 맥퀸, 2착!', '마지막까지 따라붙었지만 한 걸음 부족했습니다.', '맥퀸, 선두를 잡지 못하고 2착으로 들어옵니다.', '접전 끝에 메지로 맥퀸은 2착!', '메지로 맥퀸, 아쉽게 두 번째로 결승선을 통과합니다.'].map((text, index) => ({ id: `finish-second-${index}`, text })),
    third: ['메지로 맥퀸, 3착으로 결승선을 통과합니다.', '끝까지 버텼습니다. 맥퀸은 3착.', '선두에는 닿지 못했지만 좋은 경주였습니다.', '맥퀸, 마지막까지 분전하며 3착입니다.', '메지로 맥퀸, 상위권에서 레이스를 마칩니다.'].map((text, index) => ({ id: `finish-third-${index}`, text })),
    upper: ['메지로 맥퀸, 상위권으로 경기를 마칩니다.', '마지막까지 분전했지만 선두에는 닿지 못했습니다.', '맥퀸, 아쉬움이 남는 결과입니다.', '메지로 맥퀸, 끝까지 자리를 지켜냈습니다.', '오늘은 아쉽지만 다음을 기약합니다.'].map((text, index) => ({ id: `finish-upper-${index}`, text })),
    lower: ['메지로 맥퀸, 오늘은 힘든 경주였습니다.', '맥퀸, 기대했던 결과를 만들지 못합니다.', '마지막까지 달렸지만 순위를 끌어올리지 못했습니다.', '오늘은 메지로 맥퀸의 경주가 풀리지 않았습니다.', '메지로 맥퀸, 아쉬움을 남기고 결승선을 통과합니다.'].map((text, index) => ({ id: `finish-lower-${index}`, text })),
  },
  victory: {
    general: ['강하다! 강하다! 메지로 맥퀸!', '1착은 장거리 스테이어, 메지로 맥퀸!', '메지로 가문의 맥퀸이 해냅니다!', '이것이 명가의 저력인가! 메지로 맥퀸!', '메지로 맥퀸, 강했습니다!', '맥퀸이 빠져나옵니다! 그대로 1착!', '장거리의 귀공자, 메지로 맥퀸!', '누구도 따라오지 못합니다! 메지로 맥퀸!', '메지로의 이름을 등에 지고! 맥퀸이 해냅니다!', '역시 강하다, 메지로 맥퀸!', '오늘의 주인공은 메지로 맥퀸!', '압도적인 달리기! 메지로 맥퀸이 승리합니다!', '선두를 지켜냈습니다! 메지로 맥퀸!', '끝까지 강했습니다! 메지로 맥퀸!', '당당한 승리! 메지로 맥퀸!'].map((text, index) => ({ id: `victory-general-${index}`, text })),
    DOMINANT: ['강하다! 너무 강합니다, 메지로 맥퀸!', '뒤를 크게 벌립니다! 맥퀸의 완승!', '누구도 따라오지 못합니다!', '압도적입니다! 메지로 맥퀸!'].map((text, index) => ({ id: `victory-dominant-${index}`, text })),
    CLOSE: ['맥퀸인가! 맥퀸인가!', '메지로 맥퀸이 간발의 차로 앞섭니다!', '접전 끝에 맥퀸!', '마지막 한 걸음! 메지로 맥퀸!'].map((text, index) => ({ id: `victory-close-${index}`, text })),
    COMEBACK: ['맥퀸이 온다! 메지로 맥퀸이 올라옵니다!', '마지막에 뒤집었습니다!', '여기서 역전! 메지로 맥퀸!', '극적인 역전승입니다!'].map((text, index) => ({ id: `victory-comeback-${index}`, text })),
    FRONT_RUNNING: ['맥퀸, 아직 선두! 맥퀸 버틴다!', '좋은 위치에서 그대로 밀어붙였습니다!', '선행의 정석! 메지로 맥퀸!', '앞에서 버티고 그대로 승리!'].map((text, index) => ({ id: `victory-front-${index}`, text })),
  },
}

export const raceSpecificVictory = {
  'kikuka-sho': ['마지막 한 관을 거머쥡니다! 메지로 맥퀸!', '장거리의 자질을 증명했습니다! 국화상 제패!', '3000m를 지배한 메지로 맥퀸!'],
  'tenno-sho-spring': ['봄의 방패는 메지로 맥퀸의 것!', '장거리의 왕자, 교토를 제압합니다!', '메지로 맥퀸! 봄의 천황상을 거머쥡니다!'],
  'tenno-sho-autumn': ['가을의 방패도 메지로 맥퀸!', '천황상 가을의 주인공은 메지로 맥퀸!', '맥퀸이 가을의 왕좌에 오릅니다!'],
  'arima-kinen': ['그랑프리의 주인공은 메지로 맥퀸!', '최고의 무대에서 최고의 달리기!', '메지로 맥퀸, 아리마 기념을 제패합니다!', '마지막 무대의 주인공은 맥퀸입니다!'],
  'hopeful-stakes': ['미래를 향한 첫 G1! 메지로 맥퀸!', '주니어의 왕좌를 차지합니다!', '메지로 맥퀸, 새로운 스타의 탄생입니다!'],
  'takarazuka-classic': ['봄 그랑프리를 제압합니다! 메지로 맥퀸!', '팬들의 기대에 응답한 메지로 맥퀸!', '타카라즈카의 주인공은 맥퀸!'],
  'takarazuka-senior': ['봄 그랑프리를 제압합니다! 메지로 맥퀸!', '팬들의 기대에 응답한 메지로 맥퀸!', '타카라즈카의 주인공은 맥퀸!'],
}

export function pickSpecificVictory(raceId) {
  const candidates = raceSpecificVictory[raceId] ?? []
  const selected = candidates[Math.floor(Math.random() * candidates.length)]
  if (!selected) return ''
  remember(`specific-${raceId}-${selected}`)
  return selected
}
