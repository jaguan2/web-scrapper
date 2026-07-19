import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Poppins — the portfolio's typeface. Load the weights the theme uses.
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/500.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'
import './index.css'
import App from './App.jsx'
import { AppThemeProvider } from './theme/AppThemeProvider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppThemeProvider>
      <App />
    </AppThemeProvider>
  </StrictMode>,
)
