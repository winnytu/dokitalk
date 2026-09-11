import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { unlockAudioOnFirstGesture } from './lib/audio'
import { unlockBgmAudioOnFirstGesture } from './lib/bgm'

unlockAudioOnFirstGesture()
unlockBgmAudioOnFirstGesture()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
