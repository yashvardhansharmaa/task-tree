import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import ApiProvider from "./contexts/ApiProvider";
import { ThemeProvider } from "./contexts/ThemeContext";
import AuthProvider from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import DraggableBoard from "./components/DraggableBoard";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ForgotPassword from "./components/auth/ForgotPassword";
import NotFound from "./components/NotFoundPage";
import { useAuth } from "./contexts/AuthContext"; // Make sure you have this hook

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Create a default theme
const defaultTheme = createTheme();

const App = () => {
  return (
    <MuiThemeProvider theme={defaultTheme}>
      <ApiProvider>
        <ThemeProvider>
          <AuthProvider>
            <CssBaseline />
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <main style={{ flex: 1 }}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route 
                    path="/" 
                    element={
                      <ProtectedRoute>
                        <DraggableBoard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <DraggableBoard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </ApiProvider>
    </MuiThemeProvider>
  );
};

export default App;