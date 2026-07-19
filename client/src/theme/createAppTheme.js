import { createTheme, alpha } from '@mui/material/styles'
import { colors } from './palette'

// Small, editorial rounding — the portfolio uses 0.5rem.
const RADIUS = 8

/**
 * The single (light) MUI theme for Media Scraper, built from the portfolio's
 * design language: Poppins, a monochrome ink-on-cream palette with one hot-pink
 * accent, hairline borders, and flat dark buttons that invert on hover. Custom
 * tokens the palette doesn't cover live under `theme.app`.
 */
export function createAppTheme() {
  return createTheme({
    palette: {
      mode: 'light',
      primary: { main: colors.ink, contrastText: colors.background },
      secondary: { main: colors.accent },
      error: { main: colors.accent },
      background: { default: colors.background, paper: colors.surface },
      text: { primary: colors.ink, secondary: colors.inkMuted },
      divider: colors.border,
    },

    app: {
      ...colors,
      radius: RADIUS,
    },

    shape: { borderRadius: RADIUS },

    typography: {
      fontFamily: '"Poppins", system-ui, -apple-system, sans-serif',
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 600,
      h1: { fontWeight: 600, letterSpacing: '-1px', lineHeight: 1.1 },
      h2: { fontWeight: 600, letterSpacing: '-0.5px' },
      h3: { fontWeight: 600 },
      button: { fontWeight: 500, textTransform: 'none' },
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: colors.background, color: colors.ink },
          '::selection': { background: alpha(colors.accent, 0.18) },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: colors.surface,
            borderRadius: RADIUS,
            border: `1px solid ${colors.border}`,
          },
        },
      },
      MuiButtonBase: { defaultProps: { disableRipple: true } },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: RADIUS,
            textTransform: 'none',
            fontWeight: 500,
            transition: 'all 0.35s ease',
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            height: 6,
            borderRadius: 999,
            backgroundColor: colors.surfaceMuted,
          },
          bar: { borderRadius: 999, backgroundColor: colors.accent },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: colors.ink,
            color: colors.background,
            fontWeight: 500,
            borderRadius: 6,
            fontSize: 12,
          },
        },
      },
      MuiModal: { defaultProps: { disableScrollLock: true } },
      MuiPopover: { defaultProps: { disableScrollLock: true } },
    },
  })
}
