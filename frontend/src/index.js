import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { ApiProvider } from "./contexts/ApiProvider";
import { AuthProvider } from "./contexts/AuthContext";
import App from "./App";

const theme = createTheme({
  typography: {
    fontFamily: "Inter, sans-serif",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "@global": {
          html: {
            height: "100%",
          },
          body: {
            height: "100%",
            margin: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
          "#root": {
            height: "100%",
            width: "100%", // Add this to ensure full width
          },
        },
      },
    },
    // Add some basic improvements to Material-UI components
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Prevents all-caps button text
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 2,
      },
    },
  },
  // Add a custom palette if needed
  palette: {
    primary: {
      main: '#4CAF50', // Your green color
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ApiProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ApiProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

// Enable hot reloading in development
if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept();
}