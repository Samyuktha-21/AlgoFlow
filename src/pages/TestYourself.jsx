import { useState, useCallback } from 'react'
import Seo from '../components/Seo'
import GameSetup from '../components/game/GameSetup'
import ScoreBar from '../components/game/ScoreBar'
import ChallengeCard from '../components/game/ChallengeCard'
import GameSummary from '../components/game/GameSummary'
import { buildPool, loadEntry, allNames } from '../game/pool'
import { runSteps } from '../game/runSteps'
import { createSession, scoreAnswer, recordType, applicableTypes, saveBest, loadBest } from '../game/session'
import { generateComplexity } from '../game/challenges/complexity'
import { generateNextOp } from '../game/challenges/nextOp'
import { generateFinalOutput } from '../game/challenges/finalOutput'
import { generateNameAlgorithm } from '../game/challenges/nameAlgorithm'

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)]

async function makeChallenge(pool, names) {
  for (let tries = 0; tries < 25; tries++) {
    const pm = rand(pool)
    const type = rand(applicableTypes(pm))
    const entry = await loadEntry(pm)
    let ch = null
    if (type === 'complexity') {
      ch = generateComplexity(entry)
    } else {
      const steps = runSteps(entry)
      if (steps) {
        if (type === 'nextOp') ch = generateNextOp(entry, steps)
        else if (type === 'finalOutput') ch = generateFinalOutput(entry, steps)
        else if (type === 'nameAlgorithm') ch = generateNameAlgorithm(entry, steps, names)
      }
    }
    if (ch) return ch
  }
  // guaranteed-buildable fallback: first entry whose complexity question builds
  for (const pm of pool) {
    const ch = generateComplexity(await loadEntry(pm))
    if (ch) return ch
  }
  return null
}

export default function TestYourself() {
  const [phase, setPhase] = useState('setup') // 'setup' | 'playing' | 'summary'
  const [pool, setPool] = useState([])
  const [names, setNames] = useState([])
  const [session, setSession] = useState(null)
  const [challenge, setChallenge] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [loading, setLoading] = useState(false)
  const [best, setBest] = useState(loadBest())
  const [isNewBest, setIsNewBest] = useState(false)
  const [lastConfig, setLastConfig] = useState(null)
  const [setupError, setSetupError] = useState('')

  const loadNext = useCallback(async (p, nm) => {
    setLoading(true); setAnswered(false); setSelectedIndex(-1)
    const ch = await makeChallenge(p, nm)
    setChallenge(ch); setLoading(false)
  }, [])

  const start = useCallback(async (config) => {
    const p = buildPool(config.categoryIds)
    if (!p.length) { setSetupError('No algorithms in the selected topics — try "All".'); return }
    setSetupError('')
    const nm = allNames(p)
    setPool(p); setNames(nm); setLastConfig(config)
    setSession(createSession(config))
    setPhase('playing')
    await loadNext(p, nm)
  }, [loadNext])

  const onSelect = (i) => {
    if (answered) return
    setSelectedIndex(i)
    setAnswered(true)
    const isCorrect = !!challenge.options[i]?.isCorrect
    setSession(s => recordType(scoreAnswer(s, isCorrect), challenge.type, isCorrect))
  }

  const finishRun = (s) => {
    if (s.mode === 'endless') {
      const prev = loadBest()
      const nb = saveBest(s)
      setBest(nb || prev)
      setIsNewBest(s.score > prev.bestScore)
    }
    setPhase('summary')
  }

  const onNext = async () => {
    if (session.mode === 'rounds' && session.over) { finishRun(session); return }
    await loadNext(pool, names)
  }

  const playAgain = () => start(lastConfig)
  const changeSettings = () => { setPhase('setup'); setSession(null); setChallenge(null) }

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', background: 'var(--page-bg)' }}>
      <Seo
        title="Test Yourself"
        description="Practice algorithms with predict-the-next-step challenges, complexity quizzes, name-the-algorithm, and final-output predictions."
      />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '1.5rem' }}>
        {phase === 'setup' && (
          <>
            <GameSetup onStart={start} />
            {setupError && (
              <p style={{ maxWidth: 720, margin: '0 auto', color: 'var(--chip-red-text)', fontSize: 14 }}>{setupError}</p>
            )}
          </>
        )}

        {phase === 'playing' && session && (
          <>
            <ScoreBar session={session} best={best} onEnd={() => finishRun(session)} />
            {loading || !challenge ? (
              <div className="flex items-center justify-center" style={{ minHeight: 300 }}>
                <div className="w-8 h-8 border-[3px] border-blue-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <ChallengeCard
                challenge={challenge}
                answered={answered}
                selectedIndex={selectedIndex}
                onSelect={onSelect}
                onNext={onNext}
              />
            )}
          </>
        )}

        {phase === 'summary' && session && (
          <GameSummary
            session={session}
            isNewBest={isNewBest}
            onPlayAgain={playAgain}
            onChangeSettings={changeSettings}
          />
        )}
      </div>
    </div>
  )
}
