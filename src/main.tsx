// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles/index.css'
import App from './App'
import "react-phone-input-2/lib/style.css";
import { AuthProvider } from './context/AuthContext'   // <-- add

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>                                     
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
