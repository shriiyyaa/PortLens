import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import usePortfolioStore from '../store/portfolioStore'
import './Dashboard.css'

function Dashboard() {
    const navigate = useNavigate()
    const { user, isAuthenticated, isLoading: authLoading, logout, initialize } = useAuthStore()
    const { portfolios, isLoading, fetchPortfolios, uploadFiles, submitUrl, startAnalysis, deletePortfolio } = usePortfolioStore()

    const [showUploadModal, setShowUploadModal] = useState(false)
    const [uploadType, setUploadType] = useState('file')
    const [urlInput, setUrlInput] = useState('')
    const [titleInput, setTitleInput] = useState('')
    const [dragActive, setDragActive] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)


    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/auth')
        }
    }, [authLoading, isAuthenticated, navigate])

    useEffect(() => {
        if (isAuthenticated) {
            fetchPortfolios()
        }
    }, [isAuthenticated, fetchPortfolios])

    // Auto-show upload modal for new users with no portfolios
    useEffect(() => {
        if (isAuthenticated && !isLoading && portfolios.length === 0) {
            setShowUploadModal(true)
        }
    }, [isAuthenticated, isLoading, portfolios.length])

    const handleDrag = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }, [])

    const handleDrop = useCallback(async (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        const files = Array.from(e.dataTransfer.files)
        if (files.length > 0) {
            try {
                const portfolio = await uploadFiles(files, setUploadProgress)
                await startAnalysis(portfolio.id)
                setShowUploadModal(false)
                setUploadProgress(0)
            } catch (err) {
                console.error('Upload failed:', err)
            }
        }
    }, [uploadFiles, startAnalysis])

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files)
        if (files.length > 0) {
            try {
                const portfolio = await uploadFiles(files, setUploadProgress)
                await startAnalysis(portfolio.id)
                setShowUploadModal(false)
                setUploadProgress(0)
            } catch (err) {
                console.error('Upload failed:', err)
            }
        }
    }

    const handleUrlSubmit = async (e) => {
        e.preventDefault()
        if (!urlInput.trim()) return

        try {
            const portfolio = await submitUrl(urlInput, titleInput || 'Portfolio')
            await startAnalysis(portfolio.id)
            setShowUploadModal(false)
            setUrlInput('')
            setTitleInput('')
        } catch (err) {
            console.error('Submit failed:', err)
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this portfolio?')) {
            await deletePortfolio(id)
        }
    }

    const handleRetry = async (id) => {
        try {
            await startAnalysis(id)
        } catch (err) {
            console.error('Retry failed:', err)
        }
    }

    const getStatusBadge = (status) => {
        const statusMap = {
            pending: { label: 'Pending', class: 'status-pending' },
            processing: { label: 'Analyzing...', class: 'status-processing' },
            completed: { label: 'Complete', class: 'status-complete' },
            failed: { label: 'Failed', class: 'status-failed' },
        }
        const s = statusMap[status] || statusMap.pending
        return <span className={`status-badge ${s.class}`}>{s.label}</span>
    }

    if (authLoading && !isAuthenticated) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Establishing secure connection...</p>
            </div>
        )
    }

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="dashboard-header">
                <div className="container">
                    <div className="header-content">
                        <Link to="/" className="logo">
                            <img src="/vite.svg" alt="Logo" className="logo-icon-img" />
                            <span className="logo-text">PortLens</span>
                        </Link>
                        <div className="header-actions">
                            <span className="user-name">{user?.name}</span>
                            <button onClick={logout} className="btn btn-ghost">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="dashboard-main">
                <div className="container">
                    <div className="dashboard-title">
                        <div>
                            <h1>Your Portfolios</h1>
                            <p>Upload and analyze your design work</p>
                        </div>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="btn btn-primary"
                        >
                            <span>+</span>
                            Upload Portfolio
                        </button>
                    </div>

                    {/* Portfolio Grid */}
                    {isLoading ? (
                        <div className="dashboard-loading">
                            <div className="spinner"></div>
                        </div>
                    ) : portfolios.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📁</div>
                            <h3>No portfolios yet</h3>
                            <p>Upload your first portfolio to get AI-powered feedback</p>
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="btn btn-primary"
                            >
                                Upload Portfolio
                            </button>
                        </div>
                    ) : (
                        <div className="portfolio-grid">
                            {portfolios.map((portfolio) => (
                                <div key={portfolio.id} className="portfolio-card card">
                                    <div className="portfolio-header">
                                        <div className="portfolio-info">
                                            <h3>{portfolio.title || 'Untitled Portfolio'}</h3>
                                            <p className="portfolio-source">{portfolio.source_type}</p>
                                        </div>
                                        <div className="portfolio-status-actions">
                                            {getStatusBadge(portfolio.status)}
                                            {portfolio.status === 'failed' && (
                                                <button
                                                    onClick={() => handleRetry(portfolio.id)}
                                                    className="btn btn-xs btn-outline"
                                                    title="Retry Analysis"
                                                >
                                                    Retry
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {portfolio.status === 'completed' && portfolio.analysis && (
                                        <div className="portfolio-scores">
                                            <div className="score-item">
                                                <span className="score-label">Visual</span>
                                                <span className="score-value">{portfolio.analysis.visual_score}</span>
                                            </div>
                                            <div className="score-item">
                                                <span className="score-label">UX</span>
                                                <span className="score-value">{portfolio.analysis.ux_score}</span>
                                            </div>
                                            <div className="score-item">
                                                <span className="score-label">Overall</span>
                                                <span className="score-value score-overall">{portfolio.analysis.overall_score}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="portfolio-actions">
                                        {portfolio.status === 'completed' ? (
                                            <Link to={`/portfolio/${portfolio.id}`} className="btn btn-secondary">
                                                View Analysis
                                            </Link>
                                        ) : portfolio.status === 'processing' ? (
                                            <button className="btn btn-secondary" disabled>
                                                <span className="spinner spinner-sm"></span>
                                                Analyzing...
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => startAnalysis(portfolio.id)}
                                                className="btn btn-primary"
                                            >
                                                Start Analysis
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(portfolio.id)}
                                            className="btn btn-ghost btn-danger"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Upload Modal - Unified Input */}
            {showUploadModal && (
                <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
                    <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setShowUploadModal(false)}
                            className="modal-close-btn"
                        >
                            ✕
                        </button>

                        <h2 className="upload-title">Add Portfolio</h2>
                        <p className="upload-subtitle">Paste a URL or upload files for AI analysis</p>

                        {/* Unified Input Bar */}
                        <form onSubmit={handleUrlSubmit} className="unified-input-form">
                            <div className="unified-input-bar">
                                <div className="input-icon">🔗</div>
                                <input
                                    type="url"
                                    className="unified-url-input"
                                    placeholder="Paste portfolio URL (Behance, Dribbble, etc.)"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                />

                                {/* File Attachment Button */}
                                <label htmlFor="file-input-unified" className="file-attach-btn" title="Upload files">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                                    </svg>
                                </label>
                                <input
                                    type="file"
                                    id="file-input-unified"
                                    multiple
                                    accept="*/*"
                                    onChange={handleFileSelect}
                                    hidden
                                />

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="unified-submit-btn"
                                    disabled={!urlInput.trim()}
                                    title="Submit for analysis"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            {/* Optional Title */}
                            <input
                                type="text"
                                className="title-input"
                                placeholder="Title (optional)"
                                value={titleInput}
                                onChange={(e) => setTitleInput(e.target.value)}
                            />
                        </form>

                        {/* Drop Zone for Files */}
                        <div
                            className={`mini-drop-zone ${dragActive ? 'active' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <span className="drop-icon">📁</span>
                            <span>or drag & drop files here</span>
                            {uploadProgress > 0 && (
                                <div className="upload-progress">
                                    <div
                                        className="progress-bar"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            )}
                        </div>

                        <p className="upload-hint">
                            Supports: Behance, Dribbble, personal sites, PDF, PNG, JPG, and more
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Dashboard
