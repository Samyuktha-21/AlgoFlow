const MONO = "'IBM Plex Mono', monospace"
const ACCENT = '#f5811f'

const A = ({ children }) => <span style={{ color: ACCENT }}>{children}</span>

function Facts() {
  return (
    <span style={{ fontFamily: MONO, fontSize: '0.85rem', color: '#a3a3a3' }}>
      Every step synced to highlighted code&nbsp;&nbsp;·&nbsp;&nbsp;
      <A>3</A> languages: Java, C, C++&nbsp;&nbsp;·&nbsp;&nbsp;
      <A>124</A> algorithms, zero placeholders&nbsp;&nbsp;·&nbsp;&nbsp;
      Real Firestore-backed discussion&nbsp;&nbsp;·&nbsp;&nbsp;
      <A>85+</A> verified interview questions&nbsp;&nbsp;·&nbsp;&nbsp;
      No login required to watch&nbsp;&nbsp;·&nbsp;&nbsp;
      Built by one person, not a team&nbsp;&nbsp;·&nbsp;&nbsp;
    </span>
  )
}

export default function FactsTicker() {
  return (
    <div
      className="facts-ticker"
      aria-hidden="true"
      style={{
        background: '#161616',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '1rem 0', overflow: 'hidden', whiteSpace: 'nowrap',
      }}
    >
      <div
        className="facts-ticker-track"
        style={{ display: 'inline-block', whiteSpace: 'nowrap', animation: 'marquee-scroll 50s linear infinite', willChange: 'transform' }}
      >
        <Facts />
        <Facts />
      </div>
    </div>
  )
}
