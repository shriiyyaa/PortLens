import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import useAuthStore from '../store/authStore'
import './Auth.css'

function Auth() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { login, register, isAuthenticated } = useAuthStore()

    const [mode, setMode] = useState(searchParams.get('mode') || 'login')
    const [role, setRole] = useState(searchParams.get('role') || 'designer')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    })

    useEffect(() => {
        if (isAuthenticated) {
            // Redirect based on role
            const user = useAuthStore.getState().user
            if (user?.role === 'recruiter') {
                navigate('/recruiter-dashboard')
            } else {
                navigate('/dashboard')
            }
        }
    }, [isAuthenticated, navigate])

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true)
            setError('')

            // Perceived Speed optimization: 
            // We have the Google token, so we are 99% sure user is in.
            // We keep the loading state but we can show a specific "Identity Verified" message.

            try {
                const { loginWithGoogle } = useAuthStore.getState()
                await loginWithGoogle(tokenResponse.access_token)

                const user = useAuthStore.getState().user
                if (user?.role === 'recruiter') {
                    navigate('/recruiter-dashboard')
                } else {
                    navigate('/dashboard')
                }
            } catch (err) {
                console.error("Google Auth Error:", err)
                setError('Google Sign-In failed. Please try again.')
                setIsLoading(false)
            }
        },
        onError: () => {
            setError('Google Sign-In failed')
        },
    })

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            if (mode === 'register') {
                if (formData.password !== formData.confirmPassword) {
                    throw new Error('Passwords do not match')
                }
                await register(formData.email, formData.password, formData.name, role)
            } else {
                await login(formData.email, formData.password)
            }

            const user = useAuthStore.getState().user
            if (user?.role === 'recruiter') {
                navigate('/recruiter-dashboard')
            } else {
                navigate('/dashboard')
            }
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* Left Panel - Branding */}
                <div className="auth-branding">
                    <Link to="/" className="logo">
                        <span className="logo-icon">◇</span>
                        <span className="logo-text">PortLens</span>
                    </Link>
                    <div className="branding-content">
                        <h1>Design Intelligence at Scale</h1>
                        <p>
                            Join thousands of designers and recruiters using AI to evaluate
                            creative portfolios.
                        </p>
                        <div className="branding-features">
                            <div className="branding-feature">
                                <span className="feature-check">✓</span>
                                <span>Instant portfolio analysis</span>
                            </div>
                            <div className="branding-feature">
                                <span className="feature-check">✓</span>
                                <span>Evidence-based feedback</span>
                            </div>
                            <div className="branding-feature">
                                <span className="feature-check">✓</span>
                                <span>Hiring recommendations</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="auth-form-panel">
                    <div className="auth-form-container">
                        <div className="auth-header">
                            <h2>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
                            <p>
                                {mode === 'login'
                                    ? 'Enter your credentials to access your account'
                                    : 'Start evaluating portfolios in minutes'}
                            </p>
                        </div>

                        {mode === 'register' && (
                            <div className="role-selector">
                                <button
                                    type="button"
                                    className={`role-btn ${role === 'designer' ? 'active' : ''}`}
                                    onClick={() => setRole('designer')}
                                >
                                    <span className="role-icon">🎨</span>
                                    <span className="role-label">Designer</span>
                                    <span className="role-desc">Get feedback on your work</span>
                                </button>
                                <button
                                    type="button"
                                    className={`role-btn ${role === 'recruiter' ? 'active' : ''}`}
                                    onClick={() => setRole('recruiter')}
                                >
                                    <span className="role-icon">👔</span>
                                    <span className="role-label">Recruiter</span>
                                    <span className="role-desc">Evaluate candidates</span>
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className="auth-error">
                                <span>⚠️</span>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            {mode === 'register' && (
                                <div className="form-group">
                                    <label className="label" htmlFor="name">Full Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        className="input"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label className="label" htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="input"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="label" htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    className="input"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={8}
                                />
                            </div>

                            {mode === 'register' && (
                                <div className="form-group">
                                    <label className="label" htmlFor="confirmPassword">Confirm Password</label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        className="input"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        minLength={8}
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg auth-submit"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span className="spinner"></span>
                                        <span>Securely Entering...</span>
                                    </div>
                                ) : mode === 'login' ? (
                                    'Sign In'
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </form>

                        <div className="auth-divider">
                            <span>or continue with</span>
                        </div>

                        <div className="google-auth-container">
                            <button
                                type="button"
                                className="btn-google"
                                onClick={() => googleLogin()}
                                disabled={isLoading}
                            >
                                <svg className="google-icon" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                <span>Google</span>
                            </button>
                        </div>

                        <div className="auth-switch">
                            {mode === 'login' ? (
                                <p>
                                    Don't have an account?{' '}
                                    <button
                                        type="button"
                                        className="link-btn"
                                        onClick={() => setMode('register')}
                                    >
                                        Sign up
                                    </button>
                                </p>
                            ) : (
                                <p>
                                    Already have an account?{' '}
                                    <button
                                        type="button"
                                        className="link-btn"
                                        onClick={() => setMode('login')}
                                    >
                                        Sign in
                                    </button>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Auth
