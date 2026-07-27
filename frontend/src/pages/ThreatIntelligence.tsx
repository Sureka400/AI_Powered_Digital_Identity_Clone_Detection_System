import { motion } from 'framer-motion'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Shield, AlertTriangle, TrendingUp, Globe, Activity, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'

const detectionTrend = [
  { month: 'Jan', clones: 234, prevented: 198 },
  { month: 'Feb', clones: 312, prevented: 287 },
  { month: 'Mar', clones: 289, prevented: 251 },
  { month: 'Apr', clones: 467, prevented: 441 },
  { month: 'May', clones: 398, prevented: 368 },
  { month: 'Jun', clones: 521, prevented: 489 },
  { month: 'Jul', clones: 612, prevented: 583 },
]

const highestThreats = [
  { platform: 'Instagram', count: 847, severity: 'Critical', color: '#FF3D71' },
  { platform: 'Twitter/X', count: 634, severity: 'High', color: '#FF9800' },
  { platform: 'LinkedIn', count: 412, severity: 'High', color: '#FF9800' },
  { platform: 'Facebook', count: 318, severity: 'Medium', color: '#FFD54F' },
  { platform: 'TikTok', count: 201, severity: 'Medium', color: '#FFD54F' },
]

const modelAccuracy = [
  { name: 'DeepFace', accuracy: 98.2, color: '#00F5FF' },
  { name: 'Fake Profile', accuracy: 96.8, color: '#7B61FF' },
  { name: 'Spammer', accuracy: 94.1, color: '#00FFA3' },
  { name: 'Bio NLP', accuracy: 97.3, color: '#FFD54F' },
  { name: 'Username', accuracy: 99.1, color: '#FF9800' },
]

const recentThreats = [
  { id: 'TH-9921', target: '@cryptoking', clone: '@crypt0king', level: 'Critical', time: '3m ago', platform: 'Instagram' },
  { id: 'TH-9920', target: '@techfounder', clone: '@techf0under', level: 'Critical', time: '11m ago', platform: 'Twitter' },
  { id: 'TH-9919', target: '@healthguru', clone: '@health_guru_', level: 'High', time: '28m ago', platform: 'LinkedIn' },
  { id: 'TH-9918', target: '@elena.ross', clone: '@elena.r0ss', level: 'High', time: '45m ago', platform: 'Instagram' },
  { id: 'TH-9917', target: '@airesearch', clone: '@a1research', level: 'Medium', time: '1h ago', platform: 'Twitter' },
]

function ThreatBadge({ level }: { level: string }) {
  const cls = level === 'Critical' ? 'badge-critical' : level === 'High' ? 'badge-high' : 'badge-medium'
  return <span className={`${cls} text-xs px-2 py-0.5 rounded-full font-mono`}>{level}</span>
}

function WorldMapSVG() {
  const [attacks, setAttacks] = useState<Array<{ id: number; x: number; y: number; tx: number; ty: number; progress: number }>>([])

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
      setAttacks((prev) => [...prev, { id, x: src.x, y: src.y, tx: dst.x, ty: dst.y, progress: 0 }])
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
        {/* Simplified world outline */}
        <path d="M 50 150 Q 100 100 200 120 Q 280 130 320 160 Q 380 180 450 150 Q 520 110 600 130 Q 680 150 750 140" fill="none" stroke="rgba(0,245,255,0.3)" strokeWidth="1" />
        {/* Grid */}
        {[0,1,2,3,4,5,6,7].map((i) => (
          <line key={i} x1={i * 100} y1="0" x2={i * 100} y2="300" stroke="rgba(0,245,255,0.05)" strokeWidth="0.5" />
        ))}
        {[0,1,2,3].map((i) => (
          <line key={i} x1="0" y1={i * 75} x2="800" y2={i * 75} stroke="rgba(0,245,255,0.05)" strokeWidth="0.5" />
        ))}
        {/* Attack lines */}
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
        {/* Hot spots */}
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
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(180deg, #00F5FF, #7B61FF)' }} />
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk' }}>Threat Intelligence</h1>
        </div>
        <p className="text-sm text-muted ml-4">Real-time global clone detection and threat landscape</p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Threats', value: '1,284', color: '#FF3D71', icon: AlertTriangle },
          { label: 'Intercepted Today', value: '583', color: '#00FFA3', icon: Shield },
          { label: 'Platforms Monitored', value: '14', color: '#00F5FF', icon: Globe },
          { label: 'AI Confidence', value: '97.8%', color: '#7B61FF', icon: Activity },
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

      {/* World map */}
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

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Detection trend */}
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
              <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(11,17,32,0.95)', border: '1px solid rgba(0,245,255,0.2)', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 11 }} />
              <Area type="monotone" dataKey="clones" stroke="#FF3D71" strokeWidth={2} fill="url(#cloneGrad)" name="Clones Detected" />
              <Area type="monotone" dataKey="prevented" stroke="#00FFA3" strokeWidth={2} fill="url(#preventGrad)" name="Threats Prevented" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Highest threats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-5"
          style={{ border: '1px solid rgba(0,245,255,0.08)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} color="#FF3D71" />
            <h3 className="font-bold" style={{ fontFamily: 'Space Grotesk' }}>Highest Threat Platforms</h3>
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
                    animate={{ width: `${(t.count / 847) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                    className="h-full rounded-full"
                    style={{ background: t.color, boxShadow: `0 0 6px ${t.color}60` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Model accuracy */}
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

      {/* Recent threats */}
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
