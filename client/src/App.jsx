import { useState } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { ScrapePage } from './pages/ScrapePage'
import { resolveLink } from './utils/api'

export default function App() {
  const [state, setState] = useState({ status: 'idle' })

  const handleFetch = async (url) => {
    setState({ status: 'loading' })
    try {
      const data = await resolveLink(url)
      setState({ status: 'done', data })
    } catch (err) {
      setState({ status: 'error', error: err.message })
    }
  }

  return (
    <AppLayout onGoHome={() => setState({ status: 'idle' })}>
      <ScrapePage state={state} onFetch={handleFetch} />
    </AppLayout>
  )
}
