import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
    baseURL: `${API_URL}/api/v1`,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const refreshToken = localStorage.getItem('refreshToken')
                if (refreshToken) {
                    const response = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
                        refresh_token: refreshToken,
                    })

                    const { access_token } = response.data
                    localStorage.setItem('accessToken', access_token)

                    originalRequest.headers.Authorization = `Bearer ${access_token}`
                    return api(originalRequest)
                }
            } catch (refreshError) {
                // Refresh failed, logout user
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                window.location.href = '/auth'
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

// Auth endpoints
export const auth = {
    login: (email, password) =>
        api.post('/auth/login', { email, password }),

    register: (email, password, name, role = 'designer') =>
        api.post('/auth/register', { email, password, name, role }),

    refresh: (refreshToken) =>
        api.post('/auth/refresh', { refresh_token: refreshToken }),

    me: () => api.get('/auth/me'),

    loginWithGoogle: (accessToken) =>
        api.post('/auth/google', { access_token: accessToken }),
}

// Portfolio endpoints
export const portfolios = {
    list: () => api.get('/portfolios'),

    get: (id) => api.get(`/portfolios/${id}`),

    uploadFiles: (files, onProgress) => {
        const formData = new FormData()
        files.forEach((file) => formData.append('files', file))

        return api.post('/portfolios/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
                if (onProgress) {
                    const percent = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    )
                    onProgress(percent)
                }
            },
        })
    },

    submitUrl: (url, title) =>
        api.post('/portfolios/url', { url, title }),

    delete: (id) => api.delete(`/portfolios/${id}`),
}

// Analysis endpoints
export const analysis = {
    start: (portfolioId) =>
        api.post(`/analysis/${portfolioId}/start`),

    status: (portfolioId) =>
        api.get(`/analysis/${portfolioId}/status`),

    results: (portfolioId) =>
        api.get(`/analysis/${portfolioId}/results`),
}

// Recruiter endpoints
export const recruiter = {
    createBatch: (urls, name) =>
        api.post('/recruiter/batch', { urls, name }),

    getBatch: (batchId) =>
        api.get(`/recruiter/batch/${batchId}`),

    getRankings: (batchId) =>
        api.get(`/recruiter/rankings/${batchId}`),

    exportBatch: (batchId, format = 'csv') =>
        api.get(`/recruiter/export/${batchId}`, {
            params: { format },
            responseType: 'blob',
        }),
}

export default api
