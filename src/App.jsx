import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { character, STAT_KEYS, STAT_LABELS } from './data/character'
import { events } from './data/events'
import { races } from './data/races'
import { trainings, restTraining } from './data/trainings'
import { applyEffects, conditionFrom, months, rating, runTraining, simulateRace } from './game/engine'

const initialGame = () => ({ month: 1, stats: { ...character.stats }, stamina: 100, condition: character.condition, fans: 0, starts: 0, wins: 0, bestRank: 99, raceResults: [], logs: ['육성 준비가 완료되었습니다.'], phase: 'START', training: null, trainingResolved: false, event: null, eventResult: null, race: null, raceStep: 0, paused: false })
const addLog = (game, text) => ({ ...game, logs: [text, ...game.logs].slice(0, 5) })
const statLabel = (key) => STAT_LABELS[key] ?? key
const formatEffects = (effects) => {
  const changes = Object.entries(effects.stats ?? {}).map(([key, value]) => `${statLabel(key)} +${value}`)
  if (effects.stamina) changes.push(`체력 ${effects.stamina > 0 ? '+' : ''}${effects.stamina}`)
  if (effects.condition) changes.push(`컨디션 ${effects.condition > 0 ? '상승' : '하락'}`)
  if (effects.fans) changes.push(`팬 +${effects.fans}`)
  return changes.join(', ') || '특별한 변화 없음'
}
const MONTH_DURATION = { 1: 10000, 2: 5000 }

function App() {
  const [game, setGame] = useState(initialGame)
  const [running, setRunning] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [selectedTraining, setSelectedTraining] = useState('Speed')
  const [progressRatio, setProgressRatio] = useState(0)
  const elapsedRef = useRef(0)
  const lastTickRef = useRef(null)
  const advancingRef = useRef(false)
  const currentRace = races.find((race) => race.month === game.month)
  const nextRace = races.find((race) => race.month >= game.month && !game.raceResults.some((result) => result.month === race.month))
  const monthDuration = MONTH_DURATION[speed]
  const timerActive = running && !game.paused && game.phase === 'TRAINING' && !game.trainingResolved
  const remainingSeconds = Math.max(0, (1 - progressRatio) * monthDuration / 1000)
  const progressPercent = Math.min(100, progressRatio * 100)
  const timerText = game.phase === 'TRAINING' ? `다음 달까지 ${remainingSeconds.toFixed(1)}초${game.paused ? ' · 일시정지' : ''}` : '월 진행 일시정지'

  const resolveTraining = useCallback((selectedId = null) => {
    setGame((prev) => {
      if (prev.phase !== 'TRAINING' || prev.trainingResolved) return prev
      const training = runTraining(prev, selectedId)
      let next = { ...prev, stamina: training.after, stats: { ...prev.stats }, training, trainingResolved: true, phase: 'TRAINING' }
      Object.entries(training.gains).forEach(([stat, amount]) => { next.stats[stat] += amount })
      if (training.conditionChange) next.condition = conditionFrom(next.condition, training.conditionChange)
      const gains = Object.entries(training.gains).map(([stat, value]) => `${statLabel(stat)} +${value}`).join(', ')
      const trainingLog = training.id === 'Rest'
        ? `${prev.month}월 | 휴식 : 체력 ${training.before} → ${training.after}${training.conditionChange ? ' · 컨디션 상승' : ''}`
        : `${prev.month}월 | ${training.label} 훈련 : ${gains} · 체력 ${training.before} → ${training.after}`
      next = addLog(next, trainingLog)
      return next
    })
  }, [])

  const resetMonthProgress = useCallback(() => {
    elapsedRef.current = 0
    lastTickRef.current = null
    setProgressRatio(0)
  }, [])

  const advanceMonth = useCallback(() => {
    if (advancingRef.current) return
    advancingRef.current = true
    resetMonthProgress()
    resolveTraining(selectedTraining)
    advancingRef.current = false
  }, [resolveTraining, resetMonthProgress, selectedTraining])

  useEffect(() => {
    if (!timerActive) {
      lastTickRef.current = null
      return undefined
    }
    let frameId
    const tick = (now) => {
      if (advancingRef.current) return
      if (lastTickRef.current === null) lastTickRef.current = now
      const nextElapsed = Math.min(1, elapsedRef.current + (now - lastTickRef.current) / monthDuration)
      lastTickRef.current = now
      elapsedRef.current = nextElapsed
      setProgressRatio(nextElapsed)
      if (nextElapsed >= 1) {
        advanceMonth()
        return
      }
      frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [timerActive, game.month, monthDuration, advanceMonth])

  useEffect(() => {
    if (!game.trainingResolved || game.phase !== 'TRAINING') return undefined
    const timer = setTimeout(() => setGame((prev) => {
      if (!prev.trainingResolved || prev.phase !== 'TRAINING') return prev
      const next = { ...prev, trainingResolved: false }
      const raceForMonth = races.find((race) => race.month === prev.month)
      if (raceForMonth) return { ...next, phase: 'RACE_INTRO', race: simulateRace(next, raceForMonth), raceStep: 0, paused: true }
      if (Math.random() < 0.35) return { ...next, phase: 'EVENT', event: events[Math.floor(Math.random() * events.length)], paused: true }
      resetMonthProgress()
      return { ...next, month: Math.min(6, next.month + 1) }
    }), 2000)
    return () => clearTimeout(timer)
  }, [game.trainingResolved, game.phase, resetMonthProgress])

  useEffect(() => {
    if (game.phase !== 'RACING') return undefined
    const timer = setTimeout(() => setGame((prev) => {
      const nextStep = prev.raceStep + 1
      if (nextStep >= prev.race.logs.length) return { ...prev, phase: 'RACE_RESULT', paused: true }
      return { ...prev, raceStep: nextStep }
    }), 1500)
    return () => clearTimeout(timer)
  }, [game.phase, game.raceStep, game.race])

  const start = () => { resetMonthProgress(); setGame((prev) => ({ ...prev, phase: 'TRAINING', paused: false })); setRunning(true) }
  const chooseEvent = (choice) => setGame((prev) => {
    const next = addLog(applyEffects(prev, choice.effects), `${prev.month}월 | 이벤트 「${prev.event.title}」: ${choice.label} · ${formatEffects(choice.effects)}`)
    return { ...next, phase: 'EVENT', eventResult: { ...choice, effectText: formatEffects(choice.effects) }, paused: true }
  })
  const continueEvent = () => { resetMonthProgress(); setGame((prev) => ({ ...prev, event: null, eventResult: null, phase: 'TRAINING', month: prev.month + 1, paused: false })) }
  const startRace = () => setGame((prev) => ({ ...prev, phase: 'RACING', raceStep: 1, paused: true }))
  const finishRace = () => setGame((prev) => {
    const result = { month: prev.month, title: currentRace.title, finish: prev.race.finish }
    const wins = prev.wins + (result.finish === 1 ? 1 : 0)
    const fans = prev.fans + (result.finish === 1 ? 900 : Math.max(180, (currentRace.entrants - result.finish + 1) * 110))
    const next = addLog({ ...prev, starts: prev.starts + 1, wins, fans, bestRank: Math.min(prev.bestRank, result.finish), raceResults: [...prev.raceResults, result], race: null }, `${prev.month}월 | 레이스 ${result.title} : ${result.finish}착`)
    if (prev.month === 6) return { ...next, phase: 'ENDING', paused: true }
    return { ...next, phase: 'TRAINING', month: prev.month + 1, paused: false }
  })
  const fastForward = () => { if (game.phase === 'TRAINING' && !game.paused && !game.trainingResolved) advanceMonth() }

  const center = useMemo(() => {
    if (game.phase === 'START') return <div className="start"><span className="eyebrow">6 MONTH TRAINING PROTOTYPE</span><h1>메지로 맥퀸과<br />봄을 향해 달려가세요.</h1><p>자동 훈련과 선택 이벤트, 두 번의 레이스로 완성되는 짧고 밀도 있는 육성 루프입니다.</p><button className="primary" onClick={start}>육성 시작</button></div>
    if (game.phase === 'ENDING') return <Ending game={game} onRestart={() => { setGame(initialGame()); setSelectedTraining('Speed'); setRunning(false) }} />
    if (game.phase === 'RACE_INTRO') return <RaceIntro race={currentRace} onStart={startRace} />
    if (game.phase === 'RACING' || game.phase === 'RACE_RESULT') return <RaceLog game={game} onContinue={finishRace} />
    return <Training game={game} selectedTraining={selectedTraining} onSelect={setSelectedTraining} />
  }, [game, currentRace, selectedTraining])

  return <main className="app-shell">
    <header><div className="brand"><span>UMA</span> TRAINING SIM</div><div className="phase">{game.phase.replace('_', ' ')}</div></header>
    <section className="sticky-progress card"><div className="month-progress"><div className="progress-copy"><span>{timerText}</span><b>{Math.round(progressPercent)}%</b></div><div className="progress-track" role="progressbar" aria-label="다음 달까지 진행률" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(progressPercent)}><i style={{ width: `${progressPercent}%` }} /></div><div className="speed-controls"><span>진행 속도</span>{[1, 2].map((value) => <button key={value} className={speed === value ? 'selected' : ''} onClick={() => setSpeed(value)}>x{value}</button>)}</div></div><div className="controls"><button onClick={() => setGame((prev) => ({ ...prev, paused: !prev.paused }))} disabled={!running || game.phase !== 'TRAINING'}>{game.paused ? '재개' : '일시정지'}</button><button onClick={fastForward} disabled={game.phase !== 'TRAINING' || game.paused || game.trainingResolved}>빠르게 진행</button></div></section>
    <section className="dashboard">
      <aside className="card profile"><span className="eyebrow">TRAINEE</span><h2>{character.name}</h2><div className="portrait">M<span>♘</span></div><div className="tags"><span>{character.distance}</span><span>{character.style}</span></div><Stats stats={game.stats} /></aside>
      <section className="card stage"><div className="month"><span>TRAINING YEAR 1</span><strong>{months[game.month - 1] ?? '완료'}</strong></div>{center}</section>
      <aside className="card status"><span className="eyebrow">CONDITION</span><h2 className="condition">{game.condition}</h2><div className="bar-label"><span>체력</span><b>{game.stamina}/100</b></div><div className="bar"><i style={{ width: `${game.stamina}%` }} /></div><div className="record"><span>전적</span><b>{game.starts}전 {game.wins}승</b><span>팬 수</span><b>{game.fans.toLocaleString()}명</b><span>최고 순위</span><b>{game.bestRank === 99 ? '-' : `${game.bestRank}착`}</b></div><hr /><span className="eyebrow">NEXT RACE</span>{nextRace ? <><h3>{nextRace.title}</h3><p>{nextRace.distance} · {nextRace.surface} · {nextRace.entrants}명</p><p className="muted">{nextRace.month - game.month}개월 후</p></> : <p className="muted">남은 레이스 없음</p>}</aside>
    </section>
    {game.phase === 'EVENT' && <EventModal game={game} onChoose={chooseEvent} onContinue={continueEvent} />}
  </main>
}

function Stats({ stats, initial = false }) { return <div className="stats">{STAT_KEYS.map((key) => <div key={key}><span>{statLabel(key)}</span><b>{stats[key]}</b>{initial && <em>(+{stats[key] - character.stats[key]})</em>}</div>)}</div> }
function Training({ game, selectedTraining, onSelect }) {
  const t = game.training
  const resolved = game.trainingResolved
  const options = [restTraining, ...trainings]
  const selected = options.find((option) => option.id === selectedTraining)
  return <div className="training training-active">
    <div className="training-heading"><span className="eyebrow">MONTHLY TRAINING</span><h1>현재 자동 훈련: {selected?.label}</h1><p>선택한 행동은 바꾸기 전까지 매월 자동으로 반복됩니다.</p></div>
    <div className="training-options">{options.map((option) => <button key={option.id} className={selectedTraining === option.id ? 'selected' : ''} onClick={() => onSelect(option.id)} disabled={resolved}><b>{option.label}</b><small>{option.id === 'Rest' ? option.hint : `${statLabel(option.id)} 상승 · 체력 소모`}</small></button>)}</div>
    <section className="training-log"><div className="training-log-title"><span className="eyebrow">TRAINING LOG</span><span>LIVE HISTORY</span></div>{resolved && <div className="latest-training"><b>{t.label} 훈련 완료</b><div className="gain">{Object.entries(t.gains).map(([stat, amount]) => <b key={stat}>{statLabel(stat)} +{amount}</b>)}{t.conditionChange > 0 && <b>컨디션 상승</b>}</div><small>체력 {t.before} → {t.after}</small></div>}<div className="log-feed">{game.logs.map((log, index) => <p key={`${log}-${index}`} className={index === 0 ? 'latest' : ''}>{log}</p>)}</div></section>
  </div>
}
function EventModal({ game, onChoose, onContinue }) { const { event, eventResult } = game; return <div className="overlay"><div className="modal"><span className="eyebrow">RANDOM EVENT</span><h2>{event.title}</h2>{eventResult ? <><p>{eventResult.result}</p><div className="actual">{eventResult.effectText}</div><button className="primary" onClick={onContinue}>계속</button></> : <><p>{event.text}</p><div className="choices">{event.choices.map((choice) => <button key={choice.label} onClick={() => onChoose(choice)}><b>{choice.label}</b><small>{choice.hint}</small></button>)}</div></>}</div></div> }
function RaceIntro({ race, onStart }) { return <div className="race-intro"><span className="eyebrow">RACE DAY</span><h1>{race.title}</h1><div className="race-info"><b>{race.distance}</b><b>{race.surface}</b><b>{race.entrants}명 출전</b></div><p>관중의 환호 속에서, 맥퀸이 출전표에 이름을 올렸다.</p><button className="primary" onClick={onStart}>START</button></div> }
function RaceLog({ game, onContinue }) { const log = game.race.logs[game.raceStep]; const result = game.phase === 'RACE_RESULT'; return <div className="race-log"><span className="eyebrow">RACE LIVE</span><h2>[ {log.phase} ]</h2><p>{log.text}</p>{log.rank && <div className="rank">현재 순위 <b>{log.rank}위 / {game.race.entrants}</b>{log.stamina && <small>레이스 체력 {log.stamina}%</small>}</div>}{result && <button className="primary" onClick={onContinue}>{game.month === 6 ? '결과 보기' : '육성 계속'}</button>}</div> }
function Ending({ game, onRestart }) { const [grade, title] = rating(game); const winRate = game.starts ? Math.round(game.wins / game.starts * 100) : 0; return <div className="ending"><span className="eyebrow">TRAINING COMPLETE</span><h1>{character.nameEn}</h1><div className="grade">{grade}</div><h2>「{title}」</h2><Stats stats={game.stats} initial /><div className="summary"><b>{game.starts}전 {game.wins}승 · 승률 {winRate}%</b><span>팬 수 {game.fans.toLocaleString()}명</span>{game.raceResults.map((r) => <span key={r.month}>{r.title} {r.finish}착</span>)}</div><p>6개월의 시간이 맥퀸을 한층 더 단단한 레이서로 만들었습니다.</p><button className="primary" onClick={onRestart}>다시 육성하기</button></div> }

export default App
