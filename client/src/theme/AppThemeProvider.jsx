import { useMemo } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { createAppTheme } from './createAppTheme'

/** Provides the single light theme to the tree. */
export function AppThemeProvider({ children }) {
  const theme = useMemo(() => createAppTheme(), [])
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
