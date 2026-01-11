import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Landing.css'

function Landing() {
    const [portfolioUrl, setPortfolioUrl] = useState('')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const navigate = useNavigate()

    const handleAnalyze = (e) => {
        e.preventDefault()
        if (portfolioUrl.trim()) {
            navigate(`/auth?mode=register&url=${encodeURIComponent(portfolioUrl)}`)
        }
    }

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen)
    }

    const closeMobileMenu = () => {
        setMobileMenuOpen(false)
    }

    return (
        <div className="landing">
            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="mobile-overlay"
                    onClick={closeMobileMenu}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 999,
                    }}
                />
            )}

            {/* Navigation */}
            <nav className="nav">
                <div className="container">
                    <div className="nav-content">
                        <Link to="/" className="logo">
                            <span className="logo-icon">◇</span>
                            <span className="logo-text">PortLens</span>
                        </Link>

                        <div className="nav-pill">
                            <a href="#home" className="nav-link active">Home</a>
                            <a href="#about" className="nav-link">About Us</a>
                            <a href="#services" className="nav-link">Services</a>
                            <a href="#testimonials" className="nav-link">Testimonials</a>
                            <a href="#contact" className="nav-link">Contact Us</a>
                        </div>

                        <div className={`nav-actions ${mobileMenuOpen ? 'open' : ''}`}>
                            <Link to="/auth" className="btn btn-ghost" onClick={closeMobileMenu}>Sign In</Link>
                            <Link to="/auth?mode=register" className="btn btn-primary" onClick={closeMobileMenu}>Get Started</Link>
                        </div>

                        <button
                            className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
                            onClick={toggleMobileMenu}
                            aria-label="Toggle menu"
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero" id="home">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-badge animate-slide-down">
                            <span className="badge-dot"></span>
                            AI-Powered Portfolio Intelligence
                        </div>

                        <h1 className="hero-title animate-slide-up">
                            Crafted to <span className="text-neon">Showcase.</span>
                            <br />
                            Built to <span className="text-neon">Discover.</span>
                        </h1>

                        <p className="hero-subtitle animate-slide-up stagger-1">
                            PortLens evaluates creative portfolios like a senior design lead.
                            Get instant, brutally honest feedback powered by AI.
                        </p>

                        <div className="hero-buttons animate-slide-up stagger-2">
                            <Link to="/auth?mode=register&role=designer" className="btn btn-primary btn-xl">
                                I'm a Designer
                            </Link>
                            <Link to="/auth?mode=register&role=recruiter" className="btn btn-secondary btn-xl">
                                I'm a Recruiter
                            </Link>
                        </div>
                    </div>

                    {/* Portfolio Input Section */}
                    <div className="portfolio-input-section animate-slide-up stagger-3">
                        <div className="input-card glass">
                            <h3>Analyze Your Portfolio Now</h3>
                            <p>Paste your portfolio link and discover what AI sees</p>

                            <form onSubmit={handleAnalyze} className="input-form">
                                <input
                                    type="url"
                                    className="input input-lg"
                                    placeholder="Paste your Behance, Dribbble, or portfolio URL..."
                                    value={portfolioUrl}
                                    onChange={(e) => setPortfolioUrl(e.target.value)}
                                />
                                <button type="submit" className="btn btn-filled btn-lg">
                                    Analyze Portfolio
                                    <span className="btn-arrow">→</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="hero-glow"></div>
            </section>

            {/* Features Section - Three Brains */}
            <section className="features section" id="services">
                <div className="container">
                    <div className="section-header">
                        <h2>Three Brains. <span className="text-neon">One Verdict.</span></h2>
                        <p>PortLens combines vision AI and language AI to evaluate portfolios like a human design lead.</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card card card-accent animate-slide-up stagger-1">
                            <div className="feature-icon icon-neon">👁️</div>
                            <h3>Vision Brain</h3>
                            <p>
                                Analyzes layout, typography, color usage, spacing, and visual hierarchy
                                using DINOv2 and CLIP embeddings. It sees design patterns, not just pixels.
                            </p>
                            <div className="feature-tag">Visual Design Score</div>
                        </div>

                        <div className="feature-card card card-accent animate-slide-up stagger-2">
                            <div className="feature-icon icon-neon">📖</div>
                            <h3>Language Brain</h3>
                            <p>
                                Reads case studies to understand problem-solving, research depth,
                                iteration process, and UX reasoning. It knows if you're faking it.
                            </p>
                            <div className="feature-tag">UX Process Score</div>
                        </div>

                        <div className="feature-card card card-accent animate-slide-up stagger-3">
                            <div className="feature-icon icon-neon">🧠</div>
                            <h3>Fusion Brain</h3>
                            <p>
                                Combines visual and text signals to predict hireability.
                                Strong visuals + weak UX = risky hire. We catch that.
                            </p>
                            <div className="feature-tag">Hireability Score</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="about section" id="about">
                <div className="container">
                    <div className="about-grid">
                        <div className="about-content">
                            <div className="section-label">The Problem</div>
                            <h2>Recruiters are <span className="text-neon">drowning.</span></h2>
                            <p className="about-text">
                                When a designer applies for a job, recruiters receive 50, 100, sometimes
                                1000 portfolios. Each one is different format, structure, quality.
                            </p>
                            <p className="about-text">
                                They can't analyze every case study. So they do something unfair —
                                they give take-home assignments. This wastes everyone's time.
                            </p>
                        </div>

                        <div className="about-content">
                            <div className="section-label">The Solution</div>
                            <h2>PortLens does the <span className="text-neon">heavy lifting.</span></h2>
                            <p className="about-text">
                                PortLens acts like a senior design lead who can look at UI screenshots,
                                read case studies, understand UX decisions, and judge visual design.
                            </p>
                            <p className="about-text">
                                It predicts if the candidate is hireable — instantly, for thousands
                                of portfolios. No more assignments. No more ghosting.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* For Designers Section */}
            <section className="audience section">
                <div className="container">
                    <div className="audience-card glass animate-slide-up">
                        <div className="audience-content">
                            <div className="audience-label">For Designers</div>
                            <h2>Stop guessing. <span className="text-neon">Start improving.</span></h2>
                            <p>
                                Upload your Behance, portfolio site, or case study PDF.
                                Get brutally honest feedback in minutes, not weeks.
                            </p>

                            <ul className="audience-features">
                                <li>
                                    <span className="check-icon">✓</span>
                                    Visual design score with specifics
                                </li>
                                <li>
                                    <span className="check-icon">✓</span>
                                    UX process evaluation
                                </li>
                                <li>
                                    <span className="check-icon">✓</span>
                                    Communication clarity rating
                                </li>
                                <li>
                                    <span className="check-icon">✓</span>
                                    Actionable improvement tips
                                </li>
                            </ul>

                            <Link to="/auth?mode=register&role=designer" className="btn btn-primary btn-lg">
                                Analyze My Portfolio
                                <span className="btn-arrow">→</span>
                            </Link>
                        </div>

                        <div className="audience-visual">
                            <div className="score-preview card">
                                <div className="preview-header">
                                    <div className="preview-avatar"></div>
                                    <div className="preview-info">
                                        <span className="preview-name">Your Portfolio</span>
                                        <span className="preview-type">Analysis Complete</span>
                                    </div>
                                    <span className="score-badge score-excellent">92</span>
                                </div>
                                <div className="preview-scores">
                                    <div className="preview-score-item">
                                        <span>Visual Design</span>
                                        <div className="score-bar"><div className="score-fill" style={{ width: '95%' }}></div></div>
                                        <span>95</span>
                                    </div>
                                    <div className="preview-score-item">
                                        <span>UX Process</span>
                                        <div className="score-bar"><div className="score-fill" style={{ width: '88%' }}></div></div>
                                        <span>88</span>
                                    </div>
                                    <div className="preview-score-item">
                                        <span>Communication</span>
                                        <div className="score-bar"><div className="score-fill" style={{ width: '91%' }}></div></div>
                                        <span>91</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* For Recruiters Section */}
            <section className="audience section recruiters">
                <div className="container">
                    <div className="audience-card glass animate-slide-up reverse">
                        <div className="audience-visual">
                            <div className="rankings-preview card">
                                <h4>Candidate Rankings</h4>
                                <div className="ranking-list">
                                    <div className="ranking-item">
                                        <span className="rank">#1</span>
                                        <div className="ranking-info">
                                            <span className="ranking-name">Sarah Chen</span>
                                            <span className="ranking-rec">Strong Hire</span>
                                        </div>
                                        <span className="ranking-score">92</span>
                                    </div>
                                    <div className="ranking-item">
                                        <span className="rank">#2</span>
                                        <div className="ranking-info">
                                            <span className="ranking-name">Mike Johnson</span>
                                            <span className="ranking-rec">Hire</span>
                                        </div>
                                        <span className="ranking-score">87</span>
                                    </div>
                                    <div className="ranking-item">
                                        <span className="rank">#3</span>
                                        <div className="ranking-info">
                                            <span className="ranking-name">Emma Davis</span>
                                            <span className="ranking-rec">Maybe</span>
                                        </div>
                                        <span className="ranking-score">71</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="audience-content">
                            <div className="audience-label">For Recruiters</div>
                            <h2>Stop giving <span className="text-neon">assignments.</span></h2>
                            <p>
                                Upload 50-100 portfolio links. Get ranked candidates with evidence.
                                Make confident hiring decisions.
                            </p>

                            <ul className="audience-features">
                                <li>
                                    <span className="check-icon">✓</span>
                                    Batch portfolio analysis
                                </li>
                                <li>
                                    <span className="check-icon">✓</span>
                                    Ranked candidate list
                                </li>
                                <li>
                                    <span className="check-icon">✓</span>
                                    Evidence-based recommendations
                                </li>
                                <li>
                                    <span className="check-icon">✓</span>
                                    Export to CSV/PDF
                                </li>
                            </ul>

                            <Link to="/auth?mode=register&role=recruiter" className="btn btn-primary btn-lg">
                                Try Recruiter Mode
                                <span className="btn-arrow">→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials section" id="testimonials">
                <div className="container">
                    <div className="section-header">
                        <h2>What designers <span className="text-neon">are saying</span></h2>
                        <p>Join thousands of designers who've improved their portfolios with PortLens.</p>
                    </div>

                    <div className="testimonials-grid">
                        <div className="testimonial-card card">
                            <div className="testimonial-content">
                                <p>"PortLens told me exactly what was weak in my case studies. Got 3 interviews after fixing it."</p>
                            </div>
                            <div className="testimonial-author">
                                <div className="author-avatar"></div>
                                <div className="author-info">
                                    <span className="author-name">Alex Rivera</span>
                                    <span className="author-role">Product Designer @ Stripe</span>
                                </div>
                            </div>
                        </div>

                        <div className="testimonial-card card">
                            <div className="testimonial-content">
                                <p>"Finally, honest feedback without waiting weeks for a response. The AI nailed my weaknesses."</p>
                            </div>
                            <div className="testimonial-author">
                                <div className="author-avatar"></div>
                                <div className="author-info">
                                    <span className="author-name">Priya Sharma</span>
                                    <span className="author-role">Senior UX @ Google</span>
                                </div>
                            </div>
                        </div>

                        <div className="testimonial-card card">
                            <div className="testimonial-content">
                                <p>"We stopped giving take-home tests. PortLens ranks 100 portfolios in minutes."</p>
                            </div>
                            <div className="testimonial-author">
                                <div className="author-avatar"></div>
                                <div className="author-info">
                                    <span className="author-name">James Kim</span>
                                    <span className="author-role">Design Lead @ Figma</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta section" id="contact">
                <div className="container">
                    <div className="cta-card glass animate-glow">
                        <h2>Ready to see what AI thinks of <span className="text-neon">your work?</span></h2>
                        <p>Start your free analysis today. No credit card required.</p>
                        <div className="cta-buttons">
                            <Link to="/auth?mode=register" className="btn btn-filled btn-xl">
                                Get Started Free
                                <span className="btn-arrow">→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <Link to="/" className="logo">
                                <span className="logo-icon">◇</span>
                                <span className="logo-text">PortLens</span>
                            </Link>
                            <p>AI-powered Design Intelligence Platform</p>
                        </div>

                        <div className="footer-links">
                            <div className="footer-column">
                                <h4>Product</h4>
                                <a href="#services">Features</a>
                                <a href="#contact">Pricing</a>
                                <a href="#contact">Demo</a>
                            </div>
                            <div className="footer-column">
                                <h4>Company</h4>
                                <a href="#about">About</a>
                                <a href="#contact">Blog</a>
                                <a href="#contact">Careers</a>
                            </div>
                            <div className="footer-column">
                                <h4>Legal</h4>
                                <a href="#contact">Privacy</a>
                                <a href="#contact">Terms</a>
                            </div>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>© 2024 PortLens. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Landing
