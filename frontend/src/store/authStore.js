import { create } from 'zustand'
import { auth as authApi } from '../services/api'

const useAuthStore = create((set, get) => ({
    user: null,
    isLoading: true,
    isAuthenticated: false,

    // Initialize auth state synchronously from localStorage
    initialize: () => {
        const accessToken = localStorage.getItem('accessToken')
        const cachedUser = localStorage.getItem('user')

        if (accessToken) {
            // Optimistically set authenticated if we have a token
            set({
                isAuthenticated: true,
                isLoading: false,
                user: cachedUser ? JSON.parse(cachedUser) : null
            })

            // Verify in background
            get().verifyAuth()
        } else {
            set({ isLoading: false, isAuthenticated: false, user: null })
        }
    },

    // Background verification
    verifyAuth: async () => {
        try {
            const response = await authApi.me()
            localStorage.setItem('user', JSON.stringify(response.data))
            set({
                user: response.data,
                isAuthenticated: true,
                isLoading: false,
            })
        } catch (error) {
            if (error.response?.status === 401) {
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                localStorage.removeItem('user')
                set({ user: null, isAuthenticated: false, isLoading: false })
            }
        }
    },

    // Login
    login: async (email, password) => {
        const response = await authApi.login(email, password)
        const { access_token, refresh_token, user } = response.data

        localStorage.setItem('accessToken', access_token)
        localStorage.setItem('refreshToken', refresh_token)
        localStorage.setItem('user', JSON.stringify(user))

        set({ user, isAuthenticated: true })
        return user
    },

    // Register
    register: async (email, password, name, role) => {
        const response = await authApi.register(email, password, name, role)
        const { access_token, refresh_token, user } = response.data

        localStorage.setItem('accessToken', access_token)
        localStorage.setItem('refreshToken', refresh_token)
        localStorage.setItem('user', JSON.stringify(user))

        set({ user, isAuthenticated: true })
        return user
    },

    // Logout
    logout: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        set({ user: null, isAuthenticated: false })
        window.location.href = '/auth'
    },

    // Google Login
    loginWithGoogle: async (accessToken) => {
        const response = await authApi.loginWithGoogle(accessToken)
        const { access_token, refresh_token, user } = response.data

        localStorage.setItem('accessToken', access_token)
        localStorage.setItem('refreshToken', refresh_token)
        localStorage.setItem('user', JSON.stringify(user))

        set({ user, isAuthenticated: true })
        return user
    },
}))

export default useAuthStore
