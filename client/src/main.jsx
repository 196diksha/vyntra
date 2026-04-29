import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { GoogleOAuthProvider } from '@react-oauth/google'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import App from './App'
import axios from 'axios'

axios.defaults.baseURL = import.meta.env.VITE_API_BASE || ''

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <App />
        <ToastContainer position="bottom-right" />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
