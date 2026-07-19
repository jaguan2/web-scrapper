import { Box } from '@mui/material'
import { Header } from './Header'
import { Footer } from './Footer'

/** App frame: minimal header, centered content column, minimal footer. */
export function AppLayout({ onGoHome, children }) {
  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        color: 'text.primary',
        overflowX: 'clip',
      }}
    >
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'absolute',
          left: 12,
          top: -60,
          zIndex: 10,
          px: 2,
          py: 1,
          borderRadius: 1,
          bgcolor: 'primary.main',
          color: 'background.default',
          fontWeight: 500,
          textDecoration: 'none',
          transition: 'top 160ms ease',
          '&:focus-visible': { top: 12 },
        }}
      >
        Skip to main content
      </Box>

      <Header onGoHome={onGoHome} />
      <Box
        component="main"
        id="main-content"
        sx={{
          flex: 1,
          width: '100%',
          maxWidth: 1080,
          mx: 'auto',
          px: { xs: 3, md: 4 },
        }}
      >
        {children}
      </Box>
      <Footer />
    </Box>
  )
}
