import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Bell, Search, User, Moon, Sun, ChevronDown, LogOut, X } from 'lucide-react'
import type { Theme } from '../App'
import type { AppNotification } from '../App'

interface NavbarProps {
  user: { name: string; email: string } | null
  onLogout: () => void
  theme: Theme
  onThemeChange: (theme: Theme) => void
  notifications: AppNotification[]
  onMarkNotificationsRead: () => void
  onClearNotifications: () => void
}

export default function Navbar({ user, onLogout, theme, onThemeChange, notifications, onMarkNotificationsRead, onClearNotifications }: NavbarProps) {
  const [time, setTime] = useState(new Date())
  const [profileOpen, setProfileOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const themeRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const closeProfile = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false)
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) setThemeOpen(false)
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) setNotificationsOpen(false)
    }
    window.addEventListener('mousedown', closeProfile)
    return () => window.removeEventListener('mousedown', closeProfile)
  }, [])

  const fmt = time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const date = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit' })
  const unreadCount = notifications.filter((notification) => !notification.read).length

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
        <div className="relative" ref={themeRef}>
          <button
            type="button"
            onClick={() => setThemeOpen((open) => !open)}
            aria-label="Choose color theme"
            aria-expanded={themeOpen}
            aria-haspopup="menu"
            className="p-2 rounded-lg text-muted hover:text-cyan hover:bg-white/5 transition-colors"
          >
            {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          {themeOpen && (
            <div role="menu" className="absolute right-0 mt-2 w-36 rounded-lg p-1.5 glass-strong" style={{ border: '1px solid rgba(0,245,255,0.15)', boxShadow: '0 12px 32px rgba(0,0,0,0.25)' }}>
              {([
                ['light', 'Light', Sun],
                ['dark', 'Dark', Moon],
              ] as const).map(([value, label, Icon]) => (
                <button
                  key={value}
                  type="button"
                  role="menuitem"
                  onClick={() => { onThemeChange(value); setThemeOpen(false) }}
                  className={`w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors ${theme === value ? 'text-cyan bg-white/10' : 'text-muted hover:bg-white/5 hover:text-cyan'}`}
                >
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            aria-label="View alerts"
            aria-expanded={notificationsOpen}
            className="relative p-2 rounded-lg text-muted hover:text-cyan hover:bg-white/5 transition-colors"
            onClick={() => { setNotificationsOpen((open) => !open); onMarkNotificationsRead() }}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-xs flex items-center justify-center font-mono"
              style={{ background: '#FF3D71', color: '#fff', fontSize: '9px' }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
            )}
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl p-2 glass-strong" style={{ border: '1px solid rgba(0,245,255,0.15)', boxShadow: '0 12px 32px rgba(0,0,0,0.3)' }}>
              <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
                <span className="text-sm font-medium text-white">Alerts</span>
                {notifications.length > 0 && <button type="button" aria-label="Clear alerts" onClick={onClearNotifications} className="text-muted hover:text-danger"><X size={14} /></button>}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-3 py-6 text-center text-xs text-muted">No alerts yet. Completed investigations will appear here.</p>
                ) : notifications.map((notification) => (
                  <div key={notification.id} className="px-3 py-3 border-b border-white/5 last:border-0">
                    <p className={`text-sm font-medium ${notification.severity === 'danger' ? 'text-danger' : 'text-cyan'}`}>{notification.title}</p>
                    <p className="mt-1 text-xs text-muted">{notification.message}</p>
                    <p className="mt-1 text-[10px] text-slate-500">{new Date(notification.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((open) => !open)}
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #00F5FF, #7B61FF)' }}
            >
              <User size={14} color="#050816" />
            </div>
            <span className="text-sm font-medium hidden md:block" style={{ fontFamily: 'Space Grotesk' }}>{user?.name || 'Analyst'}</span>
            <ChevronDown size={12} className={`text-muted transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div role="menu" className="absolute right-0 mt-2 w-56 rounded-xl p-2 glass-strong" style={{ border: '1px solid rgba(0,245,255,0.15)', boxShadow: '0 12px 32px rgba(0,0,0,0.3)' }}>
              <div className="px-3 py-2 border-b border-white/10">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'Analyst'}</p>
                <p className="text-xs text-muted truncate">{user?.email || 'Not signed in'}</p>
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={onLogout}
                className="mt-1 w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger hover:bg-white/5 transition-colors"
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  )
}
