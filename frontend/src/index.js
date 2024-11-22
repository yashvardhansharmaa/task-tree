// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications'; // Changed from NotificationsProvider
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css'; // Add this line
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MantineProvider>
      <Notifications position="top-right" /> {/* Changed this line */}
      <App />
    </MantineProvider>
  </React.StrictMode>
);