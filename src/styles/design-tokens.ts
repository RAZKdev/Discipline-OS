/**
 * Discipline-OS Design Tokens
 * Source of truth: DESIGN.md
 * Aligned with Figma Variables & Dev Mode
 *
 * Theme: Calm, encouraging, practical, high-contrast, accessible.
 */

export const designTokens = {
  colors: {
    // Semantic foundations
    background: {
      light: '#f8faf9',      // Calm stone-tinted white
      dark: '#0f1715',       // Deep muted slate-forest
    },
    surface: {
      light: '#ffffff',
      dark: '#16221f',
    },
    surfaceSubtle: {
      light: '#f0f4f2',
      dark: '#1e2d29',
    },
    border: {
      light: '#e2e8e5',
      dark: '#2a3b36',
    },
    text: {
      primary: {
        light: '#13221e',
        dark: '#ecf3f0',
      },
      secondary: {
        light: '#4d625b',
        dark: '#9bb2ab',
      },
      muted: {
        light: '#6f857e',
        dark: '#768e87',
      },
    },
    // Category accents
    category: {
      foundation: '#107e59',  // Deep sage green
      workout: '#1e75bb',     // Active sky/ocean blue
      discipline: '#d97706',  // Warm focus amber
      rewards: '#7c3aed',     // Calm violet
      rest: '#0d9488',        // Restful teal
    },
    // Functional states
    status: {
      success: '#15803d',
      warning: '#b45309',
      info: '#0369a1',
      neutral: '#64748b',
    },
    focusRing: '#107e59',
  },
  typography: {
    fontSans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontMono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  touchTarget: {
    minHeight: '48px',
    minWidth: '48px',
  },
  radii: {
    sm: '6px',
    md: '10px',
    lg: '16px',
    full: '9999px',
  },
} as const;
