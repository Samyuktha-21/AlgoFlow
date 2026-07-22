import registry from '../data/algorithmRegistry.json'
import categories from '../data/categories.json'

/* The ONLY game module that uses import.meta.glob (Vite-only). Builds the
   eligible-algorithm pool from the registry, discovering metadata (eager)
   and steps generators (lazy) on disk. */
const metaModules  = import.meta.glob('../algorithms/**/metadata.json', { eager: true })
const stepsLoaders = import.meta.glob('../algorithms/**/steps.js')

const themeOf   = (categoryId) => (categories.find(c => c.id === categoryId)?.theme) || 'circuit'
const metaPath  = (c, a) => `../algorithms/${c}/${a}/metadata.json`
const stepsPath = (c, a) => `../algorithms/${c}/${a}/steps.js`

export function buildPool(selectedCategoryIds) {
  const cats = (selectedCategoryIds && selectedCategoryIds.length)
    ? selectedCategoryIds
    : Object.keys(registry)
  const pool = []
  for (const categoryId of cats) {
    for (const algorithmId of (registry[categoryId] || [])) {
      const meta = metaModules[metaPath(categoryId, algorithmId)]
      const metadata = meta?.default || meta
      if (!metadata) continue
      pool.push({
        categoryId,
        algorithmId,
        name: metadata.name,
        type: metadata.type,
        themeId: themeOf(categoryId),
        hasSteps: !!stepsLoaders[stepsPath(categoryId, algorithmId)],
      })
    }
  }
  return pool
}

export async function loadEntry(pm) {
  const meta = metaModules[metaPath(pm.categoryId, pm.algorithmId)]
  const metadata = meta?.default || meta
  let generateSteps = null
  const loader = stepsLoaders[stepsPath(pm.categoryId, pm.algorithmId)]
  if (loader) {
    try { generateSteps = (await loader()).generateSteps || null } catch { generateSteps = null }
  }
  return { ...pm, metadata, generateSteps }
}

export const allNames = (pool) => pool.map(p => p.name)
