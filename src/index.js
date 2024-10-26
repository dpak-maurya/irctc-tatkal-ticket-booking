import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import { AppProvider } from './contexts/AppContext';
import { ModalProvider } from './contexts/ModalContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ModalProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </ModalProvider>
    ,
  </React.StrictMode>
);
