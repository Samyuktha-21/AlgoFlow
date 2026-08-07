// Full AVL Tree insert visualization with rotations and balance factors
// Default input triggers LL rotation: [30, 20, 40, 10, 25] then [5] causes LL

function calcHeight(node) {
  if (!node) return 0;
  return 1 + Math.max(calcHeight(node.left), calcHeight(node.right));
}

function getBF(node) {
  if (!node) return 0;
  return calcHeight(node.left) - calcHeight(node.right);
}

// Convert tree to flat node list for visualization
function treeToNodes(root, x=400, y=40, gap=140) {
  if (!root) return [];
  const nodes = [];
  function traverse(node, nx, ny, g) {
    if (!node) return;
    const bf = getBF(node);
    nodes.push({ id: node.id, value: node.value, x: nx, y: ny, bf, height: calcHeight(node),
      left: node.left?.id ?? null, right: node.right?.id ?? null });
    if (node.left)  traverse(node.left,  nx - g, ny + 70, g * 0.6);
    if (node.right) traverse(node.right, nx + g, ny + 70, g * 0.6);
  }
  traverse(root, x, y, gap);
  return nodes;
}

export function generateSteps(inputArray) {
  // Accept array input or use default
  const values = Array.isArray(inputArray) && inputArray.length >= 2
    ? inputArray
    : [30, 20, 40, 10, 25];

  const steps = [];
  let idCounter = 0;
  let root = null;

  /* codeLine numbers refer to the Java block in code.json (the canonical
     source every language's lineMap is keyed against). */
  const snap = (desc, highlightIds = [], rotationType = null, codeLine = null) => {
    const nodes = treeToNodes(root);
    steps.push({ nodes, visited: highlightIds, current: highlightIds[0] ?? null, description: desc,
      extra: { rotationType, nodeCount: nodes.length }, codeLine });
  };

  snap(`AVL Tree: inserting values ${values.join(', ')}. Each node shows its Balance Factor (left height − right height).`, [], null, 10);

  function newNode(val) {
    return { id: idCounter++, value: val, left: null, right: null };
  }

  /* A rotation rewires a subtree whose parent still points at the OLD root,
     so for the moment between the rewire and the caller's reassignment the
     tree reachable from `root` is missing nodes. Snapping there drew a broken
     tree and highlighted a node that was not in it. The description is queued
     instead and flushed once the insert has finished and the tree is whole. */
  const pending = [];
  const queue = (desc, ids, kind, codeLine) => pending.push({ desc, ids, kind, codeLine });

  function rotateRight(y) {
    const x = y.left, T2 = x.right;
    x.right = y; y.left = T2;
    queue(`Right Rotation: "${y.value}" moves DOWN, "${x.value}" moves UP. This fixes left-heavy imbalance (BF > 1).`, [x.id, y.id], 'RIGHT', 14);
    return x;
  }

  function rotateLeft(x) {
    const y = x.right, T2 = y.left;
    y.left = x; x.right = T2;
    queue(`Left Rotation: "${x.value}" moves DOWN, "${y.value}" moves UP. This fixes right-heavy imbalance (BF < -1).`, [x.id, y.id], 'LEFT', 23);
    return y;
  }

  function insert(node, val) {
    if (!node) {
      /* No snapshot here. The node is created but not yet linked into the
         tree, so treeToNodes(root) cannot see it — snapping now highlights a
         node the visualizer does not draw. The caller snaps once it is
         attached. */
      return newNode(val);
    }
    if (val < node.value) {
      snap(`${val} < ${node.value}: go LEFT`, [node.id], null, 32);
      const hadLeft = node.left;
      node.left = insert(node.left, val);
      if (!hadLeft) snap(`Inserted ${val} as a new leaf below ${node.value}.`, [node.left.id], null, 31);
    } else if (val > node.value) {
      snap(`${val} > ${node.value}: go RIGHT`, [node.id], null, 33);
      const hadRight = node.right;
      node.right = insert(node.right, val);
      if (!hadRight) snap(`Inserted ${val} as a new leaf below ${node.value}.`, [node.right.id], null, 31);
    } else {
      snap(`${val} already exists — no duplicate`, [node.id], null, 34);
      return node;
    }

    const bf = getBF(node);
    snap(`Check balance at ${node.value}: BF = ${bf}. ${Math.abs(bf) <= 1 ? 'Balanced ✓' : 'IMBALANCED! Need rotation.'}`, [node.id], null, 36);

    // LL Case
    if (bf > 1 && val < node.left.value) {
      snap(`LL Case at ${node.value} (BF=${bf}, inserted ${val} in LEFT-LEFT). Performing Right Rotation.`, [node.id, node.left.id], 'LL', 37);
      return rotateRight(node);
    }
    // RR Case
    if (bf < -1 && val > node.right.value) {
      snap(`RR Case at ${node.value} (BF=${bf}, inserted ${val} in RIGHT-RIGHT). Performing Left Rotation.`, [node.id, node.right.id], 'RR', 38);
      return rotateLeft(node);
    }
    // LR Case
    if (bf > 1 && val > node.left.value) {
      snap(`LR Case at ${node.value} (BF=${bf}, inserted ${val} in LEFT-RIGHT). Left rotate child first, then Right rotate.`, [node.id, node.left.id], 'LR', 39);
      node.left = rotateLeft(node.left);
      return rotateRight(node);
    }
    // RL Case
    if (bf < -1 && val < node.right.value) {
      snap(`RL Case at ${node.value} (BF=${bf}, inserted ${val} in RIGHT-LEFT). Right rotate child first, then Left rotate.`, [node.id, node.right.id], 'RL', 43);
      node.right = rotateRight(node.right);
      return rotateLeft(node);
    }

    return node;
  }

  for (const val of values) {
    snap(`Inserting ${val} into AVL Tree...`, [], null, 30);
    const hadRoot = root;
    root = insert(root, val);
    /* The very first value has no parent to announce it. */
    if (!hadRoot) snap(`Inserted ${val} as the root.`, [root.id], null, 31);
    /* The tree is whole again, so the rotations can be shown against it. */
    for (const p of pending) snap(p.desc, p.ids, p.kind, p.codeLine);
    pending.length = 0;
    const nodes = treeToNodes(root);
    snap(`After inserting ${val}: tree has ${nodes.length} nodes, all balanced (|BF| ≤ 1).`, [], null, 47);
  }

  snap(`AVL Tree complete! All ${values.length} values inserted. Height = ${calcHeight(root)}. Search is O(log n) guaranteed.`, [], null, 8);
  return steps;
}