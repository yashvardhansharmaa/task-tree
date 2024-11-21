// ApiClient.js
export class TodoApiClient {
    constructor() {
        this.base_url = process.env.REACT_APP_BACKEND_API_URL || "http://localhost:3001";
        this.token = localStorage.getItem('token');
        this.listeners = new Set();
        
        // Bind methods
        this.request = this.request.bind(this);
        this.setToken = this.setToken.bind(this);
    }

    // Token Management
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
        this.notifyListeners({ type: 'token', token });
    }

    // Request Interceptor
    createHeaders() {
        const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        };

        if (this.token) {
            headers["Authorization"] = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Response Handler
    async handleResponse(response) {
        const contentType = response.headers.get("content-type");
        let data;
        
        try {
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                data = await response.text();
            }
        } catch (error) {
            data = null;
        }

        if (!response.ok) {
            const error = new Error(data?.message || `HTTP error! status: ${response.status}`);
            error.status = response.status;
            error.response = data;
            throw error;
        }

        return data;
    }

    // Main request method
    async request(options) {
        let fullUrl = `${this.base_url}/api${options.url}`;
        
        // Add query parameters if present
        if (options.query) {
            const params = new URLSearchParams(options.query);
            fullUrl += `?${params.toString()}`;
        }

        try {
            // Use existing createHeaders method for consistency
            const headers = this.createHeaders();

            const requestOptions = {
                method: options.method,
                headers,
                credentials: 'include',
                mode: 'cors',
                body: options.body ? JSON.stringify(options.body) : null,
            };

            // Add logging for debugging
            console.log('Making request:', {
                url: fullUrl,
                method: options.method,
                headers: {...headers, Authorization: headers.Authorization ? '[HIDDEN]' : undefined}
            });

            const response = await fetch(fullUrl, requestOptions);
            
            // Handle redirects (new feature)
            if (response.status === 308) {
                const newUrl = response.headers.get('Location');
                if (newUrl) {
                    return this.request({
                        ...options,
                        url: newUrl
                    });
                }
            }

            const data = await this.handleResponse(response);

            return {
                ok: true,
                status: response.status,
                body: data
            };
        } catch (error) {
            console.error('Request error:', error);
            
            // Keep the 401 unauthorized handling
            if (error.status === 401) {
                this.setToken(null);
                this.notifyListeners({ type: 'unauthorized' });
            }

            return {
                ok: false,
                status: error.status || 500,
                body: { 
                    message: error.message || 'Network error occurred',
                    details: error.response // Keep the error details
                }
            };
        }
    }

    // HTTP method wrappers
    async get(url, query = null) {
        return this.request({ method: 'GET', url, query });
    }

    async post(url, body = null) {
        return this.request({ method: 'POST', url, body });
    }

    async put(url, body = null) {
        return this.request({ method: 'PUT', url, body });
    }

    async patch(url, body = null) {
        return this.request({ method: 'PATCH', url, body });
    }

    async delete(url) {
        return this.request({ method: 'DELETE', url });
    }

    // Event handling
    addListener(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notifyListeners(event) {
        this.listeners.forEach(listener => listener(event));
    }
}

export const apiClient = new TodoApiClient();
export default TodoApiClient;