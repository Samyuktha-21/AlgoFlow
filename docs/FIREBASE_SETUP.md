# Firebase Setup — Complete Walkthrough

Firebase powers three things in AlgoFlow:

1. **Google Sign-In** (Firebase Authentication)
2. **Discussion board & comments** (Cloud Firestore: `discussions`, `algorithmComments`, `users`)
3. **Live hero counters** (Cloud Firestore: single doc `stats/site`)

Everything degrades gracefully — without Firebase config the site still runs, these features just stay hidden.

> **Already have Firebase working?** (Discussion board is live in production.) Then skip to **Step 5 — Security rules**. That is the only step required to turn the live counters on.

---

## Step 1 — Create the Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and sign in.
2. **Add project** → name it (e.g. `algoflow`) → Google Analytics is optional (not needed) → **Create**.

## Step 2 — Register the web app & get the config keys

1. On the project overview page, click the **`</>` (Web)** icon.
2. App nickname: `AlgoFlow Web` → **Register app** (skip Firebase Hosting — we deploy on Vercel).
3. Firebase shows a `firebaseConfig` object. Copy the six values — they map 1-to-1 to our env vars:

| Firebase config key | AlgoFlow env var |
|---|---|
| `apiKey` | `VITE_FIREBASE_API_KEY` |
| `authDomain` | `VITE_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `VITE_FIREBASE_PROJECT_ID` |
| `storageBucket` | `VITE_FIREBASE_STORAGE_BUCKET` |
| `messagingSenderId` | `VITE_FIREBASE_MESSAGING_SENDER_ID` |
| `appId` | `VITE_FIREBASE_APP_ID` |

## Step 3 — Enable Google Sign-In

1. Sidebar → **Build → Authentication → Get started**.
2. **Sign-in method** tab → enable **Google** → pick a support email → **Save**.
3. Still in Authentication → **Settings → Authorized domains** — make sure these are listed:
   - `localhost` (added by default)
   - your production domain, e.g. `algoflow-theta.vercel.app`
   - any Vercel preview domains you test sign-in on

> If sign-in works locally but fails in production with `auth/unauthorized-domain`, this list is the fix.

## Step 4 — Create the Firestore database

1. Sidebar → **Build → Firestore Database → Create database**.
2. Choose **Production mode** (we set explicit rules next — never leave test mode live).
3. Pick a region close to your users (e.g. `asia-south1` for India) — **this cannot be changed later**.

You do **not** need to create any collections by hand. `users`, `discussions`, `algorithmComments`, and `stats/site` are all created automatically the first time the app writes to them.

## Step 5 — Security rules (required for the live counters)

Sidebar → **Firestore Database → Rules** → paste, then **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ── Live hero counters ─────────────────────────────────────
    // One shared doc, readable by everyone, writable only via the
    // whitelisted counter fields (no arbitrary data, no deletes).
    match /stats/site {
      allow read: if true;
      allow create, update: if request.resource.data.keys().hasOnly([
        'visits', 'logins', 'algoViews', 'learners',
        'vizRuns', 'learningMinutes', 'interviewViews', 'updatedAt'
      ]);
    }

    // ── Per-algorithm view counters ────────────────────────────
    // One doc per algorithm: algoStats/{categoryId}__{algorithmId}.
    // Read by the algorithm-page badge and category cards; written
    // only via the whitelisted fields below.
    match /algoStats/{algoId} {
      allow read: if true;
      allow create, update: if request.resource.data.keys().hasOnly([
        'views', 'categoryId', 'algorithmId', 'updatedAt'
      ]);
    }

    // ── User profiles ──────────────────────────────────────────
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // ── Discussion board ───────────────────────────────────────
    match /discussions/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null &&
                    request.auth.uid == resource.data.uid;
      match /replies/{replyId} {
        allow read: if true;
        allow create: if request.auth != null;
        allow delete: if request.auth != null &&
                      request.auth.uid == resource.data.uid;
      }
    }

    // ── Per-algorithm comments ─────────────────────────────────
    match /algorithmComments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null
        && request.auth.uid == resource.data.uid;
    }
  }
}
```

> These rules are also checked into the repo as `firestore.rules` and can be deployed from the CLI with `npx firebase-tools deploy --only firestore:rules` (the repo is linked to the `algoflow-d499d` project via `.firebaserc`). They were last deployed to production on 2026-07-18.
>
> Note: the discussion/comment rules above assume each doc stores its author's uid in a `uid` field. If your docs use a different field name (e.g. `authorId`), adjust `resource.data.uid` accordingly.

## Step 6 — Environment variables

**Local:** create `.env.local` in the repo root (git-ignored):

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Restart `npm run dev` after creating it — Vite only reads env files at startup.

**Vercel:** Project → **Settings → Environment Variables** → add the same six keys for *Production* (and *Preview* if you want counters on preview deploys), then **redeploy**. Vite bakes env vars in at build time, so a redeploy is mandatory after adding them.

## Step 7 — Verify the counters

1. Open the deployed site. The hero should show the green **LIVE** strip.
2. In Firebase Console → Firestore, a `stats/site` doc should now exist with `visits: 1`.
3. Open the site in a second browser (or incognito) — watch the visits number tick up **live** in the first window, with a count-up animation.
4. Sign in with Google → `logins` (and `learners` on first-ever sign-in) increment.
5. Open any algorithm page → `algoViews` and `vizRuns` increment (every page auto-runs one visualization).
6. Keep a tab open ≥ 1 minute → `learningMinutes` increments.
7. Open the same algorithm page — a green **N views** badge appears beside the title, and an `algoStats/{category}__{algorithm}` doc appears in Firestore. The same count shows beside that algorithm on its category page, live.

### Seeding starting values (optional, be honest!)

The site ran for a while before counters existed, so day-one numbers will undercount reality. You can set fair starting values once, directly in the console: Firestore → `stats/site` → edit fields (e.g. set `visits` to your Vercel analytics total). After that, let the counters run on their own.

## What each counter means (for your resume)

| Field | Counted when | Resume framing |
|---|---|---|
| `visits` | Once per browser session | "**N+** site visits" |
| `learners` | First-ever Google sign-in (unique users) | "**N+** registered learners" |
| `logins` | Every successful sign-in | engagement / returning users |
| `algoViews` | An algorithm page is opened | "**N+** algorithm walkthroughs served" |
| `vizRuns` | A visualization executes | "**N+** interactive visualizations run" |
| `learningMinutes` | Each minute a tab is actively visible | "**N+** minutes (≈ N/60 hours) of learning delivered" |
| `interviewViews` | Interview Hub is opened | "**N+** interview-prep sessions" |

The hero shows four of these (configurable in `src/components/HomePage/LiveStats.jsx` → `SHOWN`); all seven are always being recorded in Firestore either way.

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| LIVE strip doesn't appear at all | Env vars missing (strip hides itself when Firebase is disabled), or the `stats/site` doc can't be read — check rules Step 5. |
| Strip appears but numbers never move | Writes are being rejected → the `stats/site` rules block isn't published, or a field name isn't in the `hasOnly` whitelist. Watch the browser console for `Stats update failed: Missing or insufficient permissions`. |
| Works locally, not on Vercel | Env vars not added to Vercel, or added but not redeployed since. |
| Sign-in popup fails in production | Domain missing from Authentication → Authorized domains. |
| `visits` seems too low while testing | By design — one count per browser session (`sessionStorage` guard). Use incognito windows to simulate new visitors. |
