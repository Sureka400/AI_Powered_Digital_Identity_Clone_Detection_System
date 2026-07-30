import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ParticleBackground from './components/ParticleBackground'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import NewInvestigation from './pages/NewInvestigation'
import AIInvestigationRoom from './pages/AIInvestigationRoom'
import ResultDashboard from './pages/ResultDashboard'
import ExplainableAI from './pages/ExplainableAI'
import AIRecommendation from './pages/AIRecommendation'
import ProfileDifference from './pages/ProfileDifference'
import ThreatIntelligence from './pages/ThreatIntelligence'
import History from './pages/History'
import Settings from './pages/Settings'

type Page =
  | 'landing'
  | 'dashboard'
  | 'investigation'
  | 'ai-room'
  | 'results'
  | 'explainable'
  | 'recommendations'
  | 'profile-diff'
  | 'threat-intel'
  | 'history'
  | 'settings'


const pageTitles: Record<Page, string> = {
  landing: 'Home',
  dashboard: 'Dashboard',
  investigation: 'New Investigation',
  'ai-room': 'AI Investigation Room',
  results: 'Analysis Results',
  explainable: 'Explainable AI',
  recommendations: 'Recommendations',
  'profile-diff': 'Profile Difference',
  'threat-intel': 'Threat Intelligence',
  history: 'Analysis History',
  settings: 'Settings',
}

// Mouse spotlight effect
function MouseSpotlight() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const h = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', h)
    return () => window.removeEventListener('mousemove', h)
  }, [])
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 1,
        background: `radial-gradient(circle 400px at ${pos.x}px ${pos.y}px, rgba(0,245,255,0.03), transparent)`,
      }}
    />
  )
}

export default function App() {
  const [page, setPage] = useState<Page>('landing')
  const [investigationData, setInvestigationData] = useState<unknown>(null)

  const navigate = (nextPage: Page, data?: unknown) => {
    if (data !== undefined) setInvestigationData(data)
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen noise" style={{ background: 'var(--bg-primary)' }}>
      <ParticleBackground />
      <MouseSpotlight />

      <AnimatePresence mode="wait">
        {page === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="relative"
            style={{ zIndex: 10 }}
          >
            {/* Landing top bar */}
            <div
              className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-8 py-4"
              style={{ background: 'rgba(5,8,22,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,245,255,0.06)' }}
            >
              <div className="flex items-center gap-3">
                <div className="text-sm font-mono text-cyan" style={{ letterSpacing: '0.15em' }}>IDCLONE.AI</div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('dashboard')}
                  className="text-sm text-muted hover:text-white transition-colors px-4 py-2"
                >
                  Dashboard
                </button>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  onClick={() => navigate('investigation')}
                  className="btn-liquid px-5 py-2 rounded-xl text-xs font-bold"
                  style={{ fontFamily: 'Space Grotesk' }}
                >
                  Start Investigation
                </motion.button>
              </div>
            </div>
            <Landing onNavigate={navigate} />
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex"
            style={{ zIndex: 10, position: 'relative' }}
          >
            <Sidebar current={page} onNavigate={navigate} />
            <div className="flex-1 ml-64">
              <Navbar />
              <main className="pt-16 min-h-screen">
                <div className="p-6 lg:p-8">
                  {/* Breadcrumb */}
                  <motion.div
                    key={page}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-xs text-muted mb-6 font-mono"
                  >
                    <span
                      className="hover:text-cyan cursor-pointer transition-colors"
                      onClick={() => navigate('dashboard')}
                    >
                      Dashboard
                    </span>
                    {page !== 'dashboard' && (
                      <>
                        <span>/</span>
                        <span className="text-white">{pageTitles[page]}</span>
                      </>
                    )}
                  </motion.div>

                  {/* Page content */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={page}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                      {page === 'dashboard' && <Dashboard />}
                      {page === 'investigation' && <NewInvestigation onNavigate={navigate} />}
                      {page === 'ai-room' && <AIInvestigationRoom onNavigate={navigate} investigationData={investigationData} />}
                      {page === 'results' && <ResultDashboard onNavigate={navigate} data={investigationData} />}
                      {page === 'explainable' && <ExplainableAI data={investigationData} />}
                      {page === 'recommendations' && <AIRecommendation data={investigationData} />}
                      {page === 'profile-diff' && <ProfileDifference data={investigationData} />}
                      {page === 'threat-intel' && <ThreatIntelligence />}
                      {page === 'history' && <History />}
                      {page === 'settings' && <Settings />}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </main>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
