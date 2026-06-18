const LIGHT_THEMES = new Set(['water', 'puzzle', 'chain', 'books'])

export function getThemeContrast(themeId) {
  const isLight = LIGHT_THEMES.has(themeId)
  return {
    isLight,
    heading:     isLight ? '#0f172a'                   : '#ffffff',
    subheading:  isLight ? '#334155'                   : 'rgba(255,255,255,0.88)',
    muted:       isLight ? '#475569'                   : '#94a3b8',
    breadcrumb:  isLight ? 'rgba(0,0,0,0.45)'          : 'rgba(255,255,255,0.5)',
    divider:     isLight
      ? 'linear-gradient(to right,transparent,rgba(0,0,0,0.12) 20%,rgba(0,0,0,0.12) 80%,transparent)'
      : 'linear-gradient(to right,transparent,rgba(255,255,255,0.15) 20%,rgba(255,255,255,0.15) 80%,transparent)',
    cardBg:      isLight ? 'rgba(255,255,255,0.55)'    : 'rgba(255,255,255,0.05)',
    cardBorder:  isLight ? 'rgba(0,0,0,0.12)'          : 'rgba(255,255,255,0.09)',
    cardText:    isLight ? '#0f172a'                   : '#e2e8f0',
    statBg:      isLight ? 'rgba(0,0,0,0.1)'           : 'rgba(255,255,255,0.12)',
    statBorder:  isLight ? 'rgba(0,0,0,0.2)'           : 'rgba(255,255,255,0.22)',
    statText:    isLight ? '#0f172a'                   : '#ffffff',
    statMuted:   isLight ? 'rgba(0,0,0,0.5)'           : 'rgba(255,255,255,0.6)',
    gridHeading: isLight ? '#0f172a'                   : '#f1f5f9',
    gridMuted:   '#64748b',
  }
}
