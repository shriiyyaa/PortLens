import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import useAuthStore from './store/authStore'
import { useEffect } from 'react'
import Landing from './pages/Landing'

// Lazy load non-critical routes for faster initial load
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Auth = lazy(() => import('./pages/Auth'))
const PortfolioDetail = lazy(() => import('./pages/PortfolioDetail'))
const RecruiterDashboard = lazy(() => import('./pages/RecruiterDashboard'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Minimal loading spinner
const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#050505'
  }}>
    <div className="spinner" style={{ width: '40px', height: '40px' }} />
  </div>
)

function App() {
  const initialize = useAuthStore(state => state.initialize)

  // Initialize auth synchronously on mount
  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/portfolio/:id" element={<PortfolioDetail />} />
        <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

export default App

