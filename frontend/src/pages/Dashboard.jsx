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
                            <span className="logo-icon">◇</span>
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
                                        {getStatusBadge(portfolio.status)}
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

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Upload Portfolio</h2>
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="modal-close"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="upload-tabs">
                            <button
                                className={`tab ${uploadType === 'file' ? 'active' : ''}`}
                                onClick={() => setUploadType('file')}
                            >
                                Upload Files
                            </button>
                            <button
                                className={`tab ${uploadType === 'url' ? 'active' : ''}`}
                                onClick={() => setUploadType('url')}
                            >
                                Submit URL
                            </button>
                        </div>

                        {uploadType === 'file' ? (
                            <div
                                className={`drop-zone ${dragActive ? 'active' : ''}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <input
                                    type="file"
                                    id="file-input"
                                    multiple
                                    accept="image/*,.pdf"
                                    onChange={handleFileSelect}
                                    hidden
                                />
                                <label htmlFor="file-input" className="drop-zone-content">
                                    <div className="drop-icon">📤</div>
                                    <p>Drag & drop files here, or click to browse</p>
                                    <span className="drop-hint">PNG, JPG, PDF up to 50MB</span>
                                </label>
                                {uploadProgress > 0 && (
                                    <div className="upload-progress">
                                        <div
                                            className="progress-bar"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <form onSubmit={handleUrlSubmit} className="url-form">
                                <div className="form-group">
                                    <label className="label">Portfolio URL</label>
                                    <input
                                        type="url"
                                        className="input"
                                        placeholder="https://behance.net/yourprofile"
                                        value={urlInput}
                                        onChange={(e) => setUrlInput(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label">Title (optional)</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="My Portfolio"
                                        value={titleInput}
                                        onChange={(e) => setTitleInput(e.target.value)}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary btn-lg">
                                    Submit for Analysis
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Dashboard
