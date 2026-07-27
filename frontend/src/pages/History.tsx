import { motion } from 'framer-motion'
import { Download, Eye, Search, Filter, ChevronDown } from 'lucide-react'
import { useState } from 'react'

const historyData = [
  { id: 'INV-8822', date: '2026-07-27 14:32', original: '@shadowtech99', clone: '@5hadowtech99', trust: 12, prob: 94.2, threat: 'Critical', status: 'Confirmed' },
  { id: 'INV-8821', date: '2026-07-27 13:18', original: '@cryptoking', clone: '@crypt0king', trust: 18, prob: 88.7, threat: 'Critical', status: 'Confirmed' },
  { id: 'INV-8820', date: '2026-07-27 11:45', original: '@elena.ross', clone: '@elena.r0ss', trust: 31, prob: 71.8, threat: 'High', status: 'Under Review' },
  { id: 'INV-8819', date: '2026-07-27 09:22', original: '@techfounder', clone: '@techf0under', trust: 44, prob: 61.3, threat: 'High', status: 'Confirmed' },
  { id: 'INV-8818', date: '2026-07-26 22:10', original: '@healthguru', clone: '@health_guru_', trust: 58, prob: 45.3, threat: 'Medium', status: 'False Positive' },
  { id: 'INV-8817', date: '2026-07-26 19:55', original: '@airesearch', clone: '@a1research', trust: 72, prob: 32.1, threat: 'Low', status: 'Cleared' },
  { id: 'INV-8816', date: '2026-07-26 17:31', original: '@designpro', clone: '@des1gnpro', trust: 25, prob: 79.4, threat: 'High', status: 'Confirmed' },
  { id: 'INV-8815', date: '2026-07-26 14:08', original: '@musicstar', clone: '@mus1cstar_', trust: 11, prob: 96.1, threat: 'Critical', status: 'Confirmed' },
]

function ThreatBadge({ level }: { level: string }) {
  const cls = level === 'Critical' ? 'badge-critical' : level === 'High' ? 'badge-high' : level === 'Medium' ? 'badge-medium' : 'badge-low'
  return <span className={`${cls} text-xs px-2 py-0.5 rounded-full font-mono`}>{level}</span>
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Confirmed: '#FF3D71',
    'Under Review': '#FFD54F',
    'False Positive': '#94A3B8',
    Cleared: '#00FFA3',
  }
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-mono"
      style={{ color: colors[status] || '#94A3B8', background: `${colors[status] || '#94A3B8'}15`, border: `1px solid ${colors[status] || '#94A3B8'}30` }}
    >
      {status}
    </span>
  )
}

export default function History() {
  const [search, setSearch] = useState('')
  const filtered = historyData.filter(
    (r) =>
      r.original.includes(search) ||
      r.clone.includes(search) ||
      r.id.includes(search) ||
      r.threat.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(180deg, #00F5FF, #7B61FF)' }} />
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk' }}>Analysis History</h1>
          </div>
          <p className="text-sm text-muted ml-4">{historyData.length} investigations · Sorted by date</p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Search size={14} color="#94A3B8" />
            <input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm outline-none text-white placeholder-slate-600 w-40"
            />
          </div>
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Filter size={14} />
            Filter
            <ChevronDown size={12} />
          </button>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(0,245,255,0.08)' }}
      >
        {/* Header */}
        <div className="grid gap-3 px-5 py-3" style={{ gridTemplateColumns: '110px 120px 1fr 1fr 70px 80px 90px 80px 100px', background: 'rgba(0,245,255,0.04)', borderBottom: '1px solid rgba(0,245,255,0.08)' }}>
          {['Date', 'Detection ID', 'Original', 'Clone', 'Trust', 'Clone %', 'Threat', 'Status', 'Actions'].map((h) => (
            <div key={h} className="text-xs font-mono text-muted" style={{ letterSpacing: '0.08em' }}>{h}</div>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <div className="text-muted">No investigations found</div>
          </div>
        ) : (
          filtered.map((row, i) => (
            <motion.div
              key={row.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="grid gap-3 px-5 py-3 items-center border-b hover:bg-white/[0.02] transition-colors"
              style={{ gridTemplateColumns: '110px 120px 1fr 1fr 70px 80px 90px 80px 100px', borderColor: 'rgba(255,255,255,0.04)' }}
            >
              <div className="text-xs font-mono text-muted">{row.date.split(' ')[0]}</div>
              <div className="text-xs font-mono text-cyan">{row.id}</div>
              <div className="text-sm text-white truncate">{row.original}</div>
              <div className="text-sm text-danger truncate">{row.clone}</div>
              <div className="text-xs font-mono" style={{ color: row.trust < 30 ? '#FF3D71' : row.trust < 60 ? '#FFD54F' : '#00FFA3' }}>{row.trust}/100</div>
              <div className="text-xs font-mono text-cyan">{row.prob}%</div>
              <ThreatBadge level={row.threat} />
              <StatusBadge status={row.status} />
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="View Report">
                  <Eye size={13} color="#00F5FF" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Export PDF">
                  <Download size={13} color="#94A3B8" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  )
}
