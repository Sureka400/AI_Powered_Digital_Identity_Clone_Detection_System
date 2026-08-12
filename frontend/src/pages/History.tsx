import { motion } from 'framer-motion'
import { Download, Eye, Search, Filter, ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../api/api'

interface HistoryRow {
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
  status?: string
  face_verified?: boolean
  face_similarity?: number
  bio_similarity?: number
  username_similarity?: number
}

function getDisplayStatus(row: HistoryRow): string {
  const value = row.decision || row.decision_label || row.status || row.risk_level || 'Unknown'
  return value && value.trim() ? value : 'Unknown'
}

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
  const [historyData, setHistoryData] = useState<HistoryRow[]>([])
  const [search, setSearch] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'clone' | 'genuine' | 'suspicious'>('all')
  const [selectedRow, setSelectedRow] = useState<HistoryRow | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [downloadError, setDownloadError] = useState('')

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/history')
        setHistoryData(response.data.history || [])
      } catch (error) {
        console.error('Unable to load history:', error)
      }
    }
    fetchHistory()
  }, [])

  // Handlers for view and download
  const viewDetails = (row: HistoryRow) => {
    setSelectedRow(row)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedRow(null)
  }

  const downloadReport = async (row: HistoryRow) => {
    setDownloadingId(row.id)
    setDownloadError('')
    try {
      const payload = {
        // Backwards-compatible fields per ReportRequest
        profile_name: row.original_username || row.clone_username || row.id || 'unknown',
        trust_score: row.trust_score ?? 0,
        clone_probability: row.face_similarity ?? row.username_similarity ?? 0,
        status: row.decision || row.decision_label || row.risk_level || 'Unknown',
        recommendation: (row.decision || row.decision_label || '').toLowerCase().includes('clone') ? 'Flag for review' : 'No action',

        // Extended metadata for richer PDF
        id: row.id,
        username: row.clone_username || row.original_username,
        original_username: row.original_username,
        clone_username: row.clone_username,
        face_similarity: row.face_similarity,
        bio_similarity: row.bio_similarity,
        username_similarity: row.username_similarity,
        clone_probability: 100 - (row.trust_score ?? 0),
        face_verified: row.face_verified,
        decision: row.decision || row.decision_label || row.risk_level || 'Unknown',
        risk_level: row.risk_level,
      }

      // Request a PDF Blob so Edge receives a complete application/pdf payload.
      const resp = await api.post('/report', payload, { responseType: 'blob' })
      const blob = resp.data as Blob
      const bytes = new Uint8Array(await blob.arrayBuffer())

      if (blob.size === 0 || !bytes.slice(0, 4).every((byte, index) => byte === [37, 80, 68, 70][index])) {
        throw new Error('The server did not return a valid PDF file.')
      }

      // Try to get filename from response headers
      let filename = `${row.id}.pdf`
      const contentDisposition = resp.headers && (resp.headers['content-disposition'] || resp.headers['Content-Disposition'])
      if (contentDisposition) {
        const match = /filename\*?=(?:UTF-8'')?"?([^";\n]+)/i.exec(contentDisposition)
        if (match && match[1]) filename = decodeURIComponent(match[1].replace(/"/g, ''))
      }

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.setTimeout(() => window.URL.revokeObjectURL(url), 1000)
    } catch (e) {
      console.error('Report download failed', e)
      setDownloadError('Could not generate the report. Please try again.')
    } finally {
      setDownloadingId(null)
    }
  }

  const filtered = historyData.filter((r) => {
    const q = search.toLowerCase()
    const matchesSearch =
      (r.original_username || '').toLowerCase().includes(q) ||
      (r.clone_username || '').toLowerCase().includes(q) ||
      (r.decision || r.decision_label || '').toLowerCase().includes(q) ||
      (r.risk_level || r.status || '').toLowerCase().includes(q) ||
      (r.timestamp || r.date || '').toLowerCase().includes(q) ||
      String(r.trust_score).includes(q)

    if (!matchesSearch) return false

    if (selectedFilter === 'all') return true
    if (selectedFilter === 'clone') return ((r.decision || r.decision_label) || '').toLowerCase() === 'clone' || ((r.risk_level || '').toLowerCase().includes('clone'))
    if (selectedFilter === 'genuine') return ((r.decision || r.decision_label) || '').toLowerCase() === 'genuine'
    if (selectedFilter === 'suspicious') return ((r.risk_level || r.status || '').toLowerCase().includes('suspicious'))
    return true
  })

  return (
    <div className="space-y-6">
      {downloadError && (
        <div className="rounded-lg px-4 py-3 text-sm" style={{ color: '#FFB4C5', background: 'rgba(255,61,113,0.12)', border: '1px solid rgba(255,61,113,0.35)' }}>
          {downloadError}
        </div>
      )}
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

          {/* Quick filters */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${selectedFilter === 'all' ? 'bg-white/5' : ''}`}
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            >All</button>
            <button
              onClick={() => setSelectedFilter('clone')}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${selectedFilter === 'clone' ? 'bg-white/5' : ''}`}
              style={{ border: '1px solid rgba(255,255,255,0.06)', color: '#FF3D71' }}
            >Clone Detected</button>
            <button
              onClick={() => setSelectedFilter('suspicious')}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${selectedFilter === 'suspicious' ? 'bg-white/5' : ''}`}
              style={{ border: '1px solid rgba(255,255,255,0.06)', color: '#FFD54F' }}
            >Suspicious</button>
            <button
              onClick={() => setSelectedFilter('genuine')}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${selectedFilter === 'genuine' ? 'bg-white/5' : ''}`}
              style={{ border: '1px solid rgba(255,255,255,0.06)', color: '#00FFA3' }}
            >Genuine</button>
          </div>
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
              <div className="text-xs font-mono text-muted">{(row.timestamp || row.date || '').split(' ')[0]}</div>
              <div className="text-xs font-mono text-cyan">{row.id}</div>
              <div className="text-sm text-white truncate">{row.original_username || 'unknown'}</div>
              <div className="text-sm text-danger truncate">{row.clone_username || '-'}</div>
              <div className="text-xs font-mono" style={{ color: row.trust_score < 30 ? '#FF3D71' : row.trust_score < 60 ? '#FFD54F' : '#00FFA3' }}>{row.trust_score}/100</div>
              <div className="text-xs font-mono text-cyan">{Math.round((row.face_similarity || 0) * 100) / 100}%</div>
              <ThreatBadge level={row.risk_level || row.status || 'Unknown'} />
              <div className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ color: getDisplayStatus(row).toLowerCase().includes('clone') || getDisplayStatus(row).toLowerCase().includes('fake') ? '#FF3D71' : getDisplayStatus(row).toLowerCase().includes('genuine') ? '#00FFA3' : '#FFD54F', background: `${getDisplayStatus(row).toLowerCase().includes('clone') || getDisplayStatus(row).toLowerCase().includes('fake') ? '#FF3D71' : getDisplayStatus(row).toLowerCase().includes('genuine') ? '#00FFA3' : '#FFD54F'}15`, border: `1px solid ${getDisplayStatus(row).toLowerCase().includes('clone') || getDisplayStatus(row).toLowerCase().includes('fake') ? '#FF3D71' : getDisplayStatus(row).toLowerCase().includes('genuine') ? '#00FFA3' : '#FFD54F'}30` }}>
                {getDisplayStatus(row)}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => viewDetails(row)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="View Details">
                  <Eye size={13} color="#00F5FF" />
                </button>
                <button onClick={() => downloadReport(row)} disabled={downloadingId === row.id} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50" title="Download Report">
                  <Download size={13} color={downloadingId === row.id ? '#00F5FF' : '#94A3B8'} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
      {/* Details modal */}
      {showModal && selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={closeModal} />
          <div className="relative w-[min(900px,95%)] bg-slate-900 rounded-2xl p-6 z-60">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-xs font-mono text-muted">Investigation</div>
                <div className="text-lg font-semibold">{selectedRow.id} · {selectedRow.original_username} vs {selectedRow.clone_username}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => downloadReport(selectedRow)} disabled={downloadingId === selectedRow.id} className="px-3 py-2 rounded-lg disabled:opacity-50" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                  {downloadingId === selectedRow.id ? 'Generating PDF...' : 'Download PDF'}
                </button>
                <button onClick={closeModal} className="px-3 py-2 rounded-lg">Close</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-xs text-muted">Original</div>
                <div className="text-sm font-mono">{selectedRow.original_username}</div>
                <div className="text-xs text-muted">Trust Score</div>
                <div className="text-sm font-mono">{selectedRow.trust_score}/100</div>
                <div className="text-xs text-muted">Decision</div>
                <div className="text-sm font-mono">{selectedRow.decision || selectedRow.decision_label || selectedRow.risk_level}</div>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-muted">Clone</div>
                <div className="text-sm font-mono">{selectedRow.clone_username}</div>
                <div className="text-xs text-muted">Face similarity</div>
                <div className="text-sm font-mono">{selectedRow.face_similarity ?? '—'}</div>
                <div className="text-xs text-muted">Bio similarity</div>
                <div className="text-sm font-mono">{selectedRow.bio_similarity ?? '—'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
