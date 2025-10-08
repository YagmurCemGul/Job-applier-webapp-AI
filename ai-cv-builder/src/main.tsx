import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './config/i18n' // Import i18n configuration
import './index.css'
import App from './App.tsx'
import { useAuthStore } from '@/stores/auth.store'
import { useTemplateStore } from '@/stores/template.store'

// Initialize auth on app start
useAuthStore.getState().initializeAuth()

// Initialize templates on app start
useTemplateStore.getState().initializeTemplates()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
