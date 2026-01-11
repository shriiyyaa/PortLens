import { Link } from 'react-router-dom'

function NotFound() {
    return (
        <div className="glass" style={{
            minHeight: '80vh',
            margin: '5vh auto',
            maxWidth: '600px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '4rem 2rem',
            borderRadius: 'var(--radius-3xl)',
            border: 'var(--glass-border-glow)'
        }}>
            <div style={{ fontSize: '5rem', marginBottom: '2rem', filter: 'drop-shadow(0 0 20px rgba(255,0,0,0.3))' }}>🔍</div>
            <h1 style={{
                fontSize: '5rem',
                fontWeight: 800,
                color: 'var(--color-neon)',
                textShadow: 'var(--glow-lg)',
                margin: '0 0 1rem 0'
            }}>
                404
            </h1>
            <p style={{
                fontSize: '1.125rem',
                color: 'var(--color-text-secondary)',
                marginBottom: '2.5rem',
                maxWidth: '400px',
                lineHeight: '1.6'
            }}>
                The page you're looking for has vanished into the digital void. Let's get you back to safety.
            </p>
            <Link to="/" className="btn btn-primary btn-xl">
                Return to PortLens
            </Link>
        </div>
    )
}

export default NotFound
