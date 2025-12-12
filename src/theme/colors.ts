/**
 * Theme colors based on HTML prototypes
 */

export const colors = {
  primary: '#137fec',
  background: {
    light: '#f6f7f8',
    dark: '#101922',
  },
  card: {
    light: '#ffffff',
    dark: '#1a2634',
  },
  surface: {
    light: '#ffffff',
    dark: '#1c252e',
  },
  text: {
    primary: {
      light: '#0f172a', // slate-900
      dark: '#ffffff',
    },
    secondary: {
      light: '#64748b', // slate-500
      dark: '#92adc9',
    },
    tertiary: {
      light: '#94a3b8', // slate-400
      dark: '#64748b',
    },
  },
  border: {
    light: '#e2e8f0', // slate-200
    dark: '#324d67',
  },
  status: {
    success: '#22c55e', // green-500
    warning: '#f59e0b', // amber-500
    error: '#ef4444', // red-500
    info: '#3b82f6', // blue-500
  },
  badge: {
    yellow: {
      bg: 'rgba(234, 179, 8, 0.2)', // yellow-500/20
      text: '#ca8a04', // yellow-700
      dark: {
        bg: 'rgba(234, 179, 8, 0.1)',
        text: '#fbbf24', // yellow-400
      },
    },
    green: {
      bg: 'rgba(34, 197, 94, 0.2)', // green-500/20
      text: '#16a34a', // green-700
      dark: {
        bg: 'rgba(34, 197, 94, 0.2)',
        text: '#4ade80', // green-400
      },
    },
    red: {
      bg: 'rgba(239, 68, 68, 0.2)', // red-500/20
      text: '#dc2626', // red-700
      dark: {
        bg: 'rgba(239, 68, 68, 0.2)',
        text: '#f87171', // red-400
      },
    },
    blue: {
      bg: 'rgba(19, 127, 236, 0.1)', // primary/10
      text: '#137fec',
      dark: {
        bg: 'rgba(59, 130, 246, 0.3)',
        text: '#60a5fa', // blue-400
      },
    },
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

