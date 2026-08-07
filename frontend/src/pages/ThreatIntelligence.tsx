import { motion } from 'framer-motion'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Shield, AlertTriangle, TrendingUp, Globe, Activity, Zap } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import api from '../api/api'

interface HistoryItem {
  id?: string
  date?: string
  timestamp?: string
  original_username?: string
  clone_username?: string
  profile_fake?: boolean
  spammer?: boolean
  trust_score?: number
  risk_level?: string
  face_verified?: boolean
  face_similarity?: number
  bio_similarity?: number
  username_similarity?: number
}

const getDateKey = (value?: string) => {
  if (!value) return ''

  const normalized = value.includes('T') ? value : value.replace(' ', 'T')
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

const getRelativeTime = (value?: string) => {
  if (!value) return 'recently'

  const date = new Date(value.includes('T') ? value : value.replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return 'recently'

  const diffMinutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000))
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffMinutes < 1440) return `${Math.round(diffMinutes / 60)}h ago`
  return `${Math.round(diffMinutes / 1440)}d ago`
}

const getRiskBucket = (item: HistoryItem) => {
  const risk = (item.risk_level || '').toLowerCase()
  const score = Number(item.trust_score ?? 0)

  if (risk.includes('clone') || risk.includes('critical') || score < 35) return 'Critical'
  if (risk.includes('suspicious') || risk.includes('high') || score < 55) return 'High'
  if (risk.includes('medium') || score < 75) return 'Medium'
  return 'Low'
}

function ThreatBadge({ level }: { level: string }) {
  const cls = level === 'Critical' ? 'badge-critical' : level === 'High' ? 'badge-high' : level === 'Medium' ? 'badge-medium' : 'badge-low'
  return <span className={`${cls} text-xs px-2 py-0.5 rounded-full font-mono`}>{level}</span>
}

function WorldMapSVG() {
  const [attacks, setAttacks] = useState<Array<{ id: number; x: number; y: number; tx: number; ty: number }>>([])

  useEffect(() => {
    const spawn = () => {
      const srcPoints = [
        { x: 200, y: 120 }, { x: 350, y: 100 }, { x: 430, y: 130 },
        { x: 520, y: 110 }, { x: 600, y: 140 }, { x: 250, y: 200 },
      ]
      const dstPoints = [
        { x: 280, y: 160 }, { x: 400, y: 170 }, { x: 490, y: 150 },
        { x: 320, y: 130 }, { x: 560, y: 130 },
      ]
      const src = srcPoints[Math.floor(Math.random() * srcPoints.length)]
      const dst = dstPoints[Math.floor(Math.random() * dstPoints.length)]
      const id = Date.now()
      setAttacks((prev) => [...prev, { id, x: src.x, y: src.y, tx: dst.x, ty: dst.y }])
      setTimeout(() => {
        setAttacks((prev) => prev.filter((a) => a.id !== id))
      }, 2000)
    }

    const interval = setInterval(spawn, 800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full h-48 relative overflow-hidden rounded-xl" style={{ background: 'rgba(0,245,255,0.02)' }}>
      <svg viewBox="0 0 800 300" className="w-full h-full opacity-40">
        <path d="M 50 150 Q 100 100 200 120 Q 280 130 320 160 Q 380 180 450 150 Q 520 110 600 130 Q 680 150 750 140" fill="none" stroke="rgba(0,245,255,0.3)" strokeWidth="1" />
        {[0,1,2,3,4,5,6,7].map((i) => (
          <line key={i} x1={i * 100} y1="0" x2={i * 100} y2="300" stroke="rgba(0,245,255,0.05)" strokeWidth="0.5" />
        ))}
        {[0,1,2,3].map((i) => (
          <line key={i} x1="0" y1={i * 75} x2="800" y2={i * 75} stroke="rgba(0,245,255,0.05)" strokeWidth="0.5" />
        ))}
        {attacks.map((a) => (
          <g key={a.id}>
            <line x1={a.x} y1={a.y} x2={a.tx} y2={a.ty} stroke="#FF3D71" strokeWidth="1" strokeOpacity="0.6" strokeDasharray="4 4">
              <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="0.5s" repeatCount="indefinite" />
            </line>
            <circle cx={a.tx} cy={a.ty} r="4" fill="#FF3D71" fillOpacity="0.8">
              <animate attributeName="r" values="2;8;2" dur="1s" repeatCount="indefinite" />
              <animate attributeName="fill-opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
            </circle>
          </g>
        ))}
        {[{ x: 280, y: 160 }, { x: 400, y: 150 }, { x: 520, y: 130 }].map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="6" fill="none" stroke="#00F5FF" strokeWidth="1" strokeOpacity="0.4">
            <animate attributeName="r" values="4;12;4" dur={`${2 + i}s`} repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0.5;0;0.5" dur={`${2 + i}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
      <div className="absolute bottom-2 right-2 text-xs font-mono text-muted">LIVE THREAT MAP</div>
    </div>
  )
}

export default function ThreatIntelligence() {
  const [historyData, setHistoryData] = useState<HistoryItem[]>([])

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/history')
        setHistoryData(response.data.history || [])
      } catch (error) {
        console.error('Unable to load threat intelligence data:', error)
      }
    }

    fetchHistory()
  }, [])

  const totalScans = historyData.length
  const avgTrust = totalScans
    ? Math.round(historyData.reduce((sum, item) => sum + (Number(item.trust_score ?? 0)), 0) / totalScans)
    : 0
  const activeThreats = historyData.filter((item) => {
    const bucket = getRiskBucket(item)
    return bucket === 'Critical' || bucket === 'High'
  }).length
  const interceptedToday = historyData.filter((item) => getDateKey(item.timestamp || item.date) === getDateKey(new Date().toISOString())).length

  const detectionTrend = useMemo(() => {
    const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - index))
      return date.toISOString().slice(0, 10)
    })

    return lastSevenDays.map((day) => {
      const itemsForDay = historyData.filter((item) => getDateKey(item.timestamp || item.date) === day)
      const clones = itemsForDay.filter((item) => getRiskBucket(item) !== 'Low').length
      const prevented = itemsForDay.filter((item) => getRiskBucket(item) === 'Low').length

      return {
        day: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
        clones,
        prevented,
      }
    })
  }, [historyData])

  const highestThreats = useMemo(() => {
    const counts = {
      'High Risk Profiles': historyData.filter((item) => getRiskBucket(item) === 'Critical').length,
      'Suspicious Profiles': historyData.filter((item) => getRiskBucket(item) === 'High').length,
      'Review Queue': historyData.filter((item) => getRiskBucket(item) === 'Medium').length,
    }

    return [
      { platform: 'High Risk Profiles', count: counts['High Risk Profiles'], severity: 'Critical', color: '#FF3D71' },
      { platform: 'Suspicious Profiles', count: counts['Suspicious Profiles'], severity: 'High', color: '#FF9800' },
      { platform: 'Review Queue', count: counts['Review Queue'], severity: 'Medium', color: '#FFD54F' },
    ].map((item) => ({ ...item, count: item.count || 0 }))
  }, [historyData])

  const modelAccuracy = useMemo(() => {
    const total = Math.max(historyData.length, 1)
    const face = Math.round((historyData.filter((item) => item.face_verified).length / total) * 100)
    const fake = Math.round((historyData.filter((item) => item.profile_fake).length / total) * 100)
    const spammer = Math.round((historyData.filter((item) => item.spammer).length / total) * 100)
    const bio = Math.round((historyData.filter((item) => Number(item.bio_similarity ?? 0) > 0).length / total) * 100)
    const username = Math.round((historyData.filter((item) => Number(item.username_similarity ?? 0) > 0).length / total) * 100)

    return [
      { name: 'DeepFace', accuracy: face || 0, color: '#00F5FF' },
      { name: 'Fake Profile', accuracy: fake || 0, color: '#7B61FF' },
      { name: 'Spammer', accuracy: spammer || 0, color: '#00FFA3' },
      { name: 'Bio NLP', accuracy: bio || 0, color: '#FFD54F' },
      { name: 'Username', accuracy: username || 0, color: '#FF9800' },
    ]
  }, [historyData])

  const recentThreats = useMemo(
    () =>
      historyData
        .slice()
        .sort((a, b) => {
          const aTime = new Date((a.timestamp || a.date || '').includes('T') ? a.timestamp || a.date || '' : (a.timestamp || a.date || '').replace(' ', 'T')).getTime()
          const bTime = new Date((b.timestamp || b.date || '').includes('T') ? b.timestamp || b.date || '' : (b.timestamp || b.date || '').replace(' ', 'T')).getTime()
          return bTime - aTime
        })
        .slice(0, 5)
        .map((item) => ({
          id: item.id || 'INV-UNKNOWN',
          target: item.original_username || 'Unknown',
          clone: item.clone_username || 'Unknown',
          level: getRiskBucket(item),
          time: getRelativeTime(item.timestamp || item.date),
          platform: 'Profile Scan',
        })),
    [historyData],
  )

  const confidence = totalScans ? Math.max(0, Math.min(100, 100 - Math.round(avgTrust / 2))) : 0

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(180deg, #00F5FF, #7B61FF)' }} />
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk' }}>Threat Intelligence</h1>
        </div>
        <p className="text-sm text-muted ml-4">Derived from your latest investigation history and model results</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Threats', value: activeThreats.toLocaleString(), color: '#FF3D71', icon: AlertTriangle },
          { label: 'Intercepted Today', value: interceptedToday.toLocaleString(), color: '#00FFA3', icon: Shield },
          { label: 'Profiles Monitored', value: totalScans.toLocaleString(), color: '#00F5FF', icon: Globe },
          { label: 'AI Confidence', value: `${confidence}%`, color: '#7B61FF', icon: Activity },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-5"
            style={{ border: `1px solid ${s.color}18` }}
          >
            <s.icon size={18} color={s.color} className="mb-3" />
            <div className="text-2xl font-bold font-mono mb-1" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-muted">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-5"
        style={{ border: '1px solid rgba(0,245,255,0.08)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Globe size={16} color="#00F5FF" />
          <h3 className="font-bold" style={{ fontFamily: 'Space Grotesk' }}>Live Threat Map</h3>
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="status-dot status-online" />
            <span className="text-xs font-mono text-success">LIVE</span>
          </div>
        </div>
        <WorldMapSVG />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-5"
          style={{ border: '1px solid rgba(0,245,255,0.08)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} color="#00F5FF" />
            <h3 className="font-bold" style={{ fontFamily: 'Space Grotesk' }}>Detection Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={detectionTrend}>
              <defs>
                <linearGradient id="cloneGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF3D71" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF3D71" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="preventGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00FFA3" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00FFA3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(11,17,32,0.95)', border: '1px solid rgba(0,245,255,0.2)', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 11 }} />
              <Area type="monotone" dataKey="clones" stroke="#FF3D71" strokeWidth={2} fill="url(#cloneGrad)" name="Threats" />
              <Area type="monotone" dataKey="prevented" stroke="#00FFA3" strokeWidth={2} fill="url(#preventGrad)" name="Safe" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-5"
          style={{ border: '1px solid rgba(0,245,255,0.08)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} color="#FF3D71" />
            <h3 className="font-bold" style={{ fontFamily: 'Space Grotesk' }}>Highest Risk Buckets</h3>
          </div>
          <div className="space-y-3">
            {highestThreats.map((t, i) => (
              <div key={t.platform}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white">{t.platform}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono" style={{ color: t.color }}>{t.count}</span>
                    <ThreatBadge level={t.severity} />
                  </div>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(8, (t.count / Math.max(totalScans, 1)) * 100)}%` }}
                    transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                    className="h-full rounded-full"
                    style={{ background: t.color, boxShadow: `0 0 6px ${t.color}60` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} color="#00F5FF" />
              <span className="text-xs font-mono text-muted" style={{ letterSpacing: '0.1em' }}>MODEL ACCURACY</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {modelAccuracy.map((m) => (
                <div key={m.name} className="text-center">
                  <div className="text-sm font-bold font-mono mb-1" style={{ color: m.color }}>{m.accuracy}%</div>
                  <div className="text-xs text-muted truncate">{m.name}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-2xl p-5"
        style={{ border: '1px solid rgba(0,245,255,0.08)' }}
      >
        <h3 className="font-bold mb-4" style={{ fontFamily: 'Space Grotesk' }}>Recent Threats</h3>
        <div className="space-y-2">
          {recentThreats.map((t) => (
            <div key={t.id} className="flex items-center gap-4 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              <span className="text-xs font-mono text-muted w-20 shrink-0">{t.id}</span>
              <div className="flex-1 min-w-0">
                <span className="text-sm text-white">{t.target}</span>
                <span className="text-xs text-muted mx-2">→</span>
                <span className="text-sm text-danger">{t.clone}</span>
              </div>
              <span className="text-xs text-muted hidden md:block">{t.platform}</span>
              <ThreatBadge level={t.level} />
              <span className="text-xs text-muted shrink-0">{t.time}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
