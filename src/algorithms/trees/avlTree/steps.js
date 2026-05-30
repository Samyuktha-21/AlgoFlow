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

  const snap = (desc, highlightIds = [], rotationType = null) => {
    const nodes = treeToNodes(root);
    steps.push({ nodes, visited: highlightIds, current: highlightIds[0] ?? null, description: desc,
      extra: { rotationType, nodeCount: nodes.length } });
  };

  snap(`AVL Tree: inserting values ${values.join(', ')}. Each node shows its Balance Factor (left height − right height).`);

  function newNode(val) {
    return { id: idCounter++, value: val, left: null, right: null };
  }

  function rotateRight(y) {
    const x = y.left, T2 = x.right;
    x.right = y; y.left = T2;
    snap(`Right Rotation: "${y.value}" moves DOWN, "${x.value}" moves UP. This fixes left-heavy imbalance (BF > 1).`, [x.id, y.id], 'RIGHT');
    return x;
  }

  function rotateLeft(x) {
    const y = x.right, T2 = y.left;
    y.left = x; x.right = T2;
    snap(`Left Rotation: "${x.value}" moves DOWN, "${y.value}" moves UP. This fixes right-heavy imbalance (BF < -1).`, [x.id, y.id], 'LEFT');
    return y;
  }

  function insert(node, val) {
    if (!node) {
      const n = newNode(val);
      snap(`Inserted ${val} as new leaf node.`, [n.id]);
      return n;
    }
    if (val < node.value) {
      snap(`${val} < ${node.value}: go LEFT`, [node.id]);
      node.left = insert(node.left, val);
    } else if (val > node.value) {
      snap(`${val} > ${node.value}: go RIGHT`, [node.id]);
      node.right = insert(node.right, val);
    } else {
      snap(`${val} already exists — no duplicate`, [node.id]);
      return node;
    }

    const bf = getBF(node);
    snap(`Check balance at ${node.value}: BF = ${bf}. ${Math.abs(bf) <= 1 ? 'Balanced ✓' : 'IMBALANCED! Need rotation.'}`, [node.id]);

    // LL Case
    if (bf > 1 && val < node.left.value) {
      snap(`LL Case at ${node.value} (BF=${bf}, inserted ${val} in LEFT-LEFT). Performing Right Rotation.`, [node.id, node.left.id], 'LL');
      return rotateRight(node);
    }
    // RR Case
    if (bf < -1 && val > node.right.value) {
      snap(`RR Case at ${node.value} (BF=${bf}, inserted ${val} in RIGHT-RIGHT). Performing Left Rotation.`, [node.id, node.right.id], 'RR');
      return rotateLeft(node);
    }
    // LR Case
    if (bf > 1 && val > node.left.value) {
      snap(`LR Case at ${node.value} (BF=${bf}, inserted ${val} in LEFT-RIGHT). Left rotate child first, then Right rotate.`, [node.id, node.left.id], 'LR');
      node.left = rotateLeft(node.left);
      return rotateRight(node);
    }
    // RL Case
    if (bf < -1 && val < node.right.value) {
      snap(`RL Case at ${node.value} (BF=${bf}, inserted ${val} in RIGHT-LEFT). Right rotate child first, then Left rotate.`, [node.id, node.right.id], 'RL');
      node.right = rotateRight(node.right);
      return rotateLeft(node);
    }

    return node;
  }

  for (const val of values) {
    snap(`Inserting ${val} into AVL Tree...`);
    root = insert(root, val);
    const nodes = treeToNodes(root);
    snap(`After inserting ${val}: tree has ${nodes.length} nodes, all balanced (|BF| ≤ 1).`, []);
  }

  snap(`AVL Tree complete! All ${values.length} values inserted. Height = ${calcHeight(root)}. Search is O(log n) guaranteed.`);
  return steps;
}