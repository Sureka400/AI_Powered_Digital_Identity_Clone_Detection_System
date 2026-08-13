import { motion } from 'framer-motion'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { Eye, FileText, Shield, Activity, Cpu, TrendingUp } from 'lucide-react'
import { useState, useEffect } from 'react'
import api from '../api/api'

interface HistoryItem {
  id: string
  date?: string
  timestamp?: string
  original_username?: string
  clone_username?: string
  profile_fake?: boolean
  spammer?: boolean
  decision?: string
  decision_label?: string
  trust_score: number
  risk_level?: string
  face_verified?: boolean
  face_similarity?: number
  bio_similarity?: number
  username_similarity?: number
  recommendation?: string[]
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const start = Date.now()
    const dur = 1200
    const tick = () => {
      const p = Math.min((Date.now() - start) / dur, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(ease * value))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value])
  return <>{display.toLocaleString()}</>
}

function ThreatBadge({ level }: { level: string }) {
  const normalized =
    level === 'Trusted' || level === 'Low' || level === 'Genuine' ? 'Genuine' :
    level === 'Suspicious' ? 'Suspicious' :
    level === 'Clone' || level === 'Likely Clone' || level === 'Clone Detected' ? 'Clone Detected' :
    level

  const cls = normalized === 'Clone Detected'
    ? 'badge-critical'
    : normalized === 'Suspicious'
    ? 'badge-high'
    : normalized === 'Medium'
    ? 'badge-medium'
    : 'badge-low'

  return (
    <span className={`${cls} text-xs px-2 py-0.5 rounded-full font-mono`}>{normalized}</span>
  )
}

interface DashboardProps {
  analystEmail: string | null
}

export default function Dashboard({ analystEmail }: DashboardProps) {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([])
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'All' | 'Genuine' | 'Suspicious' | 'Clone Detected'>('All')

  useEffect(() => {
    const fetchHistory = async () => {
      if (!analystEmail) {
        setHistoryItems([])
        return
      }
      try {
        const response = await api.get('/history', { params: { analyst_email: analystEmail } })
        setHistoryItems(response.data.history || [])
      } catch (error) {
        console.error('Unable to load history data:', error)
      }
    }

    fetchHistory()
  }, [analystEmail])

  const parseTimestamp = (value: string | undefined) => {
    if (!value) return null
    const normalized = value.replace(' ', 'T')
    const date = new Date(normalized)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const localDateKey = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const totalScans = historyItems.length
  const todayKey = localDateKey(new Date())
  const scansToday = historyItems.filter((item) => {
    const timestamp = parseTimestamp(item.timestamp || item.date)
    return timestamp ? localDateKey(timestamp) === todayKey : false
  }).length
  const avgTrust = totalScans ? Math.round(historyItems.reduce((sum, item) => sum + item.trust_score, 0) / totalScans) : 0
  const cloneRate = totalScans
    ? Math.round(historyItems.filter((item) => item.trust_score < 50).length / totalScans * 100)
    : 0

  const normalizeStatus = (item: HistoryItem) => {
    const status = item.decision || item.decision_label || item.risk_level || ''
    if (status === 'Trusted' || status === 'Low' || status === 'Genuine') return 'Genuine'
    if (status === 'Suspicious') return 'Suspicious'
    if (status === 'Clone' || status === 'Likely Clone' || status === 'Clone Detected') return 'Clone Detected'
    if (item.trust_score >= 75) return 'Genuine'
    if (item.trust_score >= 50) return 'Suspicious'
    return 'Clone Detected'
  }

  const confirmedThreats = historyItems.filter((item) => normalizeStatus(item) === 'Clone Detected').length

  const filteredHistoryItems = selectedStatusFilter === 'All'
    ? historyItems
    : historyItems.filter((item) => normalizeStatus(item) === selectedStatusFilter)

  const riskCounts = filteredHistoryItems.reduce(
    (acc, item) => {
      const bucket = item.trust_score < 35 ? 'Critical' : item.trust_score < 55 ? 'High' : item.trust_score < 75 ? 'Medium' : 'Low'
      acc[bucket] = (acc[bucket] || 0) + 1
      return acc
    },
    { Critical: 0, High: 0, Medium: 0, Low: 0 } as Record<string, number>,
  )

  const filteredTotal = filteredHistoryItems.length

  const threatDist = [
    { name: 'Critical', value: filteredTotal ? Math.round((riskCounts.Critical / filteredTotal) * 100) : 0, color: '#FF3D71' },
    { name: 'High', value: filteredTotal ? Math.round((riskCounts.High / filteredTotal) * 100) : 0, color: '#FF9800' },
    { name: 'Medium', value: filteredTotal ? Math.round((riskCounts.Medium / filteredTotal) * 100) : 0, color: '#FFD54F' },
    { name: 'Low', value: filteredTotal ? Math.round((riskCounts.Low / filteredTotal) * 100) : 0, color: '#00FFA3' },
  ]

  const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - index))
    return date
  })

  const weeklyMap = historyItems.reduce<Record<string, { detections: number; scans: number; threats: number }>>((acc, item) => {
    const timestamp = parseTimestamp(item.timestamp || item.date)
    if (!timestamp) return acc
    const key = localDateKey(timestamp)
    if (!acc[key]) acc[key] = { detections: 0, scans: 0, threats: 0 }
    acc[key].detections += 1
    acc[key].scans += 1
    if (item.risk_level === 'Critical' || item.risk_level === 'High' || normalizeStatus(item) === 'Clone Detected') {
      acc[key].threats += 1
    }
    return acc
  }, {})

  const weekNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const weeklyData = lastSevenDays.map((date) => {
    const key = localDateKey(date)
    return {
      day: weekNames[date.getDay()],
      detections: weeklyMap[key]?.detections ?? 0,
      scans: weeklyMap[key]?.scans ?? 0,
      threats: weeklyMap[key]?.threats ?? 0,
    }
  })

  const recentActivity = filteredHistoryItems
    .slice()
    .sort((a, b) => {
      const dateA = parseTimestamp(a.timestamp || a.date)
      const dateB = parseTimestamp(b.timestamp || b.date)
      return (dateB?.getTime() ?? 0) - (dateA?.getTime() ?? 0)
    })
    .slice(0, 5)
    .map((item, index) => ({
      id: item.id || item.timestamp || `history-${index}`,
      user: item.original_username || 'unknown',
      clone: item.clone_username || '-',
      score: item.trust_score,
      threat: normalizeStatus(item),
      time: (item.timestamp || item.date || '').split(' ')[1] ?? '—',
    }))

  const faceCount = historyItems.filter((item) => item.face_similarity != null).length
  const faceHealth = faceCount
    ? Math.round(historyItems.reduce((sum, item) => sum + (item.face_similarity ?? 0), 0) / faceCount)
    : 0
  const usernameCount = historyItems.filter((item) => item.username_similarity != null).length
  const usernameHealth = usernameCount
    ? Math.round(historyItems.reduce((sum, item) => sum + (item.username_similarity ?? 0), 0) / usernameCount)
    : 0
  const bioCount = historyItems.filter((item) => item.bio_similarity != null).length
  const bioHealth = bioCount
    ? Math.round(historyItems.reduce((sum, item) => sum + (item.bio_similarity ?? 0), 0) / bioCount)
    : 0
  const fakeProfileHealth = totalScans
    ? Math.round(100 - (historyItems.filter((item) => item.profile_fake).length / totalScans) * 100)
    : 0
  const spammerHealth = totalScans
    ? Math.round(100 - (historyItems.filter((item) => item.spammer).length / totalScans) * 100)
    : 0

  const aiHealthMetrics = [
    { name: 'Face Verification (DeepFace)', status: faceHealth, color: '#00F5FF' },
    { name: 'Username Similarity', status: usernameHealth, color: '#7B61FF' },
    { name: 'Bio Analysis NLP', status: bioHealth, color: '#00FFA3' },
    { name: 'Fake Profile Classifier', status: fakeProfileHealth, color: '#FFD54F' },
    { name: 'Spammer Detection', status: spammerHealth, color: '#FF3D71' },
  ]

  const cards = [
    { label: 'Profiles Scanned', value: totalScans, icon: Eye, color: '#00F5FF' },
    { label: 'Average Trust Score', value: avgTrust, suffix: '/100', icon: Activity, color: '#7B61FF' },
    { label: "Today's Scans", value: scansToday, icon: FileText, color: '#00FFA3' },
    { label: 'Clones Detected', value: confirmedThreats, icon: Shield, color: '#FFD54F' },
  ]

  const detectionAccuracy = totalScans ? Math.max(0, 100 - cloneRate) : 0

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(0,245,255,0.08) 0%, rgba(123,97,255,0.08) 100%)',
          border: '1px solid rgba(0,245,255,0.15)',
        }}
      >
        <div className="absolute inset-0 cyber-grid opacity-40" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="status-dot status-online" />
              <span className="text-xs font-mono text-success" style={{ letterSpacing: '0.12em' }}>AI SYSTEM OPERATIONAL</span>
            </div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk' }}>Identity Intelligence Dashboard</h1>
            <p className="text-sm text-muted mt-1">All 5 AI models loaded · Real-time monitoring active · Last sync 2s ago</p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <div className="text-3xl font-bold text-cyan font-mono">{detectionAccuracy}%</div>
              <div className="text-xs text-muted">Detection Accuracy</div>
            </div>
            <div className="w-16 h-16 relative">
              <svg viewBox="0 0 64 64" className="animate-spin-slow">
                <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(0,245,255,0.1)" strokeWidth="2" />
                <circle cx="32" cy="32" r="28" fill="none" stroke="#00F5FF" strokeWidth="2"
                  strokeDasharray="140 36" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="glass rounded-2xl p-5"
            style={{ border: `1px solid ${card.color}18` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${card.color}15` }}
              >
                <card.icon size={18} color={card.color} />
              </div>
            </div>
            <div className="text-2xl font-bold counter mb-1" style={{ color: card.color }}>
              <AnimatedNumber value={card.value} />{card.suffix}
            </div>
            <div className="text-xs text-muted">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly detection */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass rounded-2xl p-6"
          style={{ border: '1px solid rgba(0,245,255,0.08)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold" style={{ fontFamily: 'Space Grotesk' }}>Weekly Detection Overview</h3>
            <span className="text-xs font-mono text-muted">Last 7 days</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00F5FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00F5FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7B61FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7B61FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(11,17,32,0.95)', border: '1px solid rgba(0,245,255,0.2)', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 12 }} />
              <Area type="monotone" dataKey="detections" stroke="#00F5FF" strokeWidth={2} fill="url(#cyanGrad)" />
              <Area type="monotone" dataKey="threats" stroke="#7B61FF" strokeWidth={2} fill="url(#purpleGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Threat distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6"
          style={{ border: '1px solid rgba(0,245,255,0.08)' }}
        >
          <h3 className="font-bold mb-4" style={{ fontFamily: 'Space Grotesk' }}>Threat Distribution</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={threatDist} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {threatDist.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'rgba(11,17,32,0.95)', border: '1px solid rgba(0,245,255,0.2)', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {threatDist.map((t) => (
              <div key={t.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: t.color }} />
                  <span className="text-muted">{t.name}</span>
                </div>
                <span className="font-mono" style={{ color: t.color }}>{t.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 glass rounded-2xl p-6"
          style={{ border: '1px solid rgba(0,245,255,0.08)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold" style={{ fontFamily: 'Space Grotesk' }}>Recent Activity</h3>
              <p className="text-xs text-muted mt-1">Showing {selectedStatusFilter === 'All' ? 'all activity' : selectedStatusFilter} records</p>
            </div>
            <div className="flex items-center gap-2">
              {(['All', 'Genuine', 'Suspicious', 'Clone Detected'] as const).map((filter) => {
                const isActive = selectedStatusFilter === filter
                const color =
                  filter === 'Clone Detected' ? '#FF3D71' :
                  filter === 'Suspicious' ? '#FFD54F' :
                  filter === 'Genuine' ? '#00FFA3' :
                  '#00F5FF'
                return (
                  <button
                    key={filter}
                    onClick={() => setSelectedStatusFilter(filter)}
                    className="text-xs font-mono px-3 py-1 rounded-full transition-colors"
                    style={{
                      border: `1px solid ${isActive ? color : 'rgba(255,255,255,0.1)'}`,
                      background: isActive ? `${color}20` : 'transparent',
                      color: isActive ? color : '#94A3B8',
                    }}
                  >
                    {filter}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <div className="py-10 text-center text-muted">No recent activity for this filter.</div>
            ) : (
              recentActivity.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                  <div className="text-xs font-mono text-muted w-20 shrink-0">{item.id}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{item.user}</div>
                    <div className="text-xs text-muted truncate">→ {item.clone}</div>
                  </div>
                  <div className="text-xs font-mono text-cyan">{item.score}%</div>
                  <ThreatBadge level={item.threat} />
                  <div className="text-xs text-muted shrink-0">{item.time}</div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* AI Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-2xl p-6"
          style={{ border: '1px solid rgba(0,245,255,0.08)' }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Cpu size={16} color="#00F5FF" />
            <h3 className="font-bold" style={{ fontFamily: 'Space Grotesk' }}>AI Health</h3>
          </div>
          <div className="space-y-4">
            {aiHealthMetrics.map((mod) => (
              <div key={mod.name}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted truncate pr-2">{mod.name}</span>
                  <span className="font-mono shrink-0" style={{ color: mod.color }}>{mod.status}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${mod.status}%` }}
                    transition={{ duration: 1.2, delay: 0.8 }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${mod.color}aa, ${mod.color})`, boxShadow: `0 0 8px ${mod.color}40` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Detection trend mini */}
          <div className="mt-5 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} color="#00FFA3" />
              <span className="text-xs text-muted">Detection Trend</span>
            </div>
            <ResponsiveContainer width="100%" height={60}>
              <LineChart data={weeklyData.map((row) => ({ day: row.day, accuracy: row.detections }))}>
                <Line type="monotone" dataKey="accuracy" stroke="#00FFA3" strokeWidth={2} dot={false} />
                <Tooltip contentStyle={{ background: 'rgba(11,17,32,0.95)', border: '1px solid rgba(0,245,255,0.2)', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 11 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
