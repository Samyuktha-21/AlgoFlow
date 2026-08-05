import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeProvider.jsx'
import { VisualizationProvider } from './context/VisualizationProvider.jsx'
import { BeginnerProvider } from './context/BeginnerProvider.jsx'
import { AuthProvider } from './context/AuthProvider.jsx'
import { ProgressProvider } from './context/ProgressProvider.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <ProgressProvider>
          <BeginnerProvider>
            <VisualizationProvider>
              <App />
            </VisualizationProvider>
          </BeginnerProvider>
        </ProgressProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>,
)
