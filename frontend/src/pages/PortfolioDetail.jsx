import { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts'
import useAuthStore from '../store/authStore'
import usePortfolioStore from '../store/portfolioStore'
import './PortfolioDetail.css'

function PortfolioDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { isAuthenticated, isLoading: authLoading, initialize } = useAuthStore()
    const { currentPortfolio, currentAnalysis, isLoading, fetchPortfolio, clearCurrent } = usePortfolioStore()


    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/auth')
        }
    }, [authLoading, isAuthenticated, navigate])

    useEffect(() => {
        if (isAuthenticated && id) {
            fetchPortfolio(id)
        }
        return () => clearCurrent()
    }, [isAuthenticated, id, fetchPortfolio, clearCurrent])

    const getScoreClass = (score) => {
        if (score >= 80) return 'score-excellent'
        if (score >= 60) return 'score-good'
        if (score >= 40) return 'score-average'
        return 'score-poor'
    }

    const getRecommendation = (score) => {
        if (score >= 85) return { text: 'Strong Hire', class: 'rec-strong' }
        if (score >= 70) return { text: 'Hire', class: 'rec-hire' }
        if (score >= 50) return { text: 'Maybe', class: 'rec-maybe' }
        return { text: 'Pass', class: 'rec-pass' }
    }

    if ((authLoading && !isAuthenticated) || (isLoading && !currentPortfolio)) {
        return (
            <div className="detail-loading">
                <div className="spinner"></div>
                <p>Retrieving elite insights...</p>
            </div>
        )
    }

    if (!currentPortfolio) {
        return (
            <div className="detail-loading">
                <p>Portfolio not found</p>
                <Link to="/dashboard" className="btn btn-primary">
                    Back to Dashboard
                </Link>
            </div>
        )
    }

    const analysis = currentAnalysis || {}
    const recommendation = getRecommendation(analysis.overall_score || 0)

    const radarData = [
        { metric: 'Visual Design', value: analysis.visual_score || 0 },
        { metric: 'UX Process', value: analysis.ux_score || 0 },
        { metric: 'Communication', value: analysis.communication_score || 0 },
        { metric: 'Hireability', value: analysis.hireability_score || 0 },
        { metric: 'Overall', value: analysis.overall_score || 0 },
    ]

    return (
        <div className="portfolio-detail">
            {/* Header */}
            <header className="detail-header">
                <div className="container">
                    <div className="header-content">
                        <Link to="/dashboard" className="back-link">
                            ← Back to Dashboard
                        </Link>
                        <Link to="/" className="logo">
                            <span className="logo-icon">◇</span>
                            <span className="logo-text">PortLens</span>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="detail-main">
                <div className="container">
                    {/* Portfolio Title */}
                    <div className="detail-title">
                        <h1>{currentPortfolio.title || 'Untitled Portfolio'}</h1>
                        <p>Analyzed on {new Date(analysis.completed_at || Date.now()).toLocaleDateString()}</p>
                    </div>

                    {/* Summary Section */}
                    <div className="detail-grid">
                        {/* Overall Score Card */}
                        <div className="score-card card">
                            <h2>Overall Score</h2>
                            <div className={`big-score ${getScoreClass(analysis.overall_score || 0)}`}>
                                {analysis.overall_score || '--'}
                            </div>
                            <div className={`recommendation ${recommendation.class}`}>
                                {recommendation.text}
                            </div>
                            {analysis.recruiter_verdict && (
                                <div className="verdict-banner">
                                    <span className="verdict-label">Recruiter Verdict:</span>
                                    <p className="verdict-text">"{analysis.recruiter_verdict}"</p>
                                </div>
                            )}
                        </div>

                        {/* Radar Chart */}
                        <div className="chart-card card">
                            <h2>Skill Breakdown</h2>
                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height={300}>
                                    <RadarChart data={radarData}>
                                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                        <PolarAngleAxis
                                            dataKey="metric"
                                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        />
                                        <PolarRadiusAxis
                                            angle={90}
                                            domain={[0, 100]}
                                            tick={{ fill: '#64748b', fontSize: 10 }}
                                        />
                                        <Radar
                                            name="Score"
                                            dataKey="value"
                                            stroke="#6366f1"
                                            fill="#6366f1"
                                            fillOpacity={0.3}
                                            strokeWidth={2}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Scores */}
                    <div className="scores-section">
                        <h2>Detailed Analysis</h2>
                        <div className="scores-grid">
                            <div className="score-block card">
                                <div className="score-header">
                                    <span className="score-icon">👁️</span>
                                    <h3>Visual Design</h3>
                                </div>
                                <div className={`score-value ${getScoreClass(analysis.visual_score || 0)}`}>
                                    {analysis.visual_score || '--'}
                                </div>
                                <p>
                                    Layout, typography, color usage, spacing, and visual hierarchy
                                </p>
                            </div>

                            <div className="score-block card">
                                <div className="score-header">
                                    <span className="score-icon">🧠</span>
                                    <h3>UX Process</h3>
                                </div>
                                <div className={`score-value ${getScoreClass(analysis.ux_score || 0)}`}>
                                    {analysis.ux_score || '--'}
                                </div>
                                <p>
                                    Research depth, problem solving, iteration process, user focus
                                </p>
                            </div>

                            <div className="score-block card">
                                <div className="score-header">
                                    <span className="score-icon">📝</span>
                                    <h3>Communication</h3>
                                </div>
                                <div className={`score-value ${getScoreClass(analysis.communication_score || 0)}`}>
                                    {analysis.communication_score || '--'}
                                </div>
                                <p>
                                    Clarity of writing, storytelling, case study structure
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="feedback-section">
                        <div className="feedback-grid">
                            <div className="feedback-card card strengths">
                                <h2>✓ Strengths</h2>
                                <ul>
                                    {(analysis.strengths || []).length > 0 ? (
                                        analysis.strengths.map((s, i) => <li key={i}>{s}</li>)
                                    ) : (
                                        <li className="placeholder">Analysis pending...</li>
                                    )}
                                </ul>
                            </div>

                            <div className="feedback-card card weaknesses">
                                <h2>✗ Areas to Improve</h2>
                                <ul>
                                    {(analysis.weaknesses || []).length > 0 ? (
                                        analysis.weaknesses.map((w, i) => <li key={i}>{w}</li>)
                                    ) : (
                                        <li className="placeholder">Analysis pending...</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Recommendations / Growth Roadmap */}
                    {(analysis.recommendations || []).length > 0 && (
                        <div className="recommendations-section card">
                            <div className="section-header-row">
                                <h2>💡 Growth Roadmap</h2>
                                <span className="section-badge">Personalized for you</span>
                            </div>
                            <div className="recommendations-list">
                                {analysis.recommendations.map((rec, i) => (
                                    <div key={i} className="recommendation-item">
                                        <div className="rec-number">{i + 1}</div>
                                        <div className="rec-content">
                                            <p>{rec}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default PortfolioDetail
