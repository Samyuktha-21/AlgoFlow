import DiscussionSection from '../components/HomePage/DiscussionSection'
import Seo from '../components/Seo'

export default function DiscussionPage() {
  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', background: 'var(--page-bg)' }}>
      <Seo
        title="Discussion"
        description="Ask questions, share approaches, and discuss algorithms and interview problems with the AlgoFlow community."
      />
      <DiscussionSection />
    </div>
  )
}
