import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Search,
  Shield,
  Clock,
  Settings,
  Zap,
  Activity,
  ChevronRight,
  Brain,
  FlaskConical,
  Cpu,
  Lightbulb,
  Star,
  GitCompare,
  ChevronDown,
} from 'lucide-react'
import { useState } from 'react'

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

interface SidebarProps {
  current: Page
  onNavigate: (page: Page) => void
}

const mainNav = [
  { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'investigation' as Page, label: 'New Investigation', icon: Search },
  { id: 'threat-intel' as Page, label: 'Threat Intelligence', icon: Shield },
  { id: 'history' as Page, label: 'Analysis History', icon: Clock },
  { id: 'settings' as Page, label: 'Settings', icon: Settings },
]

const analysisNav = [
  { id: 'ai-room' as Page, label: 'AI Investigation Room', icon: Cpu },
  { id: 'results' as Page, label: 'Results Dashboard', icon: Activity },
  { id: 'explainable' as Page, label: 'Explainable AI', icon: Lightbulb },
  { id: 'recommendations' as Page, label: 'AI Recommendations', icon: Star },
  { id: 'profile-diff' as Page, label: 'Profile Difference', icon: GitCompare },
]

export default function Sidebar({ current, onNavigate }: SidebarProps) {
  const [analysisOpen, setAnalysisOpen] = useState(
    analysisNav.some((n) => n.id === current)
  )

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed left-0 top-0 h-full w-64 z-40 glass-strong flex flex-col overflow-y-auto"
      style={{ borderRight: '1px solid rgba(0,245,255,0.08)' }}
    >
      {/* Logo */}
      <div className="p-6 border-b shrink-0" style={{ borderColor: 'rgba(0,245,255,0.08)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center animate-pulse-cyan"
            style={{ background: 'linear-gradient(135deg, #00F5FF20, #7B61FF20)', border: '1px solid rgba(0,245,255,0.4)' }}
          >
            <Brain size={20} color="#00F5FF" />
          </div>
          <div>
            <div className="text-xs font-mono text-cyan" style={{ letterSpacing: '0.15em' }}>IDCLONE.AI</div>
            <div className="text-xs text-muted">Identity Intelligence</div>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {mainNav.map((item) => {
          const active = current === item.id
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                active ? 'sidebar-active text-cyan' : 'text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={18} />
              <span style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{item.label}</span>
              {active && <ChevronRight size={14} className="ml-auto text-cyan" />}
            </motion.button>
          )
        })}

        {/* Analysis Results section */}
        <div className="pt-3">
          <button
            onClick={() => setAnalysisOpen((o) => !o)}
            className="w-full flex items-center gap-2 px-4 py-2 text-xs font-mono transition-colors hover:text-cyan"
            style={{ color: '#4B5563', letterSpacing: '0.12em' }}
          >
            <FlaskConical size={11} />
            ANALYSIS RESULTS
            <ChevronDown
              size={11}
              className="ml-auto transition-transform duration-200"
              style={{ transform: analysisOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>

          <motion.div
            initial={false}
            animate={{ height: analysisOpen ? 'auto' : 0, opacity: analysisOpen ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="space-y-0.5 mt-1">
              {analysisNav.map((item) => {
                const active = current === item.id
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                      active ? 'sidebar-active' : 'text-muted hover:text-white hover:bg-white/5'
                    }`}
                    style={active ? { color: '#00F5FF' } : {}}
                  >
                    <item.icon size={15} />
                    <span style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{item.label}</span>
                    {active && <ChevronRight size={12} className="ml-auto" />}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </div>
      </nav>

      {/* System Status */}
      <div className="p-4 mx-3 mb-4 rounded-xl shrink-0" style={{ background: 'rgba(0,245,255,0.03)', border: '1px solid rgba(0,245,255,0.08)' }}>
        <div className="text-xs font-mono text-muted mb-3" style={{ letterSpacing: '0.12em' }}>SYSTEM STATUS</div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={12} color="#00FFA3" />
              <span className="text-xs text-muted">Backend</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="status-dot status-online" />
              <span className="text-xs text-success font-mono">Connected</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={12} color="#7B61FF" />
              <span className="text-xs text-muted">AI Models</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="status-dot status-online" />
              <span className="text-xs text-success font-mono">Loaded</span>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  )
}
