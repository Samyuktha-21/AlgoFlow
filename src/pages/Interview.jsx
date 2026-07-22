import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronDown, ExternalLink } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import interviewQuestions, { TOPICS } from '../data/interviewQuestions'
import { recordInterviewView } from '../firebase/stats'
import Seo from '../components/Seo'

const MONO = "'IBM Plex Mono', monospace"
const SECTION_LABEL = { fontFamily: MONO, fontSize: '0.7rem', letterSpacing: '0.1em', fontWeight: 700, color: '#f5811f', marginBottom: '0.4rem' }

/* Derive structured approach + complexity from a legacy "answer" string,
   e.g. "Approach: … Key insight: … Time: O(n), Space: O(1)" */
function parseAnswer(ans) {
  if (!ans) return { approach: '', complexity: null }
  const time = ans.match(/Time:\s*(O\([^)]*\)[^,;.]*)/i)
  const space = ans.match(/Space:\s*(O\([^)]*\)[^,;.]*)/i)
  let approach = ans
  const ti = ans.search(/\bTime:/i)
  if (ti > 0) approach = ans.slice(0, ti).replace(/[\s.]+$/, '') + '.'
  const complexity = (time || space) ? { time: time?.[1]?.trim(), space: space?.[1]?.trim() } : null
  return { approach: approach.trim(), complexity }
}

/* ── Difficulty badge styles (light-colored per spec) ──────────── */
const DIFF_STYLES = {
  easy:   { bg: '#dcfce7', color: '#15803d', border: '#86efac' },
  medium: { bg: '#fef9c3', color: '#a16207', border: '#fde047' },
  hard:   { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' },
}

/* ── Company brand colors ──────────────────────────────────────── */
const COMPANY_STYLES = {
  Google:         { bg: 'rgba(66,133,244,0.12)',  color: '#60a5fa', colorLight: '#1d4ed8', border: 'rgba(66,133,244,0.25)' },
  Amazon:         { bg: 'rgba(255,153,0,0.12)',   color: '#fbbf24', colorLight: '#b45309', border: 'rgba(255,153,0,0.25)' },
  Microsoft:      { bg: 'rgba(0,164,239,0.12)',   color: '#38bdf8', colorLight: '#0369a1', border: 'rgba(0,164,239,0.25)' },
  Meta:           { bg: 'rgba(24,119,242,0.12)',  color: '#818cf8', colorLight: '#4338ca', border: 'rgba(24,119,242,0.25)' },
  Apple:          { bg: 'var(--page-surface-2)', color: '#64748b', border: 'var(--page-border)' },
  Adobe:          { bg: 'rgba(255,0,0,0.1)',      color: '#f87171', colorLight: '#b91c1c', border: 'rgba(255,0,0,0.2)' },
  LinkedIn:       { bg: 'rgba(10,102,194,0.12)',  color: '#60a5fa', colorLight: '#1d4ed8', border: 'rgba(10,102,194,0.25)' },
  Uber:           { bg: 'var(--page-surface-2)', color: '#64748b', border: 'var(--page-border)' },
  Bloomberg:      { bg: 'var(--page-surface-2)', color: '#64748b', border: 'var(--page-border)' },
  'Goldman Sachs':{ bg: 'rgba(100,149,237,0.12)', color: '#93c5fd', colorLight: '#1e40af', border: 'rgba(100,149,237,0.25)' },
  Airbnb:         { bg: 'rgba(255,90,95,0.12)',   color: '#f87171', colorLight: '#be123c', border: 'rgba(255,90,95,0.25)' },
}
const DEFAULT_COMPANY = { bg: 'var(--page-surface-2)', color: '#64748b', border: 'var(--page-border)' }

function CompanyTag({ company }) {
  const { isDark } = useTheme()
  const s = COMPANY_STYLES[company] || DEFAULT_COMPANY
  const color = isDark ? s.color : (s.colorLight || s.color)
  return (
    <span style={{
      background: s.bg, color, border: `1px solid ${s.border}`,
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
  const parsed = parseAnswer(q.answer)
  const approachText = q.approach || parsed.approach || q.solution?.approach || q.answer || ''
  const complexity = q.complexity || parsed.complexity || null
  const code = q.code || q.solution || {}
  const hasCode = !!(code.java || code.cpp || code.c)
  const vizLink = q.visualizationLink ?? q.algorithmLink ?? null

  const showHover = hovered && !expanded

  return (
    <div
      style={{
        background: showHover ? 'var(--page-surface-2)' : 'var(--page-surface)',
        border: `1px solid ${(expanded || showHover) ? 'rgba(245,129,31,0.25)' : 'var(--page-border)'}`,
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

        <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--chrome-text)', flex: 1 }}>
          {q.title}
        </span>

        <ChevronDown size={16} style={{
          color: (showHover || expanded) ? '#f5811f' : 'var(--chrome-text-muted)', flexShrink: 0,
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease, color 0.2s ease',
        }} />
      </div>

      {/* ── Row 2: topic tag + separator + company tags ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.6rem', alignItems: 'center' }}>
        <span style={{
          background: 'rgba(245,129,31,0.12)', border: '1px solid rgba(245,129,31,0.28)',
          color: '#fdba74', borderRadius: 6, padding: '2px 8px',
          fontSize: '0.72rem', fontWeight: 500, whiteSpace: 'nowrap',
        }}>
          {q.topic}
        </span>

        <span style={{ color: 'var(--chrome-text-muted)', fontSize: 10, userSelect: 'none' }}>·</span>

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
                borderTop: '1px solid rgba(245,129,31,0.15)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* 1. APPROACH */}
              {approachText && (
                <div style={{ marginBottom: 16 }}>
                  <div style={SECTION_LABEL}>APPROACH</div>
                  <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--chrome-text-muted)', margin: 0 }}>
                    {approachText}
                  </p>
                </div>
              )}

              {/* 2. COMPLEXITY */}
              {complexity && (
                <div style={{ marginBottom: 16 }}>
                  <div style={SECTION_LABEL}>COMPLEXITY</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[
                      { label: 'Time', value: complexity.time },
                      { label: 'Space', value: complexity.space },
                    ].filter(c => c.value).map(c => (
                      <span key={c.label} style={{
                        background: 'var(--page-surface)', border: '1px solid var(--page-border)',
                        borderRadius: 6, padding: '4px 10px',
                        fontFamily: MONO, fontSize: '0.78rem', color: 'var(--chrome-text)',
                      }}>
                        {c.label}: {c.value}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. CODE */}
              {hasCode && (
                <div style={{ marginBottom: 4 }}>
                  <div style={SECTION_LABEL}>CODE</div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                    {['java', 'c', 'cpp', 'python'].map(l => (
                      <button key={l} type="button" onClick={() => setLang(l)} style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                        background: lang === l ? 'rgba(245,129,31,0.18)' : 'transparent',
                        border: `1px solid ${lang === l ? 'rgba(245,129,31,0.45)' : 'var(--page-border)'}`,
                        color: lang === l ? '#fdba74' : '#64748b',
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}>
                        {l === 'cpp' ? 'C++' : l === 'c' ? 'C' : l === 'python' ? 'Python' : 'Java'}
                      </button>
                    ))}
                  </div>
                  <pre style={{
                    background: '#0d0d0d', color: '#e6edf3',
                    borderRadius: 8, padding: '1rem', fontSize: '0.82rem',
                    overflowX: 'auto', lineHeight: 1.6, margin: 0,
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    <code>{code[lang] || '// Not available'}</code>
                  </pre>
                </div>
              )}

              {/* 4. Visualization link — only when one exists */}
              {vizLink && (
                <div style={{ marginTop: 16 }}>
                  <Link to={vizLink} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    background: 'rgba(245,129,31,0.12)', border: '1px solid rgba(245,129,31,0.3)',
                    color: '#fdba74', borderRadius: 8, padding: '0.5rem 1rem',
                    fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', transition: 'background 0.18s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,129,31,0.2)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,129,31,0.12)' }}
                  >
                    <ExternalLink size={13} />
                    View visualization →
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

  /* Feed the homepage live "interview sessions" counter */
  useEffect(() => { recordInterviewView() }, [])

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
    background: 'var(--page-surface)',
    border: '1px solid var(--page-border)',
    borderRadius: 10, padding: '0.6rem 0.9rem',
    color: 'var(--chrome-text)', fontSize: '0.85rem',
    cursor: 'pointer', outline: 'none',
    fontFamily: 'inherit', transition: 'border-color 0.18s',
  }
  const selectFocus = e => { e.target.style.borderColor = 'rgba(245,129,31,0.4)' }
  const selectBlur  = e => { e.target.style.borderColor = 'var(--page-border)' }

  const KNOWN_COMPANIES = [
    'Google','Amazon','Microsoft','Meta','Apple','Adobe','LinkedIn','Uber','Bloomberg','Goldman Sachs','Airbnb',
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)' }}>
      <Seo
        title="Interview Hub"
        description="108 curated coding-interview questions with worked solutions in Java, C, C++ and Python, organized by topic and company."
      />
      <div className="max-w-[1000px] mx-auto px-5 py-8">

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginBottom: 24, color: 'var(--chrome-text-muted)' }}>
          <Link to="/" style={{ color: 'var(--chrome-text-muted)', textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={12} />
          <span style={{ fontWeight: 600, color: 'var(--chrome-text)' }}>Interview Hub</span>
        </div>

        {/* Hero */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 34, fontWeight: 800, color: 'var(--chrome-text)', marginBottom: 8 }}>
            🎯 Interview Hub
          </h1>
          <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.65, maxWidth: 620, margin: 0 }}>
            {interviewQuestions.length}+ curated DSA questions with verified solutions in Java, C++, C, and Python.
            Each question includes company tags, approach explanations, and interviewer tips.
          </p>
        </div>

        {/* ── Stats bar ── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'TOTAL',  value: interviewQuestions.length, color: 'var(--chrome-text)' },
            { label: 'EASY',   value: counts.easy,               color: '#22c55e' },
            { label: 'MEDIUM', value: counts.medium,             color: '#f59e0b' },
            { label: 'HARD',   value: counts.hard,               color: '#ef4444' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--page-surface)',
              border: '1px solid var(--page-border)',
              borderRadius: 12, padding: '0.6rem 1.2rem', textAlign: 'center',
              minWidth: 80,
            }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--chrome-text-muted)', marginTop: 3 }}>
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
              background: 'var(--page-surface)',
              border: '1px solid var(--page-border)',
              borderRadius: 10, padding: '0.6rem 1rem',
              color: 'var(--chrome-text)', fontSize: '0.88rem', outline: 'none',
              fontFamily: 'inherit', transition: 'border-color 0.18s',
            }}
            onFocus={e => { e.target.style.borderColor = '#f5811f' }}
            onBlur={e => { e.target.style.borderColor = 'var(--page-border)' }}
          />

          <select value={diffFilter} onChange={e => setDiffFilter(e.target.value)} style={SELECT_STYLE} onFocus={selectFocus} onBlur={selectBlur}>
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select value={topicFilter} onChange={e => setTopicFilter(e.target.value)} style={{ ...SELECT_STYLE, minWidth: 130 }} onFocus={selectFocus} onBlur={selectBlur}>
            <option value="all">All Topics</option>
            {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select value={companyFilter} onChange={e => setCompanyFilter(e.target.value)} style={{ ...SELECT_STYLE, minWidth: 140 }} onFocus={selectFocus} onBlur={selectBlur}>
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
          background: 'rgba(245,129,31,0.08)', border: '1px solid rgba(245,129,31,0.2)',
          fontSize: 14, color: 'var(--chrome-text-muted)', lineHeight: 1.7,
        }}>
          <strong style={{ color: '#f5811f' }}>Pro tip:</strong> Click "View full visualization" on any question
          to see step-by-step animations of the underlying algorithm. Visual understanding + interview preparation = maximum retention.
        </div>

      </div>
    </div>
  )
}
