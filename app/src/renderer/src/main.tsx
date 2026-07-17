import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { mockApi } from './lib/mockApi'

if (!window.api) {
  // Plain-browser preview (no Electron preload) — use in-memory mock so the UI is inspectable.
  window.api = mockApi
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
