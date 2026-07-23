import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { VisualizationProvider } from './context/VisualizationContext.jsx'
import { BeginnerProvider } from './context/BeginnerContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ProgressProvider } from './context/ProgressContext.jsx'

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
