import { motion } from 'framer-motion'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { Eye, FileText, Shield, Activity, Cpu, TrendingUp } from 'lucide-react'
import { useState, useEffect } from 'react'

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

const weeklyData = [
  { day: 'Mon', detections: 142, scans: 890, threats: 23 },
  { day: 'Tue', detections: 198, scans: 1240, threats: 41 },
  { day: 'Wed', detections: 167, scans: 1050, threats: 18 },
  { day: 'Thu', detections: 234, scans: 1480, threats: 56 },
  { day: 'Fri', detections: 289, scans: 1720, threats: 67 },
  { day: 'Sat', detections: 178, scans: 1100, threats: 31 },
  { day: 'Sun', detections: 312, scans: 1950, threats: 78 },
]

const threatDist = [
  { name: 'Critical', value: 12, color: '#FF3D71' },
  { name: 'High', value: 28, color: '#FF9800' },
  { name: 'Medium', value: 41, color: '#FFD54F' },
  { name: 'Low', value: 19, color: '#00FFA3' },
]

const trendData = [
  { month: 'Jan', accuracy: 94.2 }, { month: 'Feb', accuracy: 95.8 },
  { month: 'Mar', accuracy: 96.1 }, { month: 'Apr', accuracy: 97.3 },
  { month: 'May', accuracy: 97.8 }, { month: 'Jun', accuracy: 98.2 },
  { month: 'Jul', accuracy: 98.6 },
]

const recentActivity = [
  { id: 'INV-8821', user: '@shadowtech99', clone: '@5hadowtech99', score: 94.2, threat: 'Critical', time: '2m ago' },
  { id: 'INV-8820', user: '@elena.ross', clone: '@elena.r0ss', score: 71.8, threat: 'High', time: '8m ago' },
  { id: 'INV-8819', user: '@cryptoking', clone: '@crypt0king', score: 45.3, threat: 'Medium', time: '15m ago' },
  { id: 'INV-8818', user: '@healthguru', clone: '@health_guru_', score: 28.1, threat: 'Low', time: '31m ago' },
  { id: 'INV-8817', user: '@techfounder', clone: '@techf0under', score: 88.7, threat: 'Critical', time: '45m ago' },
]

const aiModules = [
  { name: 'Face Verification (DeepFace)', status: 99.1, color: '#00F5FF' },
  { name: 'Username Similarity', status: 97.8, color: '#7B61FF' },
  { name: 'Bio Analysis NLP', status: 98.4, color: '#00FFA3' },
  { name: 'Fake Profile Classifier', status: 96.2, color: '#FFD54F' },
  { name: 'Spammer Detection', status: 97.1, color: '#FF3D71' },
]

const cards = [
  { label: 'Profiles Scanned', value: 2847391, icon: Eye, color: '#00F5FF', change: '+12.4%' },
  { label: "Today's Reports", value: 487, icon: FileText, color: '#7B61FF', change: '+8.1%' },
  { label: 'Clone Detection Rate', value: 98, suffix: '%', icon: Shield, color: '#00FFA3', change: '+0.4%' },
  { label: 'Avg Trust Score', value: 76, suffix: '/100', icon: Activity, color: '#FFD54F', change: '-2.1%' },
]

function ThreatBadge({ level }: { level: string }) {
  const cls = level === 'Critical' ? 'badge-critical' : level === 'High' ? 'badge-high' : level === 'Medium' ? 'badge-medium' : 'badge-low'
  return (
    <span className={`${cls} text-xs px-2 py-0.5 rounded-full font-mono`}>{level}</span>
  )
}

export default function Dashboard() {
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
              <div className="text-3xl font-bold text-cyan font-mono">98.6%</div>
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
              <span
                className="text-xs font-mono px-2 py-1 rounded-lg"
                style={{
                  background: card.change.startsWith('+') ? 'rgba(0,255,163,0.1)' : 'rgba(255,61,113,0.1)',
                  color: card.change.startsWith('+') ? '#00FFA3' : '#FF3D71',
                }}
              >
                {card.change}
              </span>
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
            <h3 className="font-bold" style={{ fontFamily: 'Space Grotesk' }}>Recent Activity</h3>
            <span className="text-xs text-cyan cursor-pointer hover:underline">View All →</span>
          </div>
          <div className="space-y-3">
            {recentActivity.map((item) => (
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
            ))}
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
            {aiModules.map((mod) => (
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
              <LineChart data={trendData}>
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
