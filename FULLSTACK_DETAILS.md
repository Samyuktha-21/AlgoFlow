    # AlgoFlow — Full-Stack Technical Details

## Overview

AlgoFlow is a single-page React application (built with Vite) deployed to Vercel, backed by Firebase as a Backend-as-a-Service — Firestore for data, Cloud Functions for server-trusted logic, and Firebase Auth for login. This is the standard "JAMstack + Firebase" pattern: frontend, backend, and database are three distinct managed layers rather than a custom self-hosted server.

## Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + Vite 8 (build tool), React Router 7 (routing), Tailwind CSS 4 (styling) |
| **UI / Animation** | Framer Motion (animations), D3.js (algorithm visualizations), Prism.js (syntax highlighting), Lucide React (icons), Fuse.js (fuzzy search) |
| **Backend** | Firebase Cloud Functions (Node.js 20 runtime) — server-authoritative logic for XP, daily challenges, and leaderboard writes, deployed via `firebase-functions` v5 |
| **Database** | Cloud Firestore (NoSQL, real-time) — stores user profiles, progress, XP/streaks, live site stats; Firestore Security Rules enforce write validation server-side |
| **Auth** | Firebase Authentication (Google OAuth sign-in) |
| **Deployment** | Frontend → **Vercel** (auto-deploys from `main` on every push, SPA rewrites via `vercel.json`); Backend/DB → **Firebase** (Cloud Functions + Firestore rules deployed via Firebase CLI) |
| **Dev Tooling** | ESLint 10, custom Node.js audit scripts (correctness / input-contract / visualizer-contract validation across all 124 algorithms) |

## Why Server-Authoritative Backend Logic

XP, streaks, and leaderboard scores are written exclusively through Cloud Functions rather than directly from the client. Firestore Security Rules block all client-side writes to these fields. This closes off score-spoofing — a client can't fake XP or leaderboard rank by calling Firestore directly, since only the server-side function (which enforces daily caps and validates state transitions) is permitted to write those fields.

## Repository

**GitHub:** https://github.com/Samyuktha-21/AlgoFlow
**Live site:** https://algoflow-theta.vercel.app

---
*Generated for Mini Project / Internship certificate documentation.*
