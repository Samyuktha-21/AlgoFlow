/* Pure, derived achievement badges for the Phase 4b engagement loop. Every
   badge is unlocked purely from durable stats already tracked in Phase 4a
   (learned/solved/longest-streak/daily/level) — there is no new stored state,
   so nothing here can be farmed and no Firestore/rules change is needed.
   Icons are plain strings (resolved to lucide components in the UI) so this
   module stays React-free and node-testable. See the 4b design spec. */

export const BADGES = [
  { id: 'learn-1',   title: 'First Steps',    desc: 'Learn your first algorithm',   stat: 'learned', threshold: 1,  tier: 'bronze', icon: 'BookOpen' },
  { id: 'learn-10',  title: 'Bookworm',       desc: 'Learn 10 algorithms',          stat: 'learned', threshold: 10, tier: 'silver', icon: 'BookOpen' },
  { id: 'learn-25',  title: 'Scholar',        desc: 'Learn 25 algorithms',          stat: 'learned', threshold: 25, tier: 'gold',   icon: 'GraduationCap' },
  { id: 'solve-1',   title: 'Problem Solver', desc: 'Solve your first problem',     stat: 'solved',  threshold: 1,  tier: 'bronze', icon: 'CheckCircle2' },
  { id: 'solve-10',  title: 'Grinder',        desc: 'Solve 10 practice problems',  stat: 'solved',  threshold: 10, tier: 'silver', icon: 'CheckCircle2' },
  { id: 'solve-25',  title: 'Code Machine',   desc: 'Solve 25 practice problems',  stat: 'solved',  threshold: 25, tier: 'gold',   icon: 'Code2' },
  { id: 'streak-3',  title: 'Warming Up',     desc: 'Reach a 3-day streak',         stat: 'streak',  threshold: 3,  tier: 'bronze', icon: 'Flame' },
  { id: 'streak-7',  title: 'Week Warrior',   desc: 'Reach a 7-day streak',         stat: 'streak',  threshold: 7,  tier: 'silver', icon: 'Flame' },
  { id: 'streak-30', title: 'Unstoppable',    desc: 'Reach a 30-day streak',        stat: 'streak',  threshold: 30, tier: 'gold',   icon: 'Flame' },
  { id: 'daily-5',   title: 'Regular',        desc: 'Complete 5 daily challenges',  stat: 'daily',   threshold: 5,  tier: 'bronze', icon: 'CalendarCheck' },
  { id: 'daily-20',  title: 'Devoted',        desc: 'Complete 20 daily challenges', stat: 'daily',   threshold: 20, tier: 'silver', icon: 'CalendarCheck' },
  { id: 'level-5',   title: 'Rising Star',    desc: 'Reach level 5',                stat: 'level',   threshold: 5,  tier: 'silver', icon: 'Zap' },
  { id: 'level-10',  title: 'Veteran',        desc: 'Reach level 10',               stat: 'level',   threshold: 10, tier: 'gold',   icon: 'Trophy' },
]

/* Annotate every badge with the user's progress toward it. `stats` is a flat
   map of stat-key → number, e.g. { learned, solved, streak, daily, level }. */
export function evaluateBadges(stats = {}) {
  return BADGES.map(b => {
    const value = stats[b.stat] || 0
    const earned = value >= b.threshold
    const progressPct = Math.max(0, Math.min(100, Math.round((value / b.threshold) * 100)))
    return { ...b, value, earned, progressPct }
  })
}

export function earnedBadgeCount(stats = {}) {
  return evaluateBadges(stats).filter(b => b.earned).length
}
