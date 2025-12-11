// Importación de Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { TelegramAlertProvider } from './context/TelegramAlertContext.jsx'

import './styles/index.css'
import { router } from './router.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <TelegramAlertProvider>
        <RouterProvider router={router} />
      </TelegramAlertProvider>
    </AuthProvider>
  </StrictMode >,
)
