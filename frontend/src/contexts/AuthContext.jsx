import React, { createContext, useState, useEffect, useContext } from "react";
import { useApi } from "./ApiProvider";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Authentication context provider component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Provider component
 */
export const AuthProvider = ({ children }) => {
    const [username, setUsername] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const api = useApi();
    const navigate = useNavigate();

    useEffect(() => {
        // Check for existing auth state on mount
        const token = localStorage.getItem('token');
        const savedUsername = localStorage.getItem('username');
        if (token && savedUsername) {
            setUsername(savedUsername);
            setIsLoggedIn(true);
            api.setToken(token);
        }
    }, [api]);

    const login = async (credentials) => {
        try {
            console.log('Login attempt with:', credentials);
            
            const response = await api.post("/auth/login", credentials);
            console.log('Login response:', response);

            if (response.ok && response.body.ok) {
                api.setToken(response.body.token);
                setUsername(response.body.user.username);
                setIsLoggedIn(true);
                
                localStorage.setItem('token', response.body.token);
                localStorage.setItem('username', response.body.user.username);
                localStorage.setItem('isLoggedIn', 'true');
                
                return {
                    success: true,
                    user: response.body.user
                };
            }
            
            return {
                success: false,
                error: response.body.message || 'Login failed'
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: 'Network error occurred'
            };
        }
    };

    const logout = async () => {
        try {
            const response = await api.post("/auth/logout");
            if (response.ok) {
                console.log("Logged out successfully");
            }
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            // Clear state regardless of logout request success
            setUsername(null);
            setIsLoggedIn(false);
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('isLoggedIn');
            api.setToken(null);
            navigate("/login");
        }
    };

    return (
        <AuthContext.Provider value={{
            username,
            isLoggedIn,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;