import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { VisualizationProvider } from './context/VisualizationContext.jsx'
import { BeginnerProvider } from './context/BeginnerContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <BeginnerProvider>
          <VisualizationProvider>
            <App />
          </VisualizationProvider>
        </BeginnerProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
