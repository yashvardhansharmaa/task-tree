// ApiProvider.jsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../ApiClient';
import PropTypes from 'prop-types';

const ApiContext = createContext();

export function ApiProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(!!apiClient.token);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Listen for authentication changes
        const unsubscribe = apiClient.addListener((event) => {
            if (event.type === 'token') {
                setIsAuthenticated(!!event.token);
                if (!event.token) {
                    // Clear local storage on logout
                    localStorage.removeItem('token');
                    localStorage.removeItem('username');
                    localStorage.removeItem('isLoggedIn');
                }
            }
        });

        return unsubscribe;
    }, []);

    const value = {
        api: apiClient,
        isAuthenticated,
        isLoading,
        setIsLoading
    };

    return (
        <ApiContext.Provider value={value}>
            {children}
        </ApiContext.Provider>
    );
}

ApiProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export function useApi() {
    const context = useContext(ApiContext);
    if (!context) {
        throw new Error('useApi must be used within an ApiProvider');
    }
    return context.api;
}

export function useAuth() {
    const context = useContext(ApiContext);
    if (!context) {
        throw new Error('useAuth must be used within an ApiProvider');
    }
    return {
        isAuthenticated: context.isAuthenticated,
        isLoading: context.isLoading,
    };
}

export function useLoading() {
    const context = useContext(ApiContext);
    if (!context) {
        throw new Error('useLoading must be used within an ApiProvider');
    }
    return [context.isLoading, context.setIsLoading];
}

export default ApiProvider;