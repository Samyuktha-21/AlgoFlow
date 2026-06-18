import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronDown, ExternalLink, Lightbulb, ArrowRight } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import interviewQuestions, { TOPICS } from '../data/interviewQuestions'

/* ── Difficulty badge styles (light-colored per spec) ──────────── */
const DIFF_STYLES = {
  easy:   { bg: '#dcfce7', color: '#15803d', border: '#86efac' },
  medium: { bg: '#fef9c3', color: '#a16207', border: '#fde047' },
  hard:   { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' },
}

/* ── Company brand colors ──────────────────────────────────────── */
const COMPANY_STYLES = {
  Google:         { bg: 'rgba(66,133,244,0.12)',  color: '#60a5fa', border: 'rgba(66,133,244,0.25)' },
  Amazon:         { bg: 'rgba(255,153,0,0.12)',   color: '#fbbf24', border: 'rgba(255,153,0,0.25)' },
  Microsoft:      { bg: 'rgba(0,164,239,0.12)',   color: '#38bdf8', border: 'rgba(0,164,239,0.25)' },
  Meta:           { bg: 'rgba(24,119,242,0.12)',  color: '#818cf8', border: 'rgba(24,119,242,0.25)' },
  Apple:          { bg: 'rgba(255,255,255,0.08)', color: '#e2e8f0', border: 'rgba(255,255,255,0.15)' },
  Adobe:          { bg: 'rgba(255,0,0,0.1)',      color: '#f87171', border: 'rgba(255,0,0,0.2)' },
  LinkedIn:       { bg: 'rgba(10,102,194,0.12)',  color: '#60a5fa', border: 'rgba(10,102,194,0.25)' },
  Uber:           { bg: 'rgba(255,255,255,0.06)', color: '#e2e8f0', border: 'rgba(255,255,255,0.12)' },
  Bloomberg:      { bg: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: 'rgba(255,255,255,0.1)' },
  'Goldman Sachs':{ bg: 'rgba(100,149,237,0.12)', color: '#93c5fd', border: 'rgba(100,149,237,0.25)' },
  Airbnb:         { bg: 'rgba(255,90,95,0.12)',   color: '#f87171', border: 'rgba(255,90,95,0.25)' },
}
const DEFAULT_COMPANY = { bg: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: 'rgba(255,255,255,0.1)' }

function CompanyTag({ company }) {
  const s = COMPANY_STYLES[company] || DEFAULT_COMPANY
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: 6, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 500,
      whiteSpace: 'nowrap',
    }}>
      {company}
    </span>
  )
}

function QuestionCard({ q }) {
  const [expanded, setExpanded] = useState(false)
  const [hovered, setHovered]   = useState(false)
  const [lang, setLang] = useState('java')
  const dc = DIFF_STYLES[q.difficulty] || DIFF_STYLES.medium

  const displayCompanies = q.companies.slice(0, 3)
  const extraCount = q.companies.length - 3
  const answerText = q.answer || q.solution?.approach || ''
  const hasCode = q.solution?.java || q.solution?.cpp || q.solution?.c

  const showHover = hovered && !expanded

  return (
    <div
      style={{
        background: showHover ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${(expanded || showHover) ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 14,
        padding: '1rem 1.25rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        marginBottom: '0.5rem',
        transform: showHover ? 'translateY(-1px)' : 'translateY(0)',
      }}
      onClick={() => setExpanded(e => !e)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Row 1: difficulty + title + chevron ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{
          background: dc.bg, color: dc.color, border: `1px solid ${dc.border}`,
          borderRadius: 20, padding: '3px 12px', fontSize: '0.72rem',
          letterSpacing: '0.04em', fontWeight: 700, flexShrink: 0,
          minWidth: 58, textAlign: 'center', textTransform: 'capitalize',
        }}>
          {q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}
        </span>

        <span style={{ fontSize: '1rem', fontWeight: 600, color: '#f1f5f9', flex: 1 }}>
          {q.title}
        </span>

        <ChevronDown size={16} style={{
          color: 'rgba(255,255,255,0.3)', flexShrink: 0,
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
        }} />
      </div>

      {/* ── Row 2: topic tag + separator + company tags ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.6rem', alignItems: 'center' }}>
        <span style={{
          background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
          color: '#a5b4fc', borderRadius: 6, padding: '2px 8px',
          fontSize: '0.72rem', fontWeight: 500, whiteSpace: 'nowrap',
        }}>
          {q.topic}
        </span>

        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, userSelect: 'none' }}>·</span>

        {displayCompanies.map(c => <CompanyTag key={c} company={c} />)}

        {extraCount > 0 && (
          <span style={{
            background: DEFAULT_COMPANY.bg, color: DEFAULT_COMPANY.color,
            border: `1px solid ${DEFAULT_COMPANY.border}`,
            borderRadius: 6, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 500,
          }}>
            +{extraCount} more
          </span>
        )}
      </div>

      {/* ── Expanded answer section ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                marginTop: '1rem', paddingTop: '1rem',
                borderTop: '1px solid rgba(255,255,255,0.08)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Description (if different from answer) */}
              {q.description && (
                <p style={{ fontSize: '0.88rem', lineHeight: 1.7, color: '#94a3b8', marginBottom: 14, marginTop: 0 }}>
                  {q.description}
                </p>
              )}

              {/* Complexity badges */}
              {q.complexity && (
                <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                  {[
                    { label: 'Time', value: q.complexity.time, color: '#fbbf24' },
                    { label: 'Space', value: q.complexity.space, color: '#34d399' },
                  ].map(c => (
                    <div key={c.label} style={{
                      padding: '6px 12px', borderRadius: 8,
                      background: `${c.color}10`, border: `1px solid ${c.color}25`,
                    }}>
                      <span style={{ fontSize: 10, color: '#64748b', display: 'block', fontWeight: 600 }}>{c.label}</span>
                      <code style={{ fontSize: 13, fontWeight: 700, color: c.color }}>{c.value}</code>
                    </div>
                  ))}
                </div>
              )}

              {/* Answer / Approach */}
              {answerText && (
                <div style={{ marginBottom: hasCode ? 16 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Lightbulb size={13} style={{ color: '#fbbf24', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24', letterSpacing: '0.05em' }}>APPROACH</span>
                  </div>
                  <p style={{ fontSize: '0.88rem', lineHeight: 1.7, color: '#cbd5e1', margin: 0 }}>
                    {answerText}
                  </p>
                </div>
              )}

              {/* Code block (only for questions with full solution) */}
              {hasCode && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                    {['java', 'cpp', 'c'].map(l => (
                      <button key={l} type="button" onClick={() => setLang(l)} style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                        background: lang === l ? 'rgba(99,102,241,0.25)' : 'transparent',
                        border: `1px solid ${lang === l ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`,
                        color: lang === l ? '#818cf8' : '#64748b',
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}>
                        {l === 'cpp' ? 'C++' : l === 'c' ? 'C' : 'Java'}
                      </button>
                    ))}
                  </div>
                  <pre style={{
                    background: '#0d1117', color: '#e6edf3',
                    borderRadius: 10, padding: '14px 16px', fontSize: 12,
                    overflowX: 'auto', lineHeight: 1.65, margin: 0,
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <code>{q.solution?.[lang] || '// Not available'}</code>
                  </pre>
                </div>
              )}

              {/* Interviewer tips */}
              {q.interviewerTips?.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f472b6', marginBottom: 6, letterSpacing: '0.05em' }}>
                    INTERVIEWER TIPS
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {q.interviewerTips.map((tip, i) => (
                      <li key={i} style={{ display: 'flex', gap: 8, fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6 }}>
                        <span style={{ color: '#f472b6', flexShrink: 0 }}>→</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Follow-up questions */}
              {q.followUpQuestions?.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#60a5fa', marginBottom: 6, letterSpacing: '0.05em' }}>
                    FOLLOW-UP QUESTIONS
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {q.followUpQuestions.map((fq, i) => (
                      <li key={i} style={{ display: 'flex', gap: 8, fontSize: '0.85rem', color: '#64748b' }}>
                        <ArrowRight size={12} style={{ flexShrink: 0, marginTop: 3 }} />
                        {fq}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Algorithm visualization link */}
              {q.algorithmLink && (
                <div style={{ marginTop: 14 }}>
                  <Link to={q.algorithmLink} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: '0.82rem', fontWeight: 600, color: '#60a5fa', textDecoration: 'none',
                  }}>
                    <ExternalLink size={12} />
                    View full visualization
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Main Interview page ───────────────────────────────────────── */
export default function Interview() {
  useTheme() // keep context active
  const [diffFilter, setDiffFilter]       = useState('all')
  const [topicFilter, setTopicFilter]     = useState('all')
  const [companyFilter, setCompanyFilter] = useState('all')
  const [search, setSearch]               = useState('')

  const filtered = useMemo(() => {
    return interviewQuestions.filter(q => {
      if (diffFilter !== 'all' && q.difficulty !== diffFilter) return false
      if (topicFilter !== 'all' && q.topic !== topicFilter) return false
      if (companyFilter !== 'all' && !q.companies.includes(companyFilter)) return false
      if (search.trim()) {
        const s = search.toLowerCase()
        if (!q.title.toLowerCase().includes(s) &&
            !(q.pattern || '').toLowerCase().includes(s) &&
            !(q.topic || '').toLowerCase().includes(s)) return false
      }
      return true
    })
  }, [diffFilter, topicFilter, companyFilter, search])

  const counts = { easy: 0, medium: 0, hard: 0 }
  interviewQuestions.forEach(q => { if (counts[q.difficulty] !== undefined) counts[q.difficulty]++ })

  const SELECT_STYLE = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 10, padding: '0.6rem 0.9rem',
    color: '#e2e8f0', fontSize: '0.85rem',
    cursor: 'pointer', outline: 'none',
    fontFamily: 'inherit',
  }

  const KNOWN_COMPANIES = [
    'Google','Amazon','Microsoft','Meta','Apple','Adobe','LinkedIn','Uber','Bloomberg','Goldman Sachs','Airbnb',
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#080c16' }}>
      <div className="max-w-[1000px] mx-auto px-5 py-8">

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginBottom: 24, color: '#475569' }}>
          <Link to="/" style={{ color: '#475569', textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={12} />
          <span style={{ fontWeight: 600, color: '#f1f5f9' }}>Interview Hub</span>
        </div>

        {/* Hero */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 34, fontWeight: 800, color: '#ffffff', marginBottom: 8 }}>
            🎯 Interview Hub
          </h1>
          <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.65, maxWidth: 620, margin: 0 }}>
            {interviewQuestions.length}+ curated DSA questions with verified solutions in Java, C++, and C.
            Each question includes company tags, approach explanations, and interviewer tips.
          </p>
        </div>

        {/* ── Stats bar ── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'TOTAL',  value: interviewQuestions.length, color: '#f1f5f9' },
            { label: 'EASY',   value: counts.easy,               color: '#4ade80' },
            { label: 'MEDIUM', value: counts.medium,             color: '#fbbf24' },
            { label: 'HARD',   value: counts.hard,               color: '#f87171' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 12, padding: '0.6rem 1.2rem', textAlign: 'center',
              minWidth: 80,
            }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569', marginTop: 3 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Filter bar ── */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search questions…"
            style={{
              flex: 1, minWidth: 160,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 10, padding: '0.6rem 1rem',
              color: '#f1f5f9', fontSize: '0.88rem', outline: 'none',
              fontFamily: 'inherit',
            }}
            onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.45)' }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.09)' }}
          />

          <select value={diffFilter} onChange={e => setDiffFilter(e.target.value)} style={SELECT_STYLE}>
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select value={topicFilter} onChange={e => setTopicFilter(e.target.value)} style={{ ...SELECT_STYLE, minWidth: 130 }}>
            <option value="all">All Topics</option>
            {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select value={companyFilter} onChange={e => setCompanyFilter(e.target.value)} style={{ ...SELECT_STYLE, minWidth: 140 }}>
            <option value="all">All Companies</option>
            {KNOWN_COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <span style={{ color: '#64748b', fontSize: '0.82rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {filtered.length} question{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ── Questions list ── */}
        <div>
          {filtered.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#475569' }}>
              No questions match your filters.
            </div>
          ) : (
            filtered.map(q => <QuestionCard key={q.id} q={q} />)
          )}
        </div>

        {/* Footer tip */}
        <div style={{
          marginTop: 40, padding: '18px 20px', borderRadius: 14,
          background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
          fontSize: 14, color: '#64748b', lineHeight: 1.7,
        }}>
          <strong style={{ color: '#818cf8' }}>Pro tip:</strong> Click "View full visualization" on any question
          to see step-by-step animations of the underlying algorithm. Visual understanding + interview preparation = maximum retention.
        </div>

      </div>
    </div>
  )
}
