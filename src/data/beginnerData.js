/* Beginner-friendly content for algorithm pages.
   Keyed by algorithmId matching algorithmRegistry.json. */

const BEGINNER_DATA = {

  // ── SORTING ─────────────────────────────────────────────
  bubbleSort: {
    emoji: '🫧',
    analogy: 'Imagine a row of students sorted by height. The tallest student keeps "bubbling up" to the right. You compare two neighbours — if the left one is taller, they swap. You repeat this until everyone is in order!',
    what: 'Repeatedly swaps neighbouring elements that are in the wrong order, slowly moving larger values to the end.',
    why: 'The simplest sorting algorithm to understand — a perfect starting point for learning how sorting works.',
    when: 'When learning sorting for the first time, or when you have a tiny list (less than 20 items).',
    companies: [
      { company: 'Education Platforms', logo: '📚', use: 'Khan Academy and coding bootcamps teach Bubble Sort first because it mirrors how humans naturally sort small sets.' },
      { company: 'Embedded Systems', logo: '🔌', use: 'Tiny microcontrollers with very limited memory sometimes use Bubble Sort for small fixed-size datasets where code simplicity matters more than speed.' },
      { company: 'Nearly-Sorted Pipelines', logo: '📊', use: 'Data pipelines that receive mostly-sorted streaming data benefit from Bubble Sort\'s adaptive O(n) best case.' },
    ],
    everyday: [
      'Sorting a hand of playing cards by rank — you naturally compare neighbours and swap.',
      'Arranging books on a shelf by height — move the tallest ones to the end.',
      'Lining up students by age — repeatedly find out-of-order pairs and swap them.',
    ],
  },

  selectionSort: {
    emoji: '🏆',
    analogy: 'Imagine picking players for a sports team. You scan all players, pick the worst one and put them in position 1. Then scan remaining players, pick the next worst, and so on. You always SELECT the minimum from what remains.',
    what: 'Finds the smallest element in the unsorted part and puts it at the beginning, one by one.',
    why: 'Very simple to understand and makes the fewest swaps — at most n-1 swaps, useful when writes to memory are expensive.',
    when: 'When write operations are costly (e.g. writing to flash memory that has a limited number of write cycles).',
    companies: [
      { company: 'Flash Memory Systems', logo: '💾', use: 'EEPROM and flash storage have write-cycle limits. Selection Sort makes at most n-1 swaps, minimising wear.' },
      { company: 'Embedded Firmware', logo: '⚙️', use: 'Simple embedded systems sort small sensor readings using Selection Sort for predictable, fixed execution time.' },
      { company: 'Educational Tools', logo: '🎓', use: 'Teaching tools use it to demonstrate finding minimums — a fundamental programming pattern.' },
    ],
    everyday: [
      'Picking the shortest person repeatedly to form a sorted line.',
      'Choosing the cheapest item from a shelf one at a time.',
      'Finding the lowest exam score and ranking students from worst to best.',
    ],
  },

  insertionSort: {
    emoji: '🃏',
    analogy: 'Think of sorting playing cards in your hand. You pick up one card at a time and slide it into the correct position among the cards you already hold. Cards shift right to make room for the new card.',
    what: 'Builds the sorted array one element at a time by inserting each new element into its correct position among already-sorted elements.',
    why: 'Very fast on nearly-sorted or small data — Python\'s built-in sort uses it for small sub-arrays.',
    when: 'When data is almost sorted, arrives one element at a time (streaming), or the array is small (< 30 elements).',
    companies: [
      { company: 'Python / TimSort', logo: '🐍', use: 'Python\'s built-in sort (TimSort) uses Insertion Sort for subarrays smaller than 64 elements because it outperforms Quick Sort on small data.' },
      { company: 'Online/Streaming Data', logo: '📡', use: 'Real-time data streams use Insertion Sort to maintain sorted order as new data arrives — only the new element needs placement.' },
      { company: 'Database Index Pages', logo: '🗄️', use: 'B-tree leaf node insertions use Insertion Sort logic to maintain sorted order within a single page.' },
    ],
    everyday: [
      'Sorting cards in your hand as you pick them up one by one.',
      'Inserting a new student into an already-sorted class register.',
      'Adding a new word into a sorted vocabulary list at the right spot.',
    ],
  },

  mergeSort: {
    emoji: '📂',
    analogy: 'You have 8 messy papers. Split into 2 piles of 4. Split each into 2 piles of 2. Split into individual papers. Now merge back: always pick the smaller top paper from either pile. You get a perfectly sorted stack!',
    what: 'Divides the array in half repeatedly until single elements remain, then merges pairs back together in sorted order.',
    why: 'Always O(n log n) — no bad cases. The go-to algorithm for sorting when consistency matters.',
    when: 'When you need guaranteed O(n log n), when stability matters, or when sorting linked lists or data that doesn\'t fit in RAM.',
    companies: [
      { company: 'Git', logo: '🔀', use: 'Git uses merge-based algorithms to combine changes from different branches, directly mirroring Merge Sort\'s merge step.' },
      { company: 'Java Arrays.sort()', logo: '☕', use: 'Java uses TimSort (Merge Sort + Insertion Sort hybrid) for sorting objects. Pure Merge Sort for primitives in older versions.' },
      { company: 'External Sorting (Databases)', logo: '🗄️', use: 'MySQL and PostgreSQL use external Merge Sort when data doesn\'t fit in RAM — merge sorted chunks from disk.' },
    ],
    everyday: [
      'Combining two sorted stacks of exam papers into one sorted stack.',
      'Merging two sorted halves of a phone book.',
      'Tournament brackets — split teams, play matches, merge winners.',
    ],
  },

  quickSort: {
    emoji: '⚡',
    analogy: 'Pick anyone from a group as the "pivot". Everyone shorter stands left, everyone taller stands right. Now do the same within each group. Keep splitting until everyone is sorted. Divide and conquer!',
    what: 'Picks a pivot element, places all smaller elements left and larger elements right, then recursively sorts both sides.',
    why: 'Fastest sorting algorithm in practice for random data — excellent cache performance and O(n log n) average.',
    when: 'When sorting large arrays of random data and average performance matters more than worst-case guarantees.',
    companies: [
      { company: 'C++ STL std::sort', logo: '⚙️', use: 'C++ standard library uses IntroSort — a Quick Sort variant that switches to Heap Sort if recursion gets too deep.' },
      { company: 'Linux Kernel', logo: '🐧', use: 'Linux kernel uses Quick Sort variants for process lists, file entries, and kernel data structures.' },
      { company: 'V8 JavaScript Engine', logo: '🌐', use: 'Chrome\'s V8 engine used Quick Sort for Array.sort() in older versions for its cache-friendly access patterns.' },
    ],
    everyday: [
      'Organising a wardrobe — pick a shirt as reference, cheaper left, expensive right.',
      'How a teacher splits a class: above average in one group, below in another.',
      'Filing documents by date: pick a date as pivot, earlier files go left, later go right.',
    ],
  },

  heapSort: {
    emoji: '⛰️',
    analogy: 'Imagine a special pyramid where the biggest number is always at the top. You remove the top (the biggest), put it at the end of your sorted list, fix the pyramid so the next biggest rises to the top, and repeat.',
    what: 'Builds a max-heap from the array, then repeatedly extracts the maximum element and places it at the end.',
    why: 'Guaranteed O(n log n) always, and uses no extra memory (in-place). Great when you can\'t risk O(n²) worst case.',
    when: 'When you need guaranteed O(n log n) with O(1) space, or when implementing a priority queue.',
    companies: [
      { company: 'Priority Queues (Linux Scheduler)', logo: '🐧', use: 'Linux OS process scheduler uses a heap-based priority queue to always run the highest-priority process next.' },
      { company: 'Dijkstra / A* Pathfinding', logo: '🗺️', use: 'Google Maps and GPS systems use min-heaps in Dijkstra\'s algorithm to always expand the shortest-known path first.' },
      { company: 'Streaming Median', logo: '📊', use: 'Financial tickers and live analytics use two heaps to maintain a running median in O(log n) per element.' },
    ],
    everyday: [
      'A hospital triage system — always treat the most critical patient first.',
      'Airport boarding — first class boards first (highest priority extracted first).',
      'Task manager — always execute the most urgent task at the top of the pile.',
    ],
  },

  countingSort: {
    emoji: '🔢',
    analogy: 'You have 100 students with scores from 0 to 10. Instead of comparing scores, just COUNT how many got each score. Then write: "3 students scored 5, 7 students scored 6…" — you instantly have a sorted list without ever comparing two students!',
    what: 'Counts how many times each value appears, then uses those counts to place elements in sorted order. Only works on integers.',
    why: 'O(n + k) — faster than any comparison-based sort when the value range k is small.',
    when: 'Sorting integers with a small known range (e.g. ages 0-150, scores 0-100). NOT for floating point.',
    companies: [
      { company: 'Radix Sort Subroutine', logo: '🔄', use: 'Radix Sort uses Counting Sort as a stable subroutine for each digit, achieving O(nk) sorting of integers.' },
      { company: 'Image Processing (Histogram)', logo: '🖼️', use: 'Adobe Photoshop and OpenCV use counting-based histograms to sort pixel intensities (0-255) for brightness adjustments.' },
      { company: 'Grade Distribution Systems', logo: '📋', use: 'University grading systems sort student scores in linear time using counting sort when the score range is small.' },
    ],
    everyday: [
      'Counting votes in an election — tally marks for each candidate, then rank.',
      'Sorting dice rolls — count how many 1s, 2s, 3s, 4s, 5s, 6s.',
      'Sorting age groups in a survey — count each age, then list them in order.',
    ],
  },

  radixSort: {
    emoji: '📮',
    analogy: 'Sorting 1000 postal codes. First sort by LAST digit into 10 buckets (0-9). Then sort by the SECOND-to-last digit (keeping relative order). Then the third-to-last. After sorting digit by digit from right to left, the codes are fully sorted!',
    what: 'Sorts numbers digit by digit from least significant to most significant, using Counting Sort at each digit step.',
    why: 'O(nk) — can beat comparison sorts for fixed-width integers like phone numbers or zip codes.',
    when: 'Sorting large sets of fixed-width integers or strings (zip codes, phone numbers, IP addresses).',
    companies: [
      { company: 'Network Routing (IP Addresses)', logo: '🌐', use: 'Routers sort IP addresses (32-bit integers) using Radix Sort for fast routing table lookups.' },
      { company: 'Suffix Array Construction', logo: '🔤', use: 'Bioinformatics tools build suffix arrays using Radix Sort for DNA sequence alignment.' },
      { company: 'NVIDIA GPU Sorting', logo: '💻', use: 'NVIDIA CUDA GPU libraries use parallel Radix Sort as the fastest general-purpose sort on graphics hardware.' },
    ],
    everyday: [
      'Sorting library books by Dewey Decimal number — process each decimal place.',
      'Organising postal codes — sort by last digit, then second-to-last, etc.',
      'Filing dates (YYYYMMDD) — sort by day, then month, then year.',
    ],
  },

  shellSort: {
    emoji: '🐚',
    analogy: 'Like Insertion Sort, but instead of comparing neighbours, you first compare elements FAR apart (gap=5), then closer (gap=2), then adjacent (gap=1). Long-range swaps move elements into roughly the right place first, making the final pass very fast.',
    what: 'A generalisation of Insertion Sort that sorts elements far apart first, then gradually reduces the gap. Faster than Insertion Sort for medium arrays.',
    why: 'Much faster than Insertion Sort in practice with no extra memory. Simple to implement.',
    when: 'Medium-sized arrays (100-5000 elements) where you want better than O(n²) but don\'t need a complex implementation.',
    companies: [
      { company: 'Embedded Systems', logo: '⚙️', use: 'Shell Sort is used in embedded firmware for moderate-sized datasets where Merge Sort\'s extra memory is unacceptable.' },
      { company: 'Early UNIX', logo: '🖥️', use: 'Original UNIX sort command used Shell Sort for its balance of simplicity and performance.' },
      { company: 'uClibc (Embedded Linux)', logo: '🐧', use: 'The lightweight C library used in embedded Linux uses Shell Sort for qsort() to save code size.' },
    ],
    everyday: [
      'A smart version of organising a shelf — first group books by genre, then sort within each genre.',
      'Sorting homework papers — first rough sort by student name initial, then precise sort.',
    ],
  },

  bucketSort: {
    emoji: '🪣',
    analogy: 'Sorting test scores 0-100. Create 10 buckets: 0-9, 10-19, 20-29, etc. Throw each score into the right bucket. Sort each small bucket. Finally, pour all buckets together — sorted! Works best when scores are spread evenly.',
    what: 'Distributes elements into buckets based on their value range, sorts each bucket individually, then concatenates them.',
    why: 'O(n + k) for uniformly distributed data — very fast when elements are evenly spread across a known range.',
    when: 'Floating-point numbers in [0,1), uniformly distributed data, or when you know the data spread in advance.',
    companies: [
      { company: 'Floating Point Sorting', logo: '🔢', use: 'Scientific computing systems sort floating-point values in [0,1) using Bucket Sort when uniform distribution is guaranteed.' },
      { company: 'Histogram Generation', logo: '📊', use: 'Tableau and PowerBI generate histograms using bucket distribution — the same principle as Bucket Sort.' },
      { company: 'Geographic Data', logo: '🗺️', use: 'GIS systems bucket-sort geographical coordinates by region before spatial processing.' },
    ],
    everyday: [
      'Sorting names into alphabet buckets (A-bucket, B-bucket…) then alphabetising each.',
      'A school organising students by year level before sorting within each year.',
      'Sorting temperatures into Cold/Cool/Warm/Hot groups then ordering within each group.',
    ],
  },

  // ── SEARCHING ────────────────────────────────────────────
  linearSearch: {
    emoji: '🔍',
    analogy: 'Looking for your friend in a crowd. You check each person one by one from left to right until you find them. Simple but slow for large crowds!',
    what: 'Checks each element one at a time from start to end until the target is found.',
    why: 'Works on ANY array — sorted or unsorted. No preprocessing needed.',
    when: 'Small arrays, unsorted data, or when you only search once and sorting first would cost more.',
    companies: [
      { company: 'Database Full Table Scan', logo: '🗄️', use: 'When no index exists, databases do a full sequential scan — the database equivalent of Linear Search.' },
      { company: 'Virus Scanners', logo: '🛡️', use: 'Antivirus software scans files sequentially looking for known malware signatures.' },
      { company: 'Log Analysis Tools', logo: '📝', use: 'Tools like grep search through log files linearly, finding matching patterns in unsorted text.' },
    ],
    everyday: [
      'Looking for your keys in an unorganised drawer.',
      'Scanning a shopping list to find a specific item.',
      'Reading every page of a book to find a specific word.',
    ],
  },

  binarySearch: {
    emoji: '📖',
    analogy: 'Finding a word in a dictionary. Open to the middle page. Is your word before or after? Flip to the middle of the correct half. Repeat. Each step cuts remaining pages in HALF. Way faster than reading every page!',
    what: 'Works ONLY on sorted arrays. Repeatedly halves the search space by comparing with the middle element.',
    why: 'O(log n) — searches a million elements in at most 20 comparisons. Dramatically faster than linear search.',
    when: 'Sorted arrays, dictionaries, any ordered data structure. Most common search algorithm in practice.',
    companies: [
      { company: 'Database Index Lookups', logo: '🗄️', use: 'B-tree indexes in MySQL and PostgreSQL use binary search logic to find records in O(log n) time.' },
      { company: 'Git Bisect', logo: '🔀', use: 'Git\'s "git bisect" uses binary search to find which commit introduced a bug — halves the commit history each step.' },
      { company: 'Standard Libraries', logo: '📚', use: 'Java\'s Arrays.binarySearch(), Python\'s bisect, and C++\'s std::lower_bound all implement binary search.' },
    ],
    everyday: [
      'Finding a word in a physical dictionary.',
      'Finding a song in a sorted playlist by jumping to the middle.',
      'Guessing a number (1-100) optimally by always guessing the middle.',
    ],
  },

  jumpSearch: {
    emoji: '🦘',
    analogy: 'Looking for a name in a phone book. Instead of reading every page, you jump ahead 10 pages at a time. Once you jump too far, go back and search that section page by page. Faster than linear, simpler than binary.',
    what: 'Jumps ahead by √n steps in a sorted array, then does linear search within the identified block.',
    why: 'O(√n) — between linear O(n) and binary O(log n). Useful when backward jumps are expensive.',
    when: 'Sorted arrays stored on tape or disk where seeking backwards is costly.',
    companies: [
      { company: 'Sequential Access Storage', logo: '📼', use: 'Tape drives and certain disk storage benefit from Jump Search because it minimises backward seeks.' },
      { company: 'Linked List Search', logo: '🔗', use: 'Jump Search is more practical than Binary Search on singly-linked lists where you can only go forward.' },
    ],
    everyday: [
      'Looking for "Smith" in a phone book by jumping 10 pages at a time.',
      'Scanning a sorted product catalog by jumping to every 10th page first.',
    ],
  },

  exponentialSearch: {
    emoji: '📈',
    analogy: 'Looking for "Zara" in a huge dictionary. Instead of going to the middle, you try page 1, page 2, page 4, page 8, page 16… doubling each time until you overshoot. Then binary search in the last valid range. Finds the right neighbourhood first!',
    what: 'Finds the range where the element might be (by doubling: 1, 2, 4, 8…) then applies binary search in that range.',
    why: 'O(log n) — optimal for unbounded or infinite arrays. Reaches the right neighbourhood in log n doublings.',
    when: 'Unbounded arrays (unknown size), or when target is near the start of a large sorted array.',
    companies: [
      { company: 'Unbounded/Infinite Sorted Arrays', logo: '♾️', use: 'Search systems where data is appended continuously use exponential search since array size is unknown.' },
      { company: 'Sorted Data Streams', logo: '📡', use: 'Streaming databases use exponential search when the total stream length is unknown.' },
    ],
    everyday: [
      'Guessing a high number — try 1, 2, 4, 8, 16… until too high, then refine.',
      'Finding the right page in a book when you don\'t know how long it is.',
    ],
  },

  interpolationSearch: {
    emoji: '🎯',
    analogy: 'Looking for "Zara" in a phone book. You wouldn\'t open to the middle — you\'d open NEAR THE END because "Z" is near the end of the alphabet! Interpolation Search makes this smart guess using a formula based on the value you\'re looking for.',
    what: 'Like Binary Search but smarter — estimates WHERE the target is using a mathematical formula, like a human would open a dictionary.',
    why: 'O(log log n) for uniformly distributed data — much faster than binary search in the best case.',
    when: 'Sorted arrays with uniformly distributed values (like uniformly spaced numbers or phone numbers).',
    companies: [
      { company: 'Uniformly Distributed Databases', logo: '🗄️', use: 'Database systems with uniformly distributed primary keys use interpolation-based lookup for O(log log n) access.' },
      { company: 'Numerical Methods', logo: '🔬', use: 'Scientific computing uses interpolation search for finding values in uniformly spaced lookup tables.' },
    ],
    everyday: [
      'Opening a dictionary near "Z" when looking for "Zebra" — not the middle.',
      'Guessing someone\'s age by looking at them — using context (visual appearance) as the heuristic.',
    ],
  },

  // ── GRAPHS ───────────────────────────────────────────────
  bfs: {
    emoji: '🌊',
    analogy: 'Imagine dropping a stone in a pond. Ripples spread outward in rings — first the ring closest to the stone, then the next, then the next. BFS explores a graph the same way: visit all nodes 1 step away, then 2 steps away, and so on.',
    what: 'Explores a graph level by level, visiting all neighbours before going deeper. Uses a queue (FIFO).',
    why: 'Guaranteed to find the SHORTEST PATH in unweighted graphs. Visits nodes in order of distance from start.',
    when: 'Finding shortest path in unweighted graphs, level-order traversal, or any "minimum hops" problem.',
    companies: [
      { company: 'Social Networks (Facebook/LinkedIn)', logo: '👥', use: 'Finding shortest connection between two people ("6 degrees of separation") uses BFS on the friendship graph.' },
      { company: 'GPS Navigation (Unweighted)', logo: '🗺️', use: 'Finding minimum number of roads/hops between locations uses BFS when all roads have equal cost.' },
      { company: 'Web Crawlers (Google)', logo: '🌐', use: 'Web crawlers use BFS starting from seed URLs, discovering new pages layer by layer.' },
    ],
    everyday: [
      'Finding who among your Facebook friends is closest to a celebrity.',
      'The "6 degrees of Kevin Bacon" game — BFS on the actor network.',
      'A fire spreading from one room to adjacent rooms, level by level.',
    ],
  },

  dfs: {
    emoji: '🕳️',
    analogy: 'Exploring a cave system. You always go as deep as possible down one tunnel before backing up and trying another. You go deep, hit a dead end, backtrack, try the next tunnel, go deep again.',
    what: 'Explores as far as possible along each branch before backtracking. Uses a stack (or recursion).',
    why: 'Uses less memory than BFS (stack depth vs queue width). Natural for recursion-based problems.',
    when: 'Maze solving, topological sort, detecting cycles, finding connected components, tree traversals.',
    companies: [
      { company: 'Compilers', logo: '💻', use: 'Compilers use DFS to traverse Abstract Syntax Trees (AST) to generate code, check types, and optimise.' },
      { company: 'Maze/Puzzle Solvers', logo: '🎮', use: 'Game AI explores possible moves using DFS (with backtracking) to find solutions to mazes and puzzles.' },
      { company: 'Dependency Resolution (npm/pip)', logo: '📦', use: 'Package managers use DFS to resolve dependency trees and detect circular dependencies.' },
    ],
    everyday: [
      'Exploring a cave system — always go as deep as possible before turning back.',
      'Reading a book\'s chapters, then sections, then paragraphs — going deep first.',
      'Solving a maze by always turning right until you hit a wall, then backtracking.',
    ],
  },

  dijkstra: {
    emoji: '🗺️',
    analogy: 'Google Maps finding the fastest route. It starts at your location and always explores the currently cheapest (shortest) path next, updating routes as it discovers faster ones. It expands like a GPS recalculating in real time.',
    what: 'Finds the shortest path from a source to ALL other nodes in a weighted graph with non-negative edge weights.',
    why: 'The gold standard for shortest-path problems with positive weights. O((V+E) log V) with a priority queue.',
    when: 'Road navigation, network routing, any graph with non-negative edge weights and shortest-path needs.',
    companies: [
      { company: 'Google Maps', logo: '🗺️', use: 'Google Maps uses Dijkstra\'s (and variants) to find fastest driving routes across road networks.' },
      { company: 'Internet Routing (OSPF)', logo: '🌐', use: 'OSPF routing protocol used by internet routers runs Dijkstra\'s to compute shortest paths across the network.' },
      { company: 'Game AI Pathfinding', logo: '🎮', use: 'Video game NPCs use Dijkstra\'s (or A*) to navigate game maps from one point to another.' },
    ],
    everyday: [
      'Google Maps finding the fastest route avoiding traffic.',
      'A delivery driver planning the shortest route to visit multiple stops.',
      'Finding the cheapest sequence of flights between two cities.',
    ],
  },

  bellmanFord: {
    emoji: '🔄',
    analogy: 'Like Dijkstra\'s, but it doesn\'t mind negative roads (like a toll refund!). It relaxes ALL edges V-1 times. On the Vth pass, if any distance still improves, there\'s a negative cycle — a loop where you keep gaining distance forever.',
    what: 'Finds shortest paths from source, handles negative edge weights, and detects negative cycles.',
    why: 'The only shortest-path algorithm that correctly handles negative edge weights and detects negative cycles.',
    when: 'Graphs with negative weights (currency exchange, debt networks), or when you need to detect negative cycles.',
    companies: [
      { company: 'Currency Arbitrage Detection', logo: '💱', use: 'Finance systems use Bellman-Ford to detect currency arbitrage opportunities (negative cycles in exchange rate graphs).' },
      { company: 'Network Routing (RIP Protocol)', logo: '🌐', use: 'RIP (Routing Information Protocol) uses Bellman-Ford for distributed shortest-path computation in networks.' },
      { company: 'Economic Modelling', logo: '📈', use: 'Economic models with negative-cost edges (subsidies, refunds) use Bellman-Ford for optimal path analysis.' },
    ],
    everyday: [
      'Finding the cheapest sequence of currency exchanges, including exchange rate bonuses.',
      'Planning a road trip where some roads have toll refunds (negative cost).',
    ],
  },

  floydWarshall: {
    emoji: '🕸️',
    analogy: 'Finding distances between ALL pairs of cities. For each possible "stopover city", check: is A→C→B shorter than A→B directly? Try every possible stopover. After trying all cities, you have all shortest paths between all pairs.',
    what: 'Finds shortest paths between ALL pairs of vertices in a single O(V³) algorithm.',
    why: 'One pass gives you ALL-pairs shortest paths. Perfect when you need distances between every pair of nodes.',
    when: 'Small graphs (V ≤ 500) where you need shortest paths between ALL pairs, not just from one source.',
    companies: [
      { company: 'Network Latency Maps', logo: '🌐', use: 'Data centre networking teams use Floyd-Warshall to compute latency between every pair of servers.' },
      { company: 'Transport/Logistics Planning', logo: '🚚', use: 'Logistics companies pre-compute all-pairs distances between warehouses and delivery points.' },
      { company: 'Social Network Analysis', logo: '👥', use: 'Computing the diameter and average path length of social networks uses all-pairs shortest paths.' },
    ],
    everyday: [
      'A bus company computing travel times between every pair of stops in their network.',
      'Finding the fastest route between any two cities in a small country.',
    ],
  },

  prim: {
    emoji: '🌱',
    analogy: 'Growing a tree from a seed. Start at one city. Add the cheapest road connecting your growing tree to any unconnected city. Keep adding the cheapest available road until all cities are connected. You grow a Minimum Spanning Tree!',
    what: 'Builds a Minimum Spanning Tree by always adding the cheapest edge that connects the MST to a new vertex.',
    why: 'Finds the cheapest way to connect all nodes — minimum total edge weight while keeping the graph connected.',
    when: 'Building minimum-cost networks: power grids, telephone networks, road systems.',
    companies: [
      { company: 'Telecommunications', logo: '📡', use: 'Telecom companies use Prim\'s to design minimum-cost cable networks connecting all customers.' },
      { company: 'Power Grid Design', logo: '⚡', use: 'Electrical utilities use minimum spanning trees to design power distribution networks at minimum cost.' },
      { company: 'Cluster Analysis (Machine Learning)', logo: '🤖', use: 'Single-linkage clustering uses MST algorithms to group data points by proximity.' },
    ],
    everyday: [
      'Building the cheapest road network to connect all villages.',
      'Laying minimum-length cable to connect all computers in an office.',
    ],
  },

  kruskal: {
    emoji: '🔗',
    analogy: 'Building a cheap railway network. Sort ALL possible rail lines by cost. Add the cheapest line — but ONLY if it doesn\'t create a loop. Keep adding the next cheapest non-loop edge until all cities are connected.',
    what: 'Builds MST by sorting all edges by weight and adding them one by one, skipping edges that would create a cycle.',
    why: 'Simpler to implement for sparse graphs. Uses Union-Find for fast cycle detection.',
    when: 'Sparse graphs, when edges are already sorted, or when edge-based reasoning is more natural.',
    companies: [
      { company: 'Network Cable Layout', logo: '🌐', use: 'Network engineers use Kruskal\'s to determine which physical connections to build in a data centre at minimum cost.' },
      { company: 'Image Segmentation', logo: '🖼️', use: 'Computer vision uses MST-based segmentation (Kruskal\'s) to group pixels into regions for object detection.' },
      { company: 'VLSI Circuit Design', logo: '💡', use: 'Chip designers use MST algorithms to route minimal-length connections between components on a chip.' },
    ],
    everyday: [
      'Building the cheapest electricity grid — lay the cheapest cable first, skip any that would create a loop.',
      'Connecting islands with bridges — always build the shortest bridge that expands the connected landmass.',
    ],
  },

  topologicalSort: {
    emoji: '📋',
    analogy: 'Planning your morning: Getting dressed requires showering first. Showering requires waking up. Eating breakfast requires cooking first. Topological Sort gives you the ORDER to do tasks so all requirements are met first. Like a project timeline!',
    what: 'Orders vertices in a Directed Acyclic Graph (DAG) so that for every edge A→B, A comes before B in the ordering.',
    why: 'Essential for dependency resolution — determines valid execution order when tasks depend on each other.',
    when: 'Build systems, course prerequisites, task scheduling, and any problem with ordering dependencies.',
    companies: [
      { company: 'Build Systems (Make, Gradle)', logo: '🔨', use: 'Make and Gradle use topological sort to determine the order to compile files based on dependencies.' },
      { company: 'npm/pip Package Managers', logo: '📦', use: 'Package managers install dependencies in topological order — dependencies installed before the packages that need them.' },
      { company: 'Spreadsheet Calculation (Excel)', logo: '📊', use: 'Excel recalculates cells in topological order of their formula dependencies.' },
    ],
    everyday: [
      'Planning a project timeline — identify which tasks depend on others, do prerequisites first.',
      'University course requirements — must take Calculus before Physics.',
      'Getting dressed — underwear before trousers, socks before shoes.',
    ],
  },

  cycleDetection: {
    emoji: '🔄',
    analogy: 'Walking through a neighbourhood. If you ever reach a street you\'ve already visited, you\'ve walked in a circle — there\'s a cycle! For one-way streets (directed), you check if you revisit a street WHILE still on your current walk.',
    what: 'Determines if a graph contains a cycle. Uses DFS with a recursion stack for directed graphs, or Union-Find for undirected.',
    why: 'Essential before running topological sort, detecting deadlocks, and validating DAG properties.',
    when: 'Validating dependency graphs, detecting deadlocks in operating systems, or checking if a graph is a DAG.',
    companies: [
      { company: 'OS Deadlock Detection', logo: '💻', use: 'Operating systems detect deadlocks by checking for cycles in the resource allocation graph.' },
      { company: 'Compiler Circular Imports', logo: '⚙️', use: 'Compilers detect circular imports (A imports B imports A) using cycle detection on the dependency graph.' },
      { company: 'Blockchain Validation', logo: '⛓️', use: 'Blockchain systems verify transaction validity by ensuring the UTXO graph is acyclic (no double-spending loops).' },
    ],
    everyday: [
      'Detecting that a road loop exists in a city street network.',
      'Finding circular references in a spreadsheet (A1 depends on B1 depends on A1).',
    ],
  },

  unionFind: {
    emoji: '👥',
    analogy: 'Social network friend groups. Each person starts alone. When two people become friends, merge their groups. "Find" tells you which group someone belongs to. "Union" merges two groups. You can instantly tell if any two people are in the same friend group!',
    what: 'Tracks which elements belong to the same group, with fast merge (union) and lookup (find) operations.',
    why: 'Nearly O(1) per operation with path compression and union by rank. Perfect for dynamic connectivity.',
    when: 'Kruskal\'s MST, network connectivity, image segmentation, and any problem requiring dynamic grouping.',
    companies: [
      { company: 'Kruskal\'s MST Algorithm', logo: '🌐', use: 'Union-Find is the data structure that makes Kruskal\'s MST algorithm efficient for cycle detection.' },
      { company: 'Social Network Components', logo: '👥', use: 'Finding all connected components in large social networks (who can reach whom) uses Union-Find.' },
      { company: 'Percolation (Physics Simulation)', logo: '🔬', use: 'Physicists use Union-Find to simulate whether a material percolates (is connected from top to bottom).' },
    ],
    everyday: [
      'Tracking which islands are connected by bridges as you build them one at a time.',
      'Merging friend groups in a social network — instantly knowing if two people are connected.',
    ],
  },

  scc: {
    emoji: '🏝️',
    analogy: 'Finding islands in a river system where all rivers are one-way. A Strongly Connected Component is a group of cities where you can travel from any city to any other city using the one-way roads. Kosaraju finds all such islands.',
    what: 'Finds groups of nodes where every node can reach every other node — even with directed edges.',
    why: 'Reveals the structure of directed graphs — which parts are mutually reachable and which are one-way.',
    when: 'Web page link analysis, compiler optimisation (finding loops), social network cohesion analysis.',
    companies: [
      { company: 'Google PageRank', logo: '🌐', use: 'Google analyses strongly connected components of the web graph to understand link structure and authority.' },
      { company: 'Social Media Analysis', logo: '📱', use: 'Twitter\'s follow graph is analysed for SCCs to find tight-knit communities where everyone follows everyone else.' },
      { company: 'Compiler Loop Detection', logo: '⚙️', use: 'Compilers find SCCs in control flow graphs to identify loops for optimisation.' },
    ],
    everyday: [
      'Cities in a one-way road network where you can get from any city to any other city.',
      'Finding groups of Twitter users who all follow each other (mutual follower cliques).',
    ],
  },

  bipartiteCheck: {
    emoji: '🔵🔴',
    analogy: 'Can you colour a map with just 2 colours so no two neighbouring countries share the same colour? A graph is bipartite if you can colour every node RED or BLUE so no two connected nodes share a colour. Use BFS to try 2-colouring!',
    what: 'Checks if a graph can be divided into two groups where every edge connects nodes from different groups.',
    why: 'Bipartite graphs model matching problems: job-applicant matching, student-course scheduling.',
    when: 'Two-sided matching problems, conflict-free scheduling, and detecting odd cycles in graphs.',
    companies: [
      { company: 'Job Matching Platforms (LinkedIn)', logo: '💼', use: 'LinkedIn\'s job matching models the job-applicant graph as bipartite: jobs on one side, applicants on the other.' },
      { company: 'Course Scheduling', logo: '🎓', use: 'Universities check bipartiteness when scheduling exams to ensure no student has two exams at the same time.' },
      { company: 'Recommendation Systems', logo: '⭐', use: 'Netflix/Spotify model user-content interactions as bipartite graphs (users vs items) for recommendations.' },
    ],
    everyday: [
      'Assigning teams so no two friends are on the same team (2-colouring the friendship graph).',
      'Scheduling matches in a round-robin tournament so no one plays twice in one round.',
    ],
  },

  astar: {
    emoji: '🧭',
    analogy: 'Finding the fastest route in a maze. Like Dijkstra\'s, but smarter — it uses a HINT (heuristic) about how far the goal is. If the goal is to the right, it prioritises moving right first. The hint makes it skip useless directions, finding the path much faster.',
    what: 'Finds the shortest path using a heuristic to guide the search toward the goal. Combines actual cost (Dijkstra) and estimated remaining cost.',
    why: 'Finds optimal shortest paths faster than Dijkstra\'s by focusing the search toward the goal.',
    when: 'Game pathfinding, robotics navigation, GPS routing — any problem with a good distance heuristic.',
    companies: [
      { company: 'Video Games (Unity, Unreal)', logo: '🎮', use: 'Virtually every pathfinding system in 2D/3D games uses A* to navigate NPCs and characters.' },
      { company: 'Robotics (ROS)', logo: '🤖', use: 'Robot Operating System uses A* and its variants for autonomous robot navigation in physical spaces.' },
      { company: 'Google Maps', logo: '🗺️', use: 'Modern navigation systems use A* variants with geographic heuristics for route planning.' },
    ],
    everyday: [
      'Finding your way through a mall to the exit — using your sense of direction as the heuristic.',
      'A GPS giving turn-by-turn directions using estimated remaining distance as a hint.',
    ],
  },
}

export function getBeginnerData(algorithmId) {
  return BEGINNER_DATA[algorithmId] || null
}

export default BEGINNER_DATA
