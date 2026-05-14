# AlgoFlow — Where Logic Flows Visually

A beautiful, educational algorithm visualization platform featuring 100+ algorithms across 14 categories with themed animations and step-by-step walkthroughs.

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

---

## ✅ Implemented Algorithms (3 of 100+)

| Algorithm      | Category  | Theme   |
|---------------|-----------|---------|
| Bubble Sort   | Sorting   | 💧 Water |
| Binary Search | Searching | 🔦 Light |
| BFS           | Graphs    | 🌐 Network |

All other algorithms show a "Coming Soon" page and are ready to be implemented following the guide below.

---

## 📁 Project Structure

```
src/
├── algorithms/                   # Algorithm data
│   ├── sorting/bubbleSort/       # metadata.json, code.json, steps.js
│   ├── searching/binarySearch/
│   └── graphs/bfs/
├── components/
│   ├── Layout/                   # Header, Footer
│   ├── HomePage/                 # Hero, CategoryGrid, CategoryCard
│   ├── CategoryPage/             # CategoryHeader, AlgorithmList
│   ├── Visualizer/               # Canvas, Controls, Input, Theme backgrounds
│   │                             #   SortVisualizer, SearchVisualizer, GraphVisualizer
│   ├── CodeDisplay/              # CodeBlock, LanguageSwitcher
│   └── InfoPanels/               # AimPanel, ComplexityPanel, ApplicationsPanel
├── context/
│   ├── ThemeContext.jsx          # Light/dark mode
│   └── VisualizationContext.jsx  # Playback state
├── data/
│   ├── categories.json           # 14 category definitions
│   └── algorithmRegistry.json   # Full algorithm registry (100+)
├── pages/                        # Home, Category, Algorithm
├── themes/themeConfig.js         # 14 themed color palettes
└── utils/                        # validators.js, helpers.js
```

---

## ➕ How to Add a New Algorithm

### 1. Create the folder
```
src/algorithms/{categoryId}/{algorithmId}/
```

### 2. `metadata.json`
```json
{
  "id": "insertionSort",
  "name": "Insertion Sort",
  "category": "sorting",
  "type": "sorting",
  "description": "Builds the sorted array one element at a time...",
  "aim": "To sort by inserting each element into its correct position...",
  "howItWorks": ["Start from index 1", "Compare with elements before it", "..."],
  "complexity": {
    "time": {
      "best": "O(n)", "bestCase": "Already sorted",
      "average": "O(n²)", "averageCase": "Random data",
      "worst": "O(n²)", "worstCase": "Reverse sorted"
    },
    "space": "O(1)", "spaceDescription": "In-place",
    "stable": true, "adaptive": true
  },
  "applications": {
    "realWorld": ["Small datasets", "Nearly sorted data"],
    "whenToUse": ["n < 50 and data nearly sorted"],
    "alternatives": ["Use Merge Sort for larger datasets"]
  }
}
```

### 3. `code.json`
Include Java, C, C++ implementations. See `bubbleSort/code.json` for the exact format.

### 4. `steps.js`
```js
export function generateSteps(inputArray) {
  const steps = []
  // Each step object:
  steps.push({
    array: [...arr],       // Current array state
    comparing: [i, j],    // Indices highlighted yellow
    swapping: [],         // Indices highlighted red
    sorted: [],           // Indices highlighted green
    description: 'Step description shown to user',
    codeLine: 5,          // 1-indexed line to highlight in code view
  })
  return steps
}
```

**For searching algorithms** (`type: "searching"`):
```js
export function generateSteps(sortedArray, target) {
  steps.push({ array, low, high, mid, found, eliminated, target, description, codeLine })
}
```

**For graph algorithms** (`type: "graph"`):
```js
export function generateSteps(nodes, edges, startNode) {
  steps.push({ nodes, edges, visited, current, queue, description, codeLine })
}
```

### 5. Update registry
In `src/data/algorithmRegistry.json`, set `"implemented": true`.

---

## 🎨 14 Themed Categories

| Category | Theme | Icon |
|----------|-------|------|
| Fundamentals | Compass | 🧭 |
| Sorting | Water | 💧 |
| Searching | Light/Spotlight | 🔦 |
| Array & String | Puzzle | 🧩 |
| Linked Lists | Chain | ⛓️ |
| Stack & Queue | Books | 📚 |
| Hashing | Filing Cabinet | 🗂️ |
| Trees | Forest | 🌳 |
| Heaps | Mountains | ⛰️ |
| Graphs | Network/Constellations | 🌐 |
| Greedy | Archery | 🎯 |
| Dynamic Programming | Building Blocks | 🧱 |
| Backtracking | Maze | 🔀 |
| Advanced | Neural/Circuit | 🧠 |

---

## 🛠️ Tech Stack

- **React 18** + **Vite 6**
- **Tailwind CSS v4** (Vite plugin)
- **Framer Motion** — animations
- **Prism.js** — syntax highlighting (Java, C, C++)
- **Lucide React** — icons
- **React Router v6** — routing
