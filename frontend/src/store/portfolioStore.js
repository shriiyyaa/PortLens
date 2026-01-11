import { create } from 'zustand'
import { portfolios as portfolioApi, analysis as analysisApi } from '../services/api'

const usePortfolioStore = create((set, get) => ({
    portfolios: [],
    currentPortfolio: null,
    currentAnalysis: null,
    isLoading: false,
    error: null,

    // Fetch all portfolios
    fetchPortfolios: async () => {
        set({ isLoading: true, error: null })
        try {
            const response = await portfolioApi.list()
            set({ portfolios: response.data, isLoading: false })
        } catch (error) {
            set({ error: error.message, isLoading: false })
        }
    },

    // Fetch single portfolio with analysis
    fetchPortfolio: async (id) => {
        set({ isLoading: true, error: null })
        try {
            const [portfolioRes, analysisRes] = await Promise.all([
                portfolioApi.get(id),
                analysisApi.results(id).catch(() => null),
            ])

            set({
                currentPortfolio: portfolioRes.data,
                currentAnalysis: analysisRes?.data || null,
                isLoading: false,
            })
        } catch (error) {
            set({ error: error.message, isLoading: false })
        }
    },

    // Upload files
    uploadFiles: async (files, onProgress) => {
        set({ isLoading: true, error: null })
        try {
            const response = await portfolioApi.uploadFiles(files, onProgress)
            const newPortfolio = response.data

            set((state) => ({
                portfolios: [newPortfolio, ...state.portfolios],
                isLoading: false,
            }))

            return newPortfolio
        } catch (error) {
            set({ error: error.message, isLoading: false })
            throw error
        }
    },

    // Submit URL
    submitUrl: async (url, title) => {
        set({ isLoading: true, error: null })
        try {
            const response = await portfolioApi.submitUrl(url, title)
            const newPortfolio = response.data

            set((state) => ({
                portfolios: [newPortfolio, ...state.portfolios],
                isLoading: false,
            }))

            return newPortfolio
        } catch (error) {
            set({ error: error.message, isLoading: false })
            throw error
        }
    },

    // Start analysis
    startAnalysis: async (portfolioId) => {
        try {
            await analysisApi.start(portfolioId)

            // Update portfolio status
            set((state) => ({
                portfolios: state.portfolios.map((p) =>
                    p.id === portfolioId ? { ...p, status: 'processing' } : p
                ),
            }))
        } catch (error) {
            set({ error: error.message })
            throw error
        }
    },

    // Poll analysis status
    pollAnalysisStatus: async (portfolioId) => {
        const response = await analysisApi.status(portfolioId)
        return response.data
    },

    // Delete portfolio
    deletePortfolio: async (id) => {
        try {
            await portfolioApi.delete(id)
            set((state) => ({
                portfolios: state.portfolios.filter((p) => p.id !== id),
            }))
        } catch (error) {
            set({ error: error.message })
            throw error
        }
    },

    // Clear current
    clearCurrent: () => {
        set({ currentPortfolio: null, currentAnalysis: null })
    },
}))

export default usePortfolioStore
