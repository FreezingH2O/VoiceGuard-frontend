import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Latin trio (English mode) — design.md §2
import '@fontsource/space-grotesk/400.css'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/600.css'
import '@fontsource/space-grotesk/700.css'
import '@fontsource/space-mono/400.css'
import '@fontsource/space-mono/700.css'
import '@fontsource/fraunces/400.css'
import '@fontsource/fraunces/500.css'
import '@fontsource/fraunces/600.css'
import '@fontsource/fraunces/600-italic.css'
// Thai pairing (Thai mode) — design.md §2
import '@fontsource/prompt/400.css'
import '@fontsource/prompt/500.css'
import '@fontsource/prompt/600.css'
import '@fontsource/kanit/500.css'
import '@fontsource/kanit/600.css'
import '@fontsource/kanit/700.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
