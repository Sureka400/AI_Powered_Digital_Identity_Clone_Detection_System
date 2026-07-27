import { motion } from 'framer-motion'
import { Check, X, AlertTriangle } from 'lucide-react'

const original = {
  username: 'shadowtech99',
  displayName: 'Shadow Tech',
  bio: 'Tech enthusiast · Building the future · DMs open for collaborations',
  followers: '48,291',
  following: '312',
  posts: '847',
  isPrivate: false,
  isBusiness: false,
  externalUrl: 'https://shadowtech.io',
}

const clone = {
  username: '5hadowtech99',
  displayName: 'Shadow Tec_h',
  bio: 'Tech enthusiast · Building the future · DMs open for collaborations 🔥',
  followers: '12',
  following: '1,429',
  posts: '3',
  isPrivate: false,
  isBusiness: false,
  externalUrl: '',
}

type FieldStatus = 'match' | 'changed' | 'suspicious'

const fields: Array<{ key: keyof typeof original; label: string; status: FieldStatus }> = [
  { key: 'username', label: 'Username', status: 'suspicious' },
  { key: 'displayName', label: 'Display Name', status: 'suspicious' },
  { key: 'bio', label: 'Biography', status: 'changed' },
  { key: 'followers', label: 'Followers', status: 'changed' },
  { key: 'following', label: 'Following', status: 'changed' },
  { key: 'posts', label: 'Posts', status: 'changed' },
  { key: 'isPrivate', label: 'Private', status: 'match' },
  { key: 'isBusiness', label: 'Business', status: 'match' },
  { key: 'externalUrl', label: 'External URL', status: 'changed' },
]


function StatusIcon({ status }: { status: FieldStatus }) {
  if (status === 'match') return <Check size={14} color="#00FFA3" />
  if (status === 'changed') return <X size={14} color="#FF3D71" />
  return <AlertTriangle size={14} color="#FFD54F" />
}

function StatusLabel({ status }: { status: FieldStatus }) {
  const labels = { match: 'Matched', changed: 'Changed', suspicious: 'Suspicious' }
  const colors = { match: '#00FFA3', changed: '#FF3D71', suspicious: '#FFD54F' }
  const bgs = { match: 'rgba(0,255,163,0.1)', changed: 'rgba(255,61,113,0.1)', suspicious: 'rgba(255,213,79,0.1)' }
  const borders = { match: 'rgba(0,255,163,0.3)', changed: 'rgba(255,61,113,0.3)', suspicious: 'rgba(255,213,79,0.3)' }
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-mono"
      style={{ color: colors[status], background: bgs[status], border: `1px solid ${borders[status]}` }}
    >
      {labels[status]}
    </span>
  )
}

function highlight(orig: string, cln: string, status: FieldStatus) {
  if (status === 'match') return { orig: <span style={{ color: '#00FFA3' }}>{String(orig)}</span>, cln: <span style={{ color: '#00FFA3' }}>{String(cln)}</span> }
  if (status === 'changed') return {
    orig: <span style={{ color: '#F8FAFC' }}>{String(orig)}</span>,
    cln: <span style={{ color: '#FF3D71' }}>{String(cln) || '—'}</span>,
  }
  // suspicious — highlight diff chars
  const o = String(orig)
  const c = String(cln)
  const maxLen = Math.max(o.length, c.length)
  const origSpans = []
  const clnSpans = []
  for (let i = 0; i < maxLen; i++) {
    const oc = o[i] || ''
    const cc = c[i] || ''
    const diff = oc !== cc
    origSpans.push(<span key={i} style={{ color: diff ? '#FFD54F' : '#F8FAFC' }}>{oc}</span>)
    clnSpans.push(<span key={i} style={{ color: diff ? '#FFD54F' : '#F8FAFC' }}>{cc}</span>)
  }
  return { orig: <>{origSpans}</>, cln: <>{clnSpans}</> }
}

export default function ProfileDifference() {
  const matched = fields.filter((f) => f.status === 'match').length
  const changed = fields.filter((f) => f.status === 'changed').length
  const suspicious = fields.filter((f) => f.status === 'suspicious').length

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(180deg, #00F5FF, #7B61FF)' }} />
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk' }}>Profile Difference Analysis</h1>
        </div>
        <p className="text-sm text-muted ml-4">Field-by-field comparison highlighting every discrepancy</p>
      </motion.div>

      {/* Legend */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex gap-4 flex-wrap">
        {[
          { label: 'Matched', color: '#00FFA3' },
          { label: 'Changed', color: '#FF3D71' },
          { label: 'Suspicious', color: '#FFD54F' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ background: l.color }} />
            <span className="text-muted">{l.label}</span>
          </div>
        ))}
        <div className="ml-auto flex gap-4 text-xs font-mono">
          <span style={{ color: '#00FFA3' }}>{matched} Matched</span>
          <span style={{ color: '#FF3D71' }}>{changed} Changed</span>
          <span style={{ color: '#FFD54F' }}>{suspicious} Suspicious</span>
        </div>
      </motion.div>

      {/* Comparison table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(0,245,255,0.08)' }}
      >
        {/* Header */}
        <div className="grid grid-cols-4 gap-4 px-6 py-4" style={{ background: 'rgba(0,245,255,0.04)', borderBottom: '1px solid rgba(0,245,255,0.08)' }}>
          <div className="text-xs font-mono text-muted" style={{ letterSpacing: '0.1em' }}>FIELD</div>
          <div className="text-xs font-mono text-cyan" style={{ letterSpacing: '0.1em' }}>ORIGINAL</div>
          <div className="text-xs font-mono text-purple" style={{ letterSpacing: '0.1em', color: '#7B61FF' }}>CLONE</div>
          <div className="text-xs font-mono text-muted" style={{ letterSpacing: '0.1em' }}>STATUS</div>
        </div>

        {fields.map((field, i) => {
          const { orig, cln } = highlight(
            typeof original[field.key] === 'boolean' ? (original[field.key] ? 'Yes' : 'No') : (original[field.key] as string),
            typeof clone[field.key] === 'boolean' ? (clone[field.key] ? 'Yes' : 'No') : (clone[field.key] as string),
            field.status,
          )
          return (
            <motion.div
              key={field.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="grid grid-cols-4 gap-4 px-6 py-4 items-start border-b"
              style={{ borderColor: 'rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}
            >
              <div className="text-sm text-muted">{field.label}</div>
              <div className="text-sm font-mono break-all">{orig}</div>
              <div className="text-sm font-mono break-all">{cln}</div>
              <div className="flex items-center gap-2">
                <StatusIcon status={field.status} />
                <StatusLabel status={field.status} />
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
