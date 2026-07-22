import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import Seo from '../components/Seo'
import PracticeProblemList from '../components/practice/PracticeProblemList'
import OneCompilerIDE from '../components/practice/OneCompilerIDE'
import { recordPracticeView } from '../firebase/stats'

/* Practice hub: filter curated LeetCode/NeetCode/HackerRank problems by topic +
   algorithm (prefilled from ?topic=&algo=), read the example cases, and solve
   in the embedded IDE. See the Phase 3 design spec. */
export default function Practice() {
  const [params, setParams] = useSearchParams()
  const [topic, setTopic]   = useState(params.get('topic') || 'all')
  const [algo, setAlgo]     = useState(params.get('algo') || 'all')
  const [active, setActive] = useState(null)
  const [isWide, setIsWide] = useState(true)

  useEffect(() => { recordPracticeView() }, [])

  useEffect(() => {
    const check = () => setIsWide(window.innerWidth >= 900)
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  /* Keep the URL shareable/in-sync with the filters */
  useEffect(() => {
    const next = {}
    if (topic !== 'all') next.topic = topic
    if (algo !== 'all') next.algo = algo
    setParams(next, { replace: true })
  }, [topic, algo, setParams])

  const handleTopicChange = (t) => { setTopic(t); setAlgo('all') }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)' }}>
      <Seo
        title="Practice"
        description="Practice coding-interview problems from LeetCode, HackerRank and NeetCode with an embedded Java/C/C++/Python IDE, filtered by topic and algorithm."
      />
      <div className="max-w-[1400px] mx-auto px-5 py-6">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginBottom: 18, color: 'var(--chrome-text-muted)' }}>
          <Link to="/" style={{ color: 'var(--chrome-text-muted)', textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={12} />
          <span style={{ fontWeight: 600, color: 'var(--chrome-text)' }}>Practice</span>
        </div>

        <h1 style={{ fontSize: 30, fontWeight: 800, color: 'var(--chrome-text)', marginBottom: 6 }}>💻 Practice Problems</h1>
        <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.6, maxWidth: 660, marginBottom: 22 }}>
          Curated problems from LeetCode, HackerRank and NeetCode. Pick a topic and algorithm, read the
          examples, and solve them in the embedded IDE — Java, C, C++ or Python. Full statement and official
          submission are on the source site.
        </p>

        <div style={{ display: 'flex', flexDirection: isWide ? 'row' : 'column', gap: 16, alignItems: 'stretch' }}>
          <div style={{ width: isWide ? '42%' : '100%', flexShrink: 0 }}>
            <PracticeProblemList
              topic={topic}
              algo={algo}
              onTopicChange={handleTopicChange}
              onAlgoChange={setAlgo}
              activeId={active?.id}
              onSelectProblem={setActive}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0, minHeight: isWide ? 560 : 420, display: 'flex' }}>
            <OneCompilerIDE />
          </div>
        </div>
      </div>
    </div>
  )
}
