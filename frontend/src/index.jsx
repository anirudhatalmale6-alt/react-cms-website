import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CookieProvider } from './context/CookieContext';
import './styles/variables.css';
import './styles/global.css';
import './styles/admin.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <CookieProvider>
              <App />
              <ToastContainer position="bottom-right" autoClose={4000} />
            </CookieProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
