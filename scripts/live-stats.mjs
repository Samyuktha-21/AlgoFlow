/* Read the live site counters WITHOUT visiting the website.
   Counters only increment from client-side code on the site itself, so this
   read-only Firestore REST call never affects the numbers.

   Run: npm run stats

   The API key below is the Firebase *web* key — it is public by design
   (it ships in the site's JS bundle) and grants no write access beyond
   what Firestore security rules already allow. */

const PROJECT_ID = 'algoflow-d499d'
const API_KEY    = 'AIzaSyCxhz8FvtWDrB9wDjpgsem-dUng1avblDA'

const URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/stats/site?key=${API_KEY}`

const LABELS = {
  visits:          'Site visits',
  logins:          'Google sign-ins',
  learners:        'Registered learners',
  algoViews:       'Algorithm pages opened',
  vizRuns:         'Visualizations run',
  learningMinutes: 'Learning minutes',
  interviewViews:  'Interview Hub opens',
}

const res = await fetch(URL)
if (!res.ok) {
  console.error(`Firestore request failed: ${res.status} ${res.statusText}`)
  console.error(await res.text())
  process.exit(1)
}

const doc = await res.json()
const fields = doc.fields || {}

console.log('\n  AlgoFlow live stats  (stats/site — read-only, count NOT affected)\n')
for (const [key, label] of Object.entries(LABELS)) {
  const v = fields[key]?.integerValue ?? fields[key]?.doubleValue ?? '—'
  console.log(`  ${label.padEnd(26)} ${String(v).padStart(8)}`)
}
const updated = fields.updatedAt?.timestampValue
if (updated) {
  console.log(`\n  Last activity: ${new Date(updated).toLocaleString()}\n`)
}
