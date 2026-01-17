import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import usePortfolioStore from '../store/portfolioStore'
import './RecruiterDashboard.css'

function RecruiterDashboard() {
    const navigate = useNavigate()
    const { user, isAuthenticated, isLoading: authLoading, logout } = useAuthStore()
    const { portfolios, isLoading, fetchPortfolios, submitUrl, startAnalysis, previewUrl, savePreview } = usePortfolioStore()

    const [showBatchModal, setShowBatchModal] = useState(false)
    const [batchUrls, setBatchUrls] = useState('')
    const [batchName, setBatchName] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [sortBy, setSortBy] = useState('score')
    const [sortOrder, setSortOrder] = useState('desc')

    // Single URL Preview state
    const [singleUrlInput, setSingleUrlInput] = useState('')
    const [showPreviewModal, setShowPreviewModal] = useState(false)
    const [previewResult, setPreviewResult] = useState(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/auth')
        }
    }, [authLoading, isAuthenticated, navigate])

    useEffect(() => {
        if (isAuthenticated) {
            fetchPortfolios('recruiter')  // Only fetch recruiter context portfolios
        }
    }, [isAuthenticated, fetchPortfolios])

    // Auto-show batch modal for new recruiters with no portfolios
    useEffect(() => {
        if (isAuthenticated && !isLoading && portfolios.length === 0) {
            setShowBatchModal(true)
        }
    }, [isAuthenticated, isLoading, portfolios.length])

    // Parse CSV file
    const handleCsvUpload = (e) => {
        const file = e.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            const text = event.target.result
            // Extract URLs from CSV (assumes URLs are in first column)
            const lines = text.split('\n')
            const urls = lines
                .map(line => line.split(',')[0].trim())
                .filter(url => url.startsWith('http'))
            setBatchUrls(urls.join('\n'))
        }
        reader.readAsText(file)
    }

    // Submit batch URLs
    const handleBatchSubmit = async () => {
        const urls = batchUrls
            .split('\n')
            .map(url => url.trim())
            .filter(url => url.startsWith('http'))

        if (urls.length === 0) return

        setIsSubmitting(true)
        try {
            // Submit each URL with 'recruiter' context
            for (const url of urls) {
                const portfolio = await submitUrl(url, batchName || 'Candidate Portfolio', 'recruiter', null)
                await startAnalysis(portfolio.id)
            }
            setShowBatchModal(false)
            setBatchUrls('')
            setBatchName('')
            fetchPortfolios('recruiter') // Refresh list with recruiter context
        } catch (err) {
            console.error('Batch submit failed:', err)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Single URL preview (analyze before saving)
    const handleSingleUrlPreview = async () => {
        if (!singleUrlInput.trim()) return

        try {
            setIsAnalyzing(true)
            setShowBatchModal(false)
            setShowPreviewModal(true)

            const preview = await previewUrl(singleUrlInput, 'recruiter')
            setPreviewResult({ ...preview, batchName: batchName || 'Candidate Portfolio' })
            setIsAnalyzing(false)
        } catch (err) {
            console.error('Preview failed:', err)
            setIsAnalyzing(false)
            setShowPreviewModal(false)
            setShowBatchModal(true)
        }
    }

    const handleSavePreview = async () => {
        if (!previewResult) return

        try {
            await savePreview({
                url: previewResult.url,
                title: previewResult.batchName || previewResult.title,
                source_type: previewResult.source_type,
                submission_context: 'recruiter',
                candidate_name: null,
                analysis: previewResult.analysis
            })
            setShowPreviewModal(false)
            setPreviewResult(null)
            setSingleUrlInput('')
            setBatchName('')
            fetchPortfolios('recruiter')
        } catch (err) {
            console.error('Save failed:', err)
        }
    }

    const handleDiscardPreview = () => {
        setShowPreviewModal(false)
        setPreviewResult(null)
        setSingleUrlInput('')
    }

    // Sort candidates
    const sortedPortfolios = [...portfolios]
        .filter(p => p.status === 'completed' && p.analysis)
        .sort((a, b) => {
            let aVal = a.analysis?.overall_score || 0
            let bVal = b.analysis?.overall_score || 0
            return sortOrder === 'desc' ? bVal - aVal : aVal - bVal
        })

    const getVerdictBadge = (score) => {
        if (score >= 85) return { label: 'Strong Hire', class: 'rec-strong' }
        if (score >= 70) return { label: 'Hire', class: 'rec-hire' }
        if (score >= 50) return { label: 'Maybe', class: 'rec-maybe' }
        return { label: 'Pass', class: 'rec-pass' }
    }

    const getRankStyle = (rank) => {
        if (rank === 1) return { background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#000' }
        if (rank === 2) return { background: 'linear-gradient(135deg, #C0C0C0, #A0A0A0)', color: '#000' }
        if (rank === 3) return { background: 'linear-gradient(135deg, #CD7F32, #8B4513)', color: '#fff' }
        return { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }
    }

    if (authLoading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <div className="recruiter-dashboard">
            <header className="recruiter-header">
                <div className="container">
                    <div className="header-content">
                        <Link to="/" className="recruiter-logo">
                            <span className="recruiter-logo-icon">❖</span>
                            <span className="recruiter-logo-text">PortLens</span>
                            <span className="recruiter-logo-badge">RECRUITER</span>
                        </Link>
                        <div className="header-actions">
                            <span className="user-badge">Recruiter</span>
                            <span className="user-name">{user?.name}</span>
                            <button onClick={logout} className="btn btn-ghost">Logout</button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="recruiter-main">
                <div className="container">
                    {/* Page Header */}
                    <div className="page-header">
                        <div>
                            <h1>Candidate Rankings</h1>
                            <p>AI-powered analysis of {portfolios.length} candidate portfolios</p>
                        </div>
                        <div className="header-buttons">
                            <button className="btn btn-secondary" onClick={() => setShowBatchModal(true)}>
                                📥 Batch Import
                            </button>
                            <button className="btn btn-primary">
                                📊 Export CSV
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="stats-row">
                        <div className="stat-card">
                            <span className="stat-value">{portfolios.length}</span>
                            <span className="stat-label">Total Candidates</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value">{sortedPortfolios.filter(p => p.analysis?.overall_score >= 85).length}</span>
                            <span className="stat-label">Strong Hires</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value">{portfolios.filter(p => p.status === 'processing').length}</span>
                            <span className="stat-label">Analyzing</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value">{sortedPortfolios[0]?.analysis?.overall_score || '-'}</span>
                            <span className="stat-label">Top Score</span>
                        </div>
                    </div>

                    {/* Candidates Table */}
                    <div className="candidates-table-wrapper">
                        <table className="candidates-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Candidate</th>
                                    <th>Verdict</th>
                                    <th onClick={() => { setSortBy('score'); setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc') }} style={{ cursor: 'pointer' }}>
                                        Score {sortBy === 'score' && (sortOrder === 'desc' ? '↓' : '↑')}
                                    </th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedPortfolios.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="empty-row">
                                            No analyzed portfolios yet. Import candidates to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    sortedPortfolios.map((portfolio, index) => {
                                        const verdict = getVerdictBadge(portfolio.analysis.overall_score)
                                        const rankStyle = getRankStyle(index + 1)
                                        return (
                                            <tr key={portfolio.id}>
                                                <td>
                                                    <span className="rank-badge" style={rankStyle}>
                                                        {index + 1}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="candidate-info">
                                                        <strong>{portfolio.title || 'Untitled'}</strong>
                                                        <span>{portfolio.source_type}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`verdict-badge ${verdict.class}`}>
                                                        {verdict.label}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="score-display">
                                                        {portfolio.analysis.overall_score}
                                                    </span>
                                                </td>
                                                <td>
                                                    <Link to={`/portfolio/${portfolio.id}`} className="btn btn-ghost btn-sm">
                                                        View Details
                                                    </Link>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Batch Import Modal */}
            {showBatchModal && (
                <div className="modal-overlay" onClick={() => setShowBatchModal(false)}>
                    <div className="batch-modal" onClick={e => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setShowBatchModal(false)}>✕</button>

                        <h2>Batch Import Candidates</h2>
                        <p className="modal-subtitle">Paste portfolio URLs or upload a CSV file</p>

                        <div className="batch-input-group">
                            <label>Batch Name (optional)</label>
                            <input
                                type="text"
                                className="batch-name-input"
                                placeholder="e.g., Senior Designer Candidates"
                                value={batchName}
                                onChange={e => setBatchName(e.target.value)}
                            />
                        </div>

                        {/* Single URL with Preview */}
                        <div className="batch-input-group single-url-preview">
                            <label>Single Candidate (Preview First)</label>
                            <div className="single-url-row">
                                <input
                                    type="url"
                                    className="single-url-input"
                                    placeholder="https://behance.net/candidate"
                                    value={singleUrlInput}
                                    onChange={e => setSingleUrlInput(e.target.value)}
                                />
                                <button
                                    className="btn btn-secondary"
                                    onClick={handleSingleUrlPreview}
                                    disabled={!singleUrlInput.trim()}
                                >
                                    🔍 Preview
                                </button>
                            </div>
                        </div>

                        <div className="batch-divider">
                            <span>or batch import</span>
                        </div>

                        <div className="batch-input-group">
                            <label>Portfolio URLs (one per line)</label>
                            <textarea
                                className="batch-urls-textarea"
                                placeholder="https://behance.net/candidate1
https://dribbble.com/candidate2
https://portfolio.com/candidate3"
                                value={batchUrls}
                                onChange={e => setBatchUrls(e.target.value)}
                                rows={6}
                            />
                        </div>

                        <div className="csv-upload-section">
                            <input
                                type="file"
                                id="csv-upload"
                                accept=".csv,.xlsx,.xls"
                                onChange={handleCsvUpload}
                                hidden
                            />
                            <label htmlFor="csv-upload" className="csv-upload-btn">
                                📄 Upload CSV/Excel
                            </label>
                            <span className="csv-hint">URLs in first column</span>
                        </div>

                        <div className="batch-actions">
                            <button className="btn btn-secondary" onClick={() => setShowBatchModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleBatchSubmit}
                                disabled={!batchUrls.trim() || isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner spinner-sm"></span>
                                        Importing...
                                    </>
                                ) : (
                                    `Import ${batchUrls.split('\n').filter(u => u.trim().startsWith('http')).length} Candidates`
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {showPreviewModal && (
                <div className="modal-overlay" onClick={handleDiscardPreview}>
                    <div className="preview-modal recruiter-preview" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={handleDiscardPreview}
                            className="modal-close-btn"
                        >
                            ✕
                        </button>

                        {isAnalyzing ? (
                            <div className="preview-loading">
                                <div className="spinner"></div>
                                <h2>Analyzing Candidate...</h2>
                                <p>AI is evaluating this portfolio. This may take a few seconds.</p>
                            </div>
                        ) : previewResult ? (
                            <div className="preview-content">
                                <h2>📊 Candidate Analysis Preview</h2>
                                <p className="preview-url">{previewResult.url}</p>

                                <div className="preview-scores">
                                    <div className="preview-score-item">
                                        <span className="score-label">Visual</span>
                                        <span className="score-value">{Math.round(previewResult.analysis.visual_score || 0)}</span>
                                    </div>
                                    <div className="preview-score-item">
                                        <span className="score-label">UX</span>
                                        <span className="score-value">{Math.round(previewResult.analysis.ux_score || 0)}</span>
                                    </div>
                                    <div className="preview-score-item overall">
                                        <span className="score-label">Overall</span>
                                        <span className="score-value">{Math.round(previewResult.analysis.overall_score || 0)}</span>
                                    </div>
                                </div>

                                {previewResult.analysis.seniority_assessment && (
                                    <div className="preview-seniority">
                                        <strong>Seniority:</strong> {previewResult.analysis.seniority_assessment}
                                    </div>
                                )}

                                {previewResult.analysis.recruiter_verdict && (
                                    <div className="preview-verdict">
                                        <strong>Verdict:</strong> {previewResult.analysis.recruiter_verdict}
                                    </div>
                                )}

                                <div className="preview-question">
                                    <p>Add this candidate to your rankings?</p>
                                </div>

                                <div className="preview-actions">
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleSavePreview}
                                    >
                                        ✓ Add to Rankings
                                    </button>
                                    <button
                                        className="btn btn-ghost"
                                        onClick={handleDiscardPreview}
                                    >
                                        ✗ Discard
                                    </button>
                                </div>

                                {previewResult.ai_generated && (
                                    <p className="preview-model-badge">
                                        Powered by {previewResult.model_used || 'AI'}
                                    </p>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    )
}

export default RecruiterDashboard
