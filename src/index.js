import React from 'react';
import { createRoot } from 'react-dom/client'; // Modifié
import App from './App';
import { AuthContextProvider } from './context/AuthContext';

const container = document.getElementById('root');
const root = createRoot(container); // Crée un root

root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <App />
    </AuthContextProvider>
  </React.StrictMode>
);