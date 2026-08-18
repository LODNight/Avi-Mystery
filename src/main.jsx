import React from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './app/providers/AuthProvider.jsx';
import { AppRouter } from './app/router/index.jsx';
import './styles/index.css';

const root = document.getElementById('root');
createRoot(root).render(
  <React.StrictMode>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </React.StrictMode>
);
