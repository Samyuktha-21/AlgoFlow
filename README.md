# AlgoFlow — Where Logic Flows Visually

**Watch algorithms run, step by step.** AlgoFlow is an interactive learning platform that turns abstract data-structure-and-algorithm concepts into clear, animated visualizations — with the source code highlighting in sync as each step executes.

🔗 **Live:** https://algoflow-theta.vercel.app  •  💻 **Repo:** https://github.com/Samyuktha-21/AlgoFlow

> Most of us learn DSA from static diagrams and walls of code. AlgoFlow lets you *see* every comparison, swap, and traversal happen in real time.

---

## ✨ Features

- **124 algorithms across 14 themed categories** — sorting, searching, arrays & strings, linked lists, stacks & queues, hashing, trees, heaps, graphs, greedy, dynamic programming, backtracking, fundamentals, and advanced topics.
- **Step-by-step visualizations** — bars, trees, graphs, and arrays animate through each step, with a synchronized code panel highlighting the exact line being executed.
- **Multi-language code** — every visualized algorithm ships with **Java, C, and C++** implementations and a language switcher.
- **Interview Hub** — 100+ curated interview questions, each with a clear approach, time/space complexity, full solutions in all three languages, and a direct link to watch the underlying algorithm run.
- **Real-time discussion board** — a Firebase/Firestore-backed community space (Google Sign-In) to ask questions, post insights, like, and reply.
- **Fast global search** — fuzzy search across all algorithms (`Ctrl/⌘ + K`).
- **No login required** to start learning.
- **Polished, responsive UI** — dark "code-editor" aesthetic, per-category visual themes, and tasteful motion (with `prefers-reduced-motion` support).

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, Vite 8, React Router 7 |
| **Styling** | Tailwind CSS v4, Framer Motion |
| **Visualization** | D3, custom canvas/SVG renderers |
| **Code highlighting** | Prism.js (Java / C / C++) |
| **Search** | Fuse.js |
| **Backend / Realtime** | Firebase Authentication + Cloud Firestore |
| **Icons** | Lucide React |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/Samyuktha-21/AlgoFlow.git
cd AlgoFlow

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev          # http://localhost:5173

# 4. Build for production
npm run build
npm run preview
```

### Environment variables (for the Discussion board & Google Sign-In)

The visualizations and Interview Hub work out of the box. To enable the **discussion board and authentication**, create a `.env.local` file (and add the same keys in your Vercel project settings):

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> Without these, AlgoFlow runs fine — the discussion features simply stay disabled.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Layout/          # Header (navbar), Footer
│   ├── HomePage/        # Hero, live algorithm cycle, category grid, cursor glow, discussion
│   ├── Visualizer/      # Canvas, controls, theme backgrounds, per-type renderers
│   ├── InfoPanels/      # Aim, Complexity, Applications
│   └── Search/          # Global ⌘K search
├── context/             # Theme + visualization playback state, Auth
├── data/
│   ├── categories.json          # 14 category definitions
│   ├── algorithmRegistry.json   # Full algorithm catalog (124)
│   └── interviewQuestions.js    # 108 interview questions (approach, complexity, 3-lang code, viz links)
├── firebase/            # Firebase config + Firestore helpers
├── pages/               # Home, Category, Algorithm, Interview, Discussion
├── themes/              # 14 themed color palettes
└── utils/               # validators, helpers, contrast utilities
```

---

## 🧩 14 Themed Categories

Fundamentals · Sorting · Searching · Arrays & Strings · Linked Lists · Stacks & Queues · Hashing · Trees · Heaps · Graphs · Greedy · Dynamic Programming · Backtracking · Advanced

Each category has its own visual identity (water, forest, network, circuits, and more) so concepts are easier to recall.

---

## 🎯 Interview Hub

A dedicated `/interview` section with 100+ questions spanning all 14 topics. Every question follows one consistent format:

**Approach → Complexity (time & space) → Code (Java / C / C++ tabs) → "Watch the visualization"**

Filter by difficulty, topic, or company, and jump straight from a question to its animated algorithm.

---

## 👥 Authors

Built end to end — design, frontend, data, and backend — by:

- **Samyuktha** — [@Samyuktha-21](https://github.com/Samyuktha-21)
- **S Sharvesh** — [@SHARVESH08](https://github.com/SHARVESH08)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
