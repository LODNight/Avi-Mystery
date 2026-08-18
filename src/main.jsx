import React from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './app/providers/AuthProvider.jsx';
import { ThemeProvider } from './app/providers/ThemeProvider.jsx';
import { AppRouter } from './app/router/index.jsx';
import './styles/index.css';

const root = document.getElementById('root');
createRoot(root).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
