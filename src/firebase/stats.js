import {
  doc, onSnapshot, setDoc, increment, serverTimestamp,
} from 'firebase/firestore'
import { db, firebaseEnabled } from './config'

/*
 * Site-wide live counters, stored in a single Firestore doc: stats/site
 *   visits          — browser sessions that opened the site
 *   logins          — successful Google sign-ins
 *   algoViews       — algorithm pages opened
 *   learners        — unique registered users (first-ever sign-in)
 *   vizRuns         — visualizations executed (auto-runs + manual runs)
 *   learningMinutes — total minutes of visible-tab engagement across all users
 *   interviewViews  — Interview Hub opens
 * Every write is a merge + increment, so the doc self-creates on first hit
 * and concurrent visitors never clobber each other.
 */

const statsRef = () => doc(db, 'stats', 'site')

async function bump(fields) {
  if (!firebaseEnabled || !db) return
  try {
    await setDoc(statsRef(), { ...fields, updatedAt: serverTimestamp() }, { merge: true })
  } catch (e) {
    console.warn('Stats update failed:', e.message)
  }
}

/* Counted once per browser session, not per route change */
export function recordVisit() {
  try {
    if (sessionStorage.getItem('af-visit-counted')) return
    sessionStorage.setItem('af-visit-counted', '1')
  } catch {
    /* sessionStorage unavailable (private mode) — still count the visit */
  }
  bump({ visits: increment(1) })
}

export function recordLogin() {
  bump({ logins: increment(1) })
}

export function recordAlgoView() {
  bump({ algoViews: increment(1) })
}

/* Called only when a user doc is created for the first time */
export function recordNewLearner() {
  bump({ learners: increment(1) })
}

export function recordVizRun() {
  bump({ vizRuns: increment(1) })
}

export function recordLearningMinute() {
  bump({ learningMinutes: increment(1) })
}

export function recordInterviewView() {
  bump({ interviewViews: increment(1) })
}

export function recordPracticeView() {
  bump({ practiceViews: increment(1) })
}

/* Realtime subscription — cb receives { visits, logins, algoViews } or null.
   Returns an unsubscribe function. */
export function subscribeToStats(cb) {
  if (!firebaseEnabled || !db) return () => {}
  try {
    return onSnapshot(
      statsRef(),
      snap => cb(snap.exists() ? snap.data() : null),
      e => console.warn('Stats subscription failed:', e.message),
    )
  } catch (e) {
    console.warn('Stats subscription failed:', e.message)
    return () => {}
  }
}
