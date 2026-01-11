import { Link } from 'react-router-dom'

function RecruiterDashboard() {
    return (
        <div className="recruiter-dashboard">
            <header className="detail-header">
                <div className="container">
                    <div className="header-content">
                        <Link to="/dashboard" className="back-link">
                            ← Back to Dashboard
                        </Link>
                        <Link to="/" className="logo">
                            <span className="logo-icon">◇</span>
                            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700 }}>PortLens</span>
                        </Link>
                    </div>
                </div>
            </header>

            <main style={{ padding: '3rem 0', minHeight: '80vh' }}>
                <div className="container">
                    <div className="section-header-row" style={{ marginBottom: '1.5rem' }}>
                        <div>
                            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', fontWeight: 700 }}>Candidate Rankings</h1>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                                Artificial Intelligence analysis of 12 candidate portfolios for "Senior Product Designer" role.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'stretch' }}>
                            <button className="btn btn-secondary btn-sm">Export CSV</button>
                            <button className="btn btn-primary btn-sm">Analyze Batch</button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                        <th style={{ padding: '1rem 1.5rem', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Rank</th>
                                        <th style={{ padding: '1rem 1.5rem', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Candidate</th>
                                        <th style={{ padding: '1rem 1.5rem', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Hireability Verdict</th>
                                        <th style={{ padding: '1rem 1.5rem', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Strong Points</th>
                                        <th style={{ padding: '1rem 1.5rem', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Score</th>
                                        <th style={{ padding: '1rem 1.5rem', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(255,255,255,0.01)' }}>
                                        <td style={{ padding: '1.25rem 1.5rem' }}><span className="rec-number" style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}>1</span></td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <strong style={{ fontSize: '0.9rem' }}>Sarah Chen</strong><br />
                                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Behance Portfolio</span>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <span className="recommendation rec-strong" style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>Strong Hire</span>
                                            <p style={{ fontSize: '0.8rem', marginTop: '0.4rem', fontStyle: 'italic', opacity: 0.7 }}>"World-class visual polish and rigorous UX methodology."</p>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <ul style={{ fontSize: '0.75rem', padding: '0', listStyle: 'none', color: 'rgba(255,255,255,0.6)' }}>
                                                <li>• Advanced Typography</li>
                                                <li>• Commercial Impact Data</li>
                                            </ul>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}><span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-neon)' }}>94</span></td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <Link to="/dashboard" className="btn btn-ghost btn-sm">Details</Link>
                                        </td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                        <td style={{ padding: '1.25rem 1.5rem' }}><span className="rec-number" style={{ width: '28px', height: '28px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', color: '#fff' }}>2</span></td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <strong style={{ fontSize: '0.9rem' }}>Marcus Thorne</strong><br />
                                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Dribbble Showreel</span>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <span className="recommendation rec-hire" style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>Hire</span>
                                            <p style={{ fontSize: '0.8rem', marginTop: '0.4rem', fontStyle: 'italic', opacity: 0.7 }}>"Exceptional visual design with solid problem-solving skills."</p>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <ul style={{ fontSize: '0.75rem', padding: '0', listStyle: 'none', color: 'rgba(255,255,255,0.6)' }}>
                                                <li>• Layout & Grid Mastery</li>
                                                <li>• User-Centric Flow</li>
                                            </ul>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}><span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#00BFFF' }}>88</span></td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}><Link to="/dashboard" className="btn btn-ghost btn-sm">Details</Link></td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                        <td style={{ padding: '1.25rem 1.5rem' }}><span className="rec-number" style={{ width: '28px', height: '28px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}>3</span></td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <strong style={{ fontSize: '0.9rem' }}>Elena Rodriguez</strong><br />
                                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Personal Website</span>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <span className="recommendation rec-maybe" style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>Maybe</span>
                                            <p style={{ fontSize: '0.8rem', marginTop: '0.4rem', fontStyle: 'italic', opacity: 0.7 }}>"Strong visuals but lacks depth in UX process documentation."</p>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <ul style={{ fontSize: '0.75rem', padding: '0', listStyle: 'none', color: 'rgba(255,255,255,0.6)' }}>
                                                <li>• Creative UI Elements</li>
                                                <li>• Dynamic Interactions</li>
                                            </ul>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}><span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFB800' }}>69</span></td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}><Link to="/dashboard" className="btn btn-ghost btn-sm">Details</Link></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default RecruiterDashboard
