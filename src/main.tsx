import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import { AuthProvider } from './hooks/useAuth'
import { SiteDataProvider } from './hooks/useSiteData'
import { ToastProvider } from './components/ui'
import './index.css'

const root = document.getElementById('root')
if (!root) throw new Error('Root element #root was not found in index.html')

createRoot(root).render(
  <StrictMode>
    {/* basename keeps routing correct when served from a GitHub Pages subpath */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <HelmetProvider>
        <AuthProvider>
          <SiteDataProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </SiteDataProvider>
        </AuthProvider>
      </HelmetProvider>
    </BrowserRouter>
  </StrictMode>,
)
