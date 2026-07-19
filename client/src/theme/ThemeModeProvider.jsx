import { useMemo } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { createSnagTheme } from './createSnagTheme'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { ThemeModeContext } from './themeModeContext'

/**
 * Owns the light/dark mode, persists the choice, and provides the built
 * MUI theme to the tree. Defaults to dark.
 */
export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useLocalStorage('snag:theme', 'dark')

  const value = useMemo(
    () => ({
      mode,
      toggleMode: () => setMode((m) => (m === 'dark' ? 'light' : 'dark')),
      setMode,
    }),
    [mode, setMode],
  )

  const theme = useMemo(() => createSnagTheme(mode), [mode])

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  )
}
