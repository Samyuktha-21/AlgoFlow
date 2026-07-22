import { useLocation } from 'react-router-dom'

/*
 * Centralized per-page document metadata.
 *
 * Uses React 19's native document metadata support: <title>, <meta> and
 * <link> rendered here are automatically hoisted into <head>. No portal or
 * helmet library needed.
 *
 * Note: this is client-rendered, so Google (which executes JS) indexes it
 * correctly. Non-JS social scrapers fall back to the static tags in
 * index.html and the default OG card.
 */

const SITE_NAME = 'AlgoFlow'
const SITE_URL  = 'https://algoflow-theta.vercel.app'
const DEFAULT_DESC = 'Learn algorithms by watching them run — interactive, step-by-step visualizations with code in Java, C, C++ and Python.'
const DEFAULT_OG = `${SITE_URL}/og-default.svg`

export default function Seo({ title, description, image, type = 'website' }) {
  const { pathname } = useLocation()
  const url = SITE_URL + pathname

  const fullTitle = title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} — Algorithm Visualizer`
  const desc = description || DEFAULT_DESC
  const ogImage = image || DEFAULT_OG

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />
    </>
  )
}
