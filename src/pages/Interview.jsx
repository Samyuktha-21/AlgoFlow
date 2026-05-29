import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronDown, ExternalLink, Star, Building2, Lightbulb, ArrowRight } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import interviewQuestions, { DIFFICULTIES, TOPICS, COMPANIES } from '../data/interviewQuestions'

const DIFF_COLOR = {
  easy:   { text: '#4ade80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.3)' },
  medium: { text: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)' },
  hard:   { text: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)' },
}

function FrequencyDots({ freq }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: '50%',
          background: i <= freq ? '#fbbf24' : 'rgba(255,255,255,0.12)',
        }} />
      ))}
    </div>
  )
}

function CompanyBadge({ company }) {
  const COLORS = {
    Google:'#4285F4', Amazon:'#FF9900', Microsoft:'#00A4EF', Meta:'#0866FF',
    Apple:'#555', Uber:'#000', Adobe:'#FF0000', Bloomberg:'#A2A2A2',
    LinkedIn:'#0A66C2', Goldman:'#6495ED', 'Goldman Sachs':'#6495ED',
  }
  const col = COLORS[company] || '#475569'
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: `${col}18`, color: col, border: `1px solid ${col}30`,
      whiteSpace: 'nowrap',
    }}>{company}</span>
  )
}

function QuestionCard({ q, isDark }) {
  const [expanded, setExpanded] = useState(false)
  const [lang, setLang] = useState('java')
  const dc = DIFF_COLOR[q.difficulty]

  const code = q.solution?.[lang] || ''

  return (
    <motion.div
      layout
      style={{
        borderRadius: 16,
        background: isDark ? 'rgba(15,23,42,0.7)' : 'rgba(255,255,255,0.9)',
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
        backdropFilter: 'blur(8px)',
        overflow: 'hidden',
        marginBottom: 12,
      }}
    >
      {/* Header */}
      <div
        style={{ padding: '16px 20px', cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setExpanded(e => !e)}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          {/* Difficulty badge */}
          <span style={{
            padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
            background: dc.bg, color: dc.text, border: `1px solid ${dc.border}`,
            flexShrink: 0, textTransform: 'capitalize',
          }}>
            {q.difficulty}
          </span>

          {/* Title */}
          <span style={{
            fontSize: 17, fontWeight: 600, flex: 1,
            color: isDark ? '#f8fafc' : '#0f172a',
          }}>
            {q.title}
          </span>

          {/* Frequency */}
          <FrequencyDots freq={q.frequency} />

          {/* Expand chevron */}
          <ChevronDown size={16} style={{
            color: isDark ? '#475569' : '#94a3b8', flexShrink: 0,
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }} />
        </div>

        {/* Pattern + companies row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          <span style={{
            padding: '1px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
            background: 'rgba(99,102,241,0.15)', color: '#818cf8',
            border: '1px solid rgba(99,102,241,0.25)',
          }}>{q.pattern}</span>
          <span style={{ color: isDark ? '#475569' : '#94a3b8', fontSize: 11 }}>•</span>
          {q.companies.slice(0, 4).map(c => <CompanyBadge key={c} company={c} />)}
          {q.companies.length > 4 && (
            <span style={{ fontSize: 11, color: isDark ? '#475569' : '#94a3b8' }}>
              +{q.companies.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}` }}
          >
            <div style={{ padding: '20px 24px' }}>
              {/* Description */}
              <p style={{ fontSize: 15, lineHeight: 1.72, color: isDark ? '#cbd5e1' : '#334155', marginBottom: 20 }}>
                {q.description}
              </p>

              {/* Complexity */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                {[
                  { label: 'Time', value: q.complexity.time, color: '#fbbf24' },
                  { label: 'Space', value: q.complexity.space, color: '#34d399' },
                ].map(c => (
                  <div key={c.label} style={{
                    padding: '8px 14px', borderRadius: 10,
                    background: `${c.color}10`, border: `1px solid ${c.color}25`,
                  }}>
                    <span style={{ fontSize: 11, color: isDark ? '#64748b' : '#94a3b8', display: 'block', fontWeight: 600 }}>
                      {c.label}
                    </span>
                    <code style={{ fontSize: 14, fontWeight: 700, color: c.color }}>
                      {c.value}
                    </code>
                  </div>
                ))}
              </div>

              {/* Approach */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Lightbulb size={14} style={{ color: '#fbbf24' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24' }}>APPROACH</span>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: isDark ? '#94a3b8' : '#475569' }}>
                  {q.solution?.approach}
                </p>
              </div>

              {/* Code */}
              {code && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                    {['java', 'cpp', 'c'].map(l => (
                      <button key={l} onClick={() => setLang(l)} style={{
                        padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                        background: lang === l ? 'rgba(99,102,241,0.25)' : 'transparent',
                        border: `1px solid ${lang === l ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`,
                        color: lang === l ? '#818cf8' : isDark ? '#64748b' : '#94a3b8',
                        cursor: 'pointer',
                      }}>
                        {l === 'cpp' ? 'C++' : l === 'c' ? 'C' : 'Java'}
                      </button>
                    ))}
                  </div>
                  <pre style={{
                    background: '#0d1117', color: '#e6edf3',
                    borderRadius: 12, padding: '16px 18px', fontSize: 13,
                    overflowX: 'auto', lineHeight: 1.65, margin: 0,
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <code>{code}</code>
                  </pre>
                </div>
              )}

              {/* Interviewer Tips */}
              {q.interviewerTips?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Star size={14} style={{ color: '#f472b6' }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#f472b6' }}>INTERVIEWER TIPS</span>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {q.interviewerTips.map((tip, i) => (
                      <li key={i} style={{ display: 'flex', gap: 8, fontSize: 14, color: isDark ? '#94a3b8' : '#475569', lineHeight: 1.6 }}>
                        <span style={{ color: '#f472b6', flexShrink: 0 }}>→</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Follow-ups */}
              {q.followUpQuestions?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#60a5fa', marginBottom: 8 }}>
                    FOLLOW-UP QUESTIONS
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {q.followUpQuestions.map((fq, i) => (
                      <li key={i} style={{ display: 'flex', gap: 8, fontSize: 14, color: isDark ? '#64748b' : '#94a3b8' }}>
                        <ArrowRight size={13} style={{ flexShrink: 0, marginTop: 2 }} />
                        {fq}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Link to full algorithm */}
              {q.algorithmLink && (
                <Link to={q.algorithmLink} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 13, fontWeight: 600, color: '#60a5fa',
                  textDecoration: 'none',
                }}>
                  <ExternalLink size={13} />
                  View full visualization
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Interview() {
  const { isDark } = useTheme()
  const [diffFilter, setDiffFilter]     = useState('all')
  const [topicFilter, setTopicFilter]   = useState('all')
  const [companyFilter, setCompanyFilter] = useState('all')
  const [search, setSearch]             = useState('')

  const filtered = useMemo(() => {
    return interviewQuestions.filter(q => {
      if (diffFilter !== 'all' && q.difficulty !== diffFilter) return false
      if (topicFilter !== 'all' && q.topic !== topicFilter) return false
      if (companyFilter !== 'all' && !q.companies.includes(companyFilter)) return false
      if (search.trim() && !q.title.toLowerCase().includes(search.toLowerCase()) &&
          !q.pattern.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [diffFilter, topicFilter, companyFilter, search])

  const counts = { easy: 0, medium: 0, hard: 0 }
  interviewQuestions.forEach(q => { counts[q.difficulty]++ })

  const textColor = isDark ? '#f1f5f9' : '#0f172a'
  const mutedColor = isDark ? '#94a3b8' : '#64748b'
  const cardBg = isDark ? 'rgba(15,23,42,0.8)' : 'rgba(255,255,255,0.95)'
  const selectBg = isDark ? '#1e293b' : '#ffffff'
  const selectBorder = isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0'

  return (
    <div style={{ minHeight: '100vh', background: isDark ? '#020617' : '#f8fafc' }}>
      <div className="max-w-[1100px] mx-auto px-5 py-8">

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginBottom: 24, color: mutedColor }}>
          <Link to="/" style={{ color: mutedColor, textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={12} />
          <span style={{ fontWeight: 600, color: textColor }}>Interview Hub</span>
        </div>

        {/* Hero */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: textColor, marginBottom: 8 }}>
            🎯 Interview Hub
          </h1>
          <p style={{ fontSize: 17, color: mutedColor, lineHeight: 1.65, maxWidth: 680 }}>
            Curated interview questions with verified solutions in Java, C, and C++.
            Each question includes company tags, interviewer tips, and follow-up variants.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          {[
            { label: 'Total', value: interviewQuestions.length, color: '#60a5fa' },
            { label: 'Easy',   value: counts.easy,   color: '#4ade80' },
            { label: 'Medium', value: counts.medium, color: '#fbbf24' },
            { label: 'Hard',   value: counts.hard,   color: '#f87171' },
          ].map(s => (
            <div key={s.label} style={{
              padding: '10px 18px', borderRadius: 12,
              background: `${s.color}10`, border: `1px solid ${s.color}25`,
            }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: mutedColor, fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap',
          padding: '16px', borderRadius: 14,
          background: cardBg,
          border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
        }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter by name or pattern…"
            style={{
              flex: '1 1 180px', padding: '8px 14px', borderRadius: 10, fontSize: 14,
              background: selectBg, border: `1px solid ${selectBorder}`,
              color: textColor, outline: 'none',
            }}
          />
          {[
            { label: 'Difficulty', value: diffFilter, set: setDiffFilter, opts: ['all', 'easy', 'medium', 'hard'] },
            { label: 'Topic', value: topicFilter, set: setTopicFilter, opts: ['all', ...TOPICS] },
            { label: 'Company', value: companyFilter, set: setCompanyFilter, opts: ['all', 'Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Uber', 'Bloomberg', 'Goldman Sachs'] },
          ].map(f => (
            <select
              key={f.label}
              value={f.value}
              onChange={e => f.set(e.target.value)}
              style={{
                padding: '8px 12px', borderRadius: 10, fontSize: 13,
                background: selectBg, border: `1px solid ${selectBorder}`,
                color: textColor, cursor: 'pointer', outline: 'none',
              }}
            >
              {f.opts.map(o => (
                <option key={o} value={o}>{o === 'all' ? `All ${f.label}s` : o}</option>
              ))}
            </select>
          ))}
          <span style={{ fontSize: 13, color: mutedColor, alignSelf: 'center', paddingLeft: 4 }}>
            {filtered.length} question{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Questions */}
        <div>
          {filtered.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: mutedColor }}>
              No questions match your filters.
            </div>
          ) : filtered.map(q => (
            <QuestionCard key={q.id} q={q} isDark={isDark} />
          ))}
        </div>

        {/* Footer note */}
        <div style={{ marginTop: 40, padding: '20px', borderRadius: 14,
          background: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)',
          border: '1px solid rgba(99,102,241,0.2)',
          fontSize: 14, color: mutedColor, lineHeight: 1.7 }}>
          <strong style={{ color: '#818cf8' }}>Pro tip:</strong> For each question, click
          "View full visualization" to see step-by-step animations of the underlying algorithm.
          Pair the visual understanding with the interview solutions for maximum retention.
        </div>

      </div>
    </div>
  )
}
