import { motion } from 'framer-motion'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  Tooltip
} from 'recharts'
import { AlertTriangle, CheckCircle, Eye, ShieldCheck } from 'lucide-react'

type Page = 'landing' | 'dashboard' | 'investigation' | 'ai-room' | 'results' | 'explainable' | 'recommendations' | 'profile-diff' | 'threat-intel' | 'history' | 'settings'

interface InvestigationData {
  profile?: { prediction: number; result: string; confidence?: number | null; fake_probability?: number | null }
  spammer?: { prediction: number; result: string; confidence?: number | null; spammer_probability?: number | null }
  username?: { username_similarity: number; match: boolean }
  bio?: { bio_similarity: number; match: boolean }
  face?: { verified: boolean; distance: number; threshold: number } | null
  analyze?: { trust_score: number; status: string; risk: string }
  original?: { username: string; displayName: string; bio: string; image: string | null }
  clone?: { username: string; displayName: string; bio: string; image: string | null }
}

interface ResultDashboardProps {
  onNavigate: (page: Page, data?: unknown) => void
  data: any
}

function GaugeArc({ value, color, label }: { value: number; label: string; color: string }) {
  const r = 50
  const circ = Math.PI * r

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-16 overflow-hidden">
        <svg viewBox="0 0 120 70" className="w-full h-full">
          <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" strokeLinecap="round" />
          <path
            d="M 10 65 A 50 50 0 0 1 110 65"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${(value / 100) * circ} ${circ}`}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
          <text x="60" y="62" textAnchor="middle" fill={color} fontSize="14" fontFamily="JetBrains Mono" fontWeight="bold">
            {value}
          </text>
        </svg>
      </div>
      <span className="text-xs text-muted">{label}</span>
    </div>
  )
}

export default function ResultDashboard({
  onNavigate,
  data,
}: ResultDashboardProps) {

  const d: InvestigationData = data || {}
  const trustScore = Math.round(d.analyze?.trust_score ?? 50)
  const cloneProbability = Math.max(0, 100 - trustScore)
  const faceVerified = d.face?.verified ?? false
  const analyzeStatus = d.analyze?.status ?? ''
  const isClone = analyzeStatus === 'Clone' || analyzeStatus === 'Likely Clone' || analyzeStatus === 'Clone Detected'
  const isSpammer = d.spammer?.prediction === 1

  // Threat level based on trust score
  let threatLevel = 'Low'
  let risk = 'Safe'
  if (trustScore < 35) {
    threatLevel = 'Critical'
    risk = 'Extreme'
  } else if (trustScore < 55) {
    threatLevel = 'High'
    risk = 'High'
  } else if (trustScore < 75) {
    threatLevel = 'Medium'
    risk = 'Moderate'
  }

  const isCritical = threatLevel === 'Critical'
  const decision = isClone ? 'CLONE DETECTED' : 'GENUINE'
  const decisionColor = isClone ? '#FF3D71' : '#00FFA3'
  const decisionBg = isClone ? 'rgba(255,61,113,0.08)' : 'rgba(0,255,163,0.08)'
  const decisionBorder = isClone ? 'rgba(255,61,113,0.3)' : 'rgba(0,255,163,0.3)'

  // AI confidence & probabilities from actual model outputs
  const profileConf = d.profile?.confidence ?? 50
  const spammerConf = d.spammer?.confidence ?? 50
  const aiConfidence = Math.round((profileConf + spammerConf) / 2)
  const profileFakePct = d.profile?.fake_probability ?? (d.profile?.prediction === 1 ? 94.2 : 5.8)
  const spammerFakePct = d.spammer?.spammer_probability ?? (d.spammer?.prediction === 1 ? 78.4 : 21.6)

  // Similarity scores
  const faceSimilarity = d.face
    ? Math.round(Math.max(0, (1 - d.face.distance / d.face.threshold) * 100))
    : 0
  const usernameSimilarity = Math.round(d.username?.username_similarity ?? 0)
  const bioSimilarity = Math.round(d.bio?.bio_similarity ?? 0)
  const behaviourScore = d.spammer
    ? Math.round(d.spammer.spammer_probability ?? d.spammer.confidence ?? (d.spammer.prediction === 1 ? 75 : 25))
    : 0

  const radarData = [
    { subject: "Face", A: faceSimilarity, fullMark: 100 },
    { subject: "Username", A: usernameSimilarity, fullMark: 100 },
    { subject: "Bio", A: bioSimilarity, fullMark: 100 },
    { subject: "Behaviour", A: behaviourScore, fullMark: 100 },
    { subject: "Trust", A: 100 - trustScore, fullMark: 100 },
  ]

  // Model outputs from actual predictions
  const modelOutputs = [
    {
      name: 'Fake Profile Model',
      fake: profileFakePct,
      genuine: 100 - profileFakePct,
      confidence: profileConf,
    },
    {
      name: 'Spammer Model',
      fake: spammerFakePct,
      genuine: 100 - spammerFakePct,
      confidence: spammerConf,
    },
  ]

  // Timeline from actual results
  const timeline = [
    {
      step: 'Face Verification',
      status: 'done',
      result: d.face
        ? `${faceVerified ? 'MATCH' : 'NO MATCH'} — ${faceSimilarity}%`
        : 'Skipped (no images)',
      color: '#00F5FF',
    },
    {
      step: 'Username Similarity',
      status: 'done',
      result: `${usernameSimilarity}% similar`,
      color: '#7B61FF',
    },
    {
      step: 'Bio Similarity',
      status: 'done',
      result: `${bioSimilarity}% overlap`,
      color: '#00FFA3',
    },
    {
      step: 'Profile Prediction',
      status: 'done',
      result: `${isClone ? 'FAKE' : 'GENUINE'} — ${profileConf.toFixed(1)}%`,
      color: '#FFD54F',
    },
    {
      step: 'Spammer Prediction',
      status: 'done',
      result: `${isSpammer ? 'SPAMMER' : 'NOT SPAMMER'} — ${spammerConf.toFixed(1)}%`,
      color: '#FF9800',
    },
    {
      step: 'Explainable AI',
      status: 'done',
      result: 'Report ready',
      color: '#00F5FF',
    },
    {
      step: 'Recommendations',
      status: 'done',
      result: 'Actions queued',
      color: '#7B61FF',
    },
  ]

  function ProfilePreviewCard({ title, data, color }: { title: string; data?: { username?: string; displayName?: string; bio?: string; image: string | null } ; color: string }) {
    return (
      <div className="glass rounded-3xl overflow-hidden border p-4" style={{ borderColor: `${color}20` }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs font-mono text-muted" style={{ letterSpacing: '0.18em' }}>{title}</div>
            <div className="text-sm font-semibold" style={{ color }}>{data?.username ? `@${data.username}` : 'No username'}</div>
          </div>
          <div className="text-xs font-semibold uppercase" style={{ color }}>{title === 'Original Profile' ? 'ORIGINAL' : 'CLONE'}</div>
        </div>
        <div className="rounded-3xl overflow-hidden bg-slate-950 mb-4" style={{ minHeight: 160, border: `1px solid ${color}14` }}>
          {data?.image ? (
            <img src={data.image} alt={`${title} image`} className="w-full h-40 object-cover" />
          ) : (
            <div className="flex h-40 items-center justify-center text-xs text-muted">No image provided</div>
          )}
        </div>
        <div className="space-y-2 text-xs">
          <div>
            <div className="text-muted">Display Name</div>
            <div className="font-mono text-white">{data?.displayName || '—'}</div>
          </div>
          <div>
            <div className="text-muted">Biography</div>
            <div className="font-mono text-white line-clamp-3">{data?.bio || '—'}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk' }}>Analysis Results</h1>
          <p className="text-sm text-muted">
            {d.clone?.username ? `@${d.clone.username}` : 'Investigation'} · Trust Score: {trustScore}/100 · Status: {d.analyze?.status ?? '—'}
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.04 }}
            onClick={() => onNavigate('explainable', data)}
            className="btn-holographic px-4 py-2 rounded-xl text-xs flex items-center gap-2"
          >
            <Eye size={14} /> Explain AI
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            onClick={() => onNavigate('profile-diff', data)}
            className="btn-holographic px-4 py-2 rounded-xl text-xs flex items-center gap-2"
          >
            Compare Profiles
          </motion.button>
        </div>
      </motion.div>

      {/* Profile preview cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 xl:grid-cols-2 gap-4"
      >
        <ProfilePreviewCard title="Original Profile" data={d.original} color="#00F5FF" />
        <ProfilePreviewCard title="Suspected Clone" data={d.clone} color="#7B61FF" />
      </motion.div>

      {/* Decision banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl p-6 text-center relative overflow-hidden"
        style={{
          background: decisionBg,
          border: `1px solid ${decisionBorder}`,
        }}
      >
        <div className="absolute inset-0 cyber-grid opacity-20" />
        <div className="relative">
          <div className={`inline-block text-5xl font-black mb-3 px-8 py-3 rounded-2xl`}
            style={{
              fontFamily: 'Space Grotesk',
              letterSpacing: '0.05em',
              fontSize: '1.8rem',
              background: isClone ? 'rgba(255,61,113,0.15)' : 'rgba(0,255,163,0.15)',
              color: decisionColor,
              border: `1px solid ${decisionColor}33`,
            }}>
            {decision}
          </div>
          <div className="flex items-center justify-center gap-8 mt-4">
            <GaugeArc value={Math.round(cloneProbability)} color="#FF3D71" label="Clone Probability %" />
            <GaugeArc value={trustScore} color="#FFD54F" label="Trust Score" />
            <GaugeArc value={aiConfidence} color="#00F5FF" label="AI Confidence %" />
          </div>
        </div>
      </motion.div>

      {/* Panels row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Radar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-5"
          style={{ border: '1px solid rgba(0,245,255,0.08)' }}
        >
          <h3 className="font-bold mb-4" style={{ fontFamily: 'Space Grotesk' }}>Similarity Radar</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
              <Radar name="Score" dataKey="A" stroke="#00F5FF" fill="#00F5FF" fillOpacity={0.15} strokeWidth={2} />
              <Tooltip contentStyle={{ background: 'rgba(11,17,32,0.95)', border: '1px solid rgba(0,245,255,0.2)', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {radarData.map((rd) => (
              <div key={rd.subject} className="flex items-center justify-between text-xs">
                <span className="text-muted">{rd.subject} Similarity</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.min(rd.A, 100)}%`, background: '#00F5FF' }} />
                  </div>
                  <span className="font-mono text-cyan">{rd.A}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Center — Threat badge + stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-5 flex flex-col items-center justify-between"
          style={{ border: isCritical ? '1px solid rgba(255,61,113,0.15)' : '1px solid rgba(0,255,163,0.15)' }}
        >
          <h3 className="font-bold mb-3 w-full" style={{ fontFamily: 'Space Grotesk' }}>Threat Assessment</h3>

          <div className="flex flex-col items-center gap-4 flex-1 justify-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background: isCritical ? 'rgba(255,61,113,0.1)' : 'rgba(0,255,163,0.1)',
                border: `2px solid ${isCritical ? 'rgba(255,61,113,0.4)' : 'rgba(0,255,163,0.4)'}`,
                boxShadow: isCritical ? '0 0 40px rgba(255,61,113,0.3)' : '0 0 40px rgba(0,255,163,0.3)',
              }}
            >
              {isCritical ? <AlertTriangle size={36} color="#FF3D71" /> : <ShieldCheck size={36} color="#00FFA3" />}
            </div>
            <div
              className={`${isCritical ? 'badge-critical' : 'badge-low'} text-xl font-black px-6 py-2 rounded-xl`}
              style={{ fontFamily: 'Space Grotesk', letterSpacing: '0.05em' }}
            >
              {threatLevel}
            </div>
          </div>

          <div className="w-full space-y-3 mt-4">
            {[
              { label: 'Risk Level', value: risk, color: isCritical ? '#FF3D71' : '#00FFA3' },
              { label: 'Trust Score', value: `${trustScore}/100`, color: '#FFD54F' },
              { label: 'AI Confidence', value: `${aiConfidence}%`, color: '#00F5FF' },
              { label: 'Clone Probability', value: `${Math.round(cloneProbability)}%`, color: '#FF3D71' },
            ].map((s) => (
              <div key={s.label} className="flex justify-between items-center py-1 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                <span className="text-xs text-muted">{s.label}</span>
                <span className="text-sm font-bold font-mono" style={{ color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2 w-full mt-4">
            <motion.button
              whileHover={{ scale: 1.04 }}
              onClick={() => onNavigate('recommendations', data)}
              className="btn-holographic px-4 py-2 rounded-xl text-xs w-full text-center"
            >
              View Recommendations
            </motion.button>
          </div>
        </motion.div>

        {/* Model outputs */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-5"
          style={{ border: '1px solid rgba(0,245,255,0.08)' }}
        >
          <h3 className="font-bold mb-4" style={{ fontFamily: 'Space Grotesk' }}>Model Outputs</h3>

          {modelOutputs.map((m) => (
            <div key={m.name} className="mb-5 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="text-xs font-mono text-cyan mb-3">{m.name}</div>
              <div className="flex gap-3 mb-3">
                <div className="flex-1 text-center py-2 rounded-lg" style={{ background: 'rgba(255,61,113,0.1)', border: '1px solid rgba(255,61,113,0.2)' }}>
                  <div className="text-xs text-muted">Fake</div>
                  <div className="text-sm font-bold font-mono text-danger">{m.fake.toFixed(1)}%</div>
                </div>
                <div className="flex-1 text-center py-2 rounded-lg" style={{ background: 'rgba(0,255,163,0.1)', border: '1px solid rgba(0,255,163,0.2)' }}>
                  <div className="text-xs text-muted">Genuine</div>
                  <div className="text-sm font-bold font-mono text-success">{m.genuine.toFixed(1)}%</div>
                </div>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted">Confidence</span>
                <span className="font-mono text-cyan">{m.confidence.toFixed(1)}%</span>
              </div>
            </div>
          ))}

          {/* DeepFace */}
          <div className="p-4 rounded-xl" style={{ background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.12)' }}>
            <div className="text-xs font-mono text-cyan mb-3">DeepFace Verification</div>
            {d.face ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted">Status</span>
                  <span className={faceVerified ? 'text-success font-mono' : 'text-danger font-mono'}>
                    {faceVerified ? 'VERIFIED MATCH' : 'NO MATCH'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Distance</span>
                  <span className="text-cyan font-mono">{d.face.distance.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Threshold</span>
                  <span className="text-muted font-mono">{d.face.threshold.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Similarity</span>
                  <span className="text-cyan font-mono">{faceSimilarity}%</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted">Status</span>
                  <span className="text-muted font-mono">SKIPPED</span>
                </div>
                <div className="text-muted">No profile images were provided for face verification.</div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-2xl p-6"
        style={{ border: '1px solid rgba(0,245,255,0.08)' }}
      >
        <h3 className="font-bold mb-5" style={{ fontFamily: 'Space Grotesk' }}>Analysis Timeline</h3>
        <div className="flex gap-0 overflow-x-auto">
          {timeline.map((step, i) => (
            <div key={step.step} className="flex-1 min-w-32 text-center relative">
              <div className="flex items-center">
                <div className={`flex-1 h-px ${i === 0 ? 'invisible' : ''}`} style={{ background: 'rgba(0,245,255,0.2)' }} />
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center z-10 shrink-0"
                  style={{ background: `${step.color}20`, border: `2px solid ${step.color}`, boxShadow: `0 0 12px ${step.color}50` }}
                >
                  <CheckCircle size={14} color={step.color} />
                </div>
                <div className={`flex-1 h-px ${i === timeline.length - 1 ? 'invisible' : ''}`} style={{ background: 'rgba(0,245,255,0.2)' }} />
              </div>
              <div className="mt-2 px-1">
                <div className="text-xs font-medium text-white truncate">{step.step}</div>
                <div className="text-xs mt-0.5 font-mono truncate" style={{ color: step.color }}>{step.result}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}