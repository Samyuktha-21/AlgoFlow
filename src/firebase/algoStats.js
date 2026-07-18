import {
  doc, collection, query, where,
  onSnapshot, setDoc, increment, serverTimestamp,
} from 'firebase/firestore'
import { db, firebaseEnabled } from './config'

/*
 * Per-algorithm view counters — one doc per algorithm:
 *   algoStats/{categoryId}__{algorithmId} → { views, categoryId, algorithmId }
 * categoryId/algorithmId are duplicated as fields so a whole category's
 * counts can be streamed with a single query on the Category page.
 */

const algoRef = (categoryId, algorithmId) =>
  doc(db, 'algoStats', `${categoryId}__${algorithmId}`)

export async function recordAlgorithmView(categoryId, algorithmId) {
  if (!firebaseEnabled || !db || !categoryId || !algorithmId) return
  try {
    await setDoc(algoRef(categoryId, algorithmId), {
      views: increment(1), categoryId, algorithmId, updatedAt: serverTimestamp(),
    }, { merge: true })
  } catch (e) {
    console.warn('Algorithm view update failed:', e.message)
  }
}

/* Live view count for one algorithm — cb(number). Returns unsubscribe. */
export function subscribeToAlgorithmViews(categoryId, algorithmId, cb) {
  if (!firebaseEnabled || !db) return () => {}
  try {
    return onSnapshot(
      algoRef(categoryId, algorithmId),
      snap => cb(snap.exists() ? (snap.data().views ?? 0) : 0),
      e => console.warn('Algorithm views subscription failed:', e.message),
    )
  } catch (e) {
    console.warn('Algorithm views subscription failed:', e.message)
    return () => {}
  }
}

/* Live view counts for every algorithm in a category —
   cb({ [algorithmId]: views }). Returns unsubscribe. */
export function subscribeToCategoryViews(categoryId, cb) {
  if (!firebaseEnabled || !db) return () => {}
  try {
    const q = query(collection(db, 'algoStats'), where('categoryId', '==', categoryId))
    return onSnapshot(
      q,
      snap => {
        const map = {}
        snap.forEach(d => { map[d.data().algorithmId] = d.data().views ?? 0 })
        cb(map)
      },
      e => console.warn('Category views subscription failed:', e.message),
    )
  } catch (e) {
    console.warn('Category views subscription failed:', e.message)
    return () => {}
  }
}

/* 1234 → "1.2k", 999 → "999" */
export function formatViews(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  return String(n)
}
