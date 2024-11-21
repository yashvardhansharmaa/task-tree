// src/contexts/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';

const ThemeContext = createContext(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const theme = useMemo(() => createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#4CAF50', // Light green
        light: '#81C784',
        dark: '#388E3C',
      },
      secondary: {
        main: '#66BB6A',
        light: '#98EE99',
        dark: '#338A3E',
      },
      background: {
        default: isDarkMode ? '#1C2121' : '#F5F8F5',
        paper: isDarkMode ? '#262C26' : '#FFFFFF',
      },
      text: {
        primary: isDarkMode ? '#FFFFFF' : '#2E412F',
        secondary: isDarkMode ? '#A5D6A7' : '#4CAF50',
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode ? '#2E412F' : '#4CAF50',
            boxShadow: 'none',
            borderBottom: '1px solid',
            borderColor: isDarkMode ? '#3E513F' : '#66BB6A',
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: 'background-color 0.3s, color 0.3s',
            backgroundColor: isDarkMode ? '#1C2121' : '#F5F8F5',
          },
        },
      },
    },
  }), [isDarkMode]);

  const value = useMemo(() => ({
    isDarkMode,
    toggleTheme
  }), [isDarkMode]);

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};