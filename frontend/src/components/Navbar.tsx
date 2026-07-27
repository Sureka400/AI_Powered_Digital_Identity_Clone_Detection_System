import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, Search, User, Moon, ChevronDown } from 'lucide-react'

export default function Navbar() {
  const [time, setTime] = useState(new Date())
  const [notifs, setNotifs] = useState(3)

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const fmt = time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const date = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit' })

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="fixed top-0 left-64 right-0 h-16 z-30 glass-strong flex items-center px-6 gap-4"
      style={{ borderBottom: '1px solid rgba(0,245,255,0.08)' }}
    >
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Search size={14} color="#94A3B8" />
          <input
            placeholder="Search identities, threats..."
            className="bg-transparent text-sm text-muted outline-none flex-1 placeholder-slate-600"
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
          <span className="text-xs font-mono text-slate-600">⌘K</span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-4">
        {/* Time */}
        <div className="text-right hidden md:block">
          <div className="text-xs font-mono text-cyan">{fmt}</div>
          <div className="text-xs text-muted">{date}</div>
        </div>

        {/* Theme */}
        <button className="p-2 rounded-lg text-muted hover:text-cyan hover:bg-white/5 transition-colors">
          <Moon size={16} />
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg text-muted hover:text-cyan hover:bg-white/5 transition-colors"
          onClick={() => setNotifs(0)}
        >
          <Bell size={16} />
          {notifs > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-xs flex items-center justify-center font-mono"
              style={{ background: '#FF3D71', color: '#fff', fontSize: '9px' }}
            >
              {notifs}
            </span>
          )}
        </button>

        {/* Profile */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00F5FF, #7B61FF)' }}
          >
            <User size={14} color="#050816" />
          </div>
          <span className="text-sm font-medium hidden md:block" style={{ fontFamily: 'Space Grotesk' }}>Analyst</span>
          <ChevronDown size={12} className="text-muted" />
        </button>
      </div>
    </motion.header>
  )
}
