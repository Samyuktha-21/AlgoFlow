import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'
import { subscribeToAlgorithmViews, formatViews } from '../firebase/algoStats'
import { firebaseEnabled } from '../firebase/config'

/* Live per-algorithm view count, shown beside the page title.
   Streams from Firestore, so it ticks up while you watch if
   someone else opens the same algorithm. */
export default function AlgoViewsBadge({ categoryId, algorithmId, isLight }) {
  const [views, setViews] = useState(null)

  useEffect(
    () => subscribeToAlgorithmViews(categoryId, algorithmId, setViews),
    [categoryId, algorithmId],
  )

  if (!firebaseEnabled || views === null) return null

  return (
    <span
      title={`${views.toLocaleString()} views`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600,
        background: 'rgba(74,222,128,0.15)',
        color: isLight ? '#15803d' : '#86efac',
        border: '1px solid rgba(74,222,128,0.35)',
      }}
    >
      <Eye size={12} />
      {formatViews(views)} views
    </span>
  )
}
