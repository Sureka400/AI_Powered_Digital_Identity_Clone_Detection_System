import { motion } from 'framer-motion'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  Tooltip
} from 'recharts'
import { AlertTriangle, CheckCircle, Eye } from 'lucide-react'

type Page = 'landing' | 'dashboard' | 'investigation' | 'ai-room' | 'results' | 'explainable' | 'recommendations' | 'profile-diff' | 'threat-intel' | 'history' | 'settings'

interface ResultDashboardProps {
  onNavigate: (page: Page, data?: unknown) => void
}

const results = {
  cloneProbability: 94.2,
  trustScore: 12,
  threatLevel: 'Critical',
  aiConfidence: 97.8,
  risk: 'Extreme',
  decision: 'CLONE DETECTED',
  faceSimilarity: 91.3,
  usernameSimilarity: 87.4,
  bioSimilarity: 74.2,
  behaviourScore: 68.9,
}

const radarData = [
  { subject: 'Face', A: results.faceSimilarity, fullMark: 100 },
  { subject: 'Username', A: results.usernameSimilarity, fullMark: 100 },
  { subject: 'Bio', A: results.bioSimilarity, fullMark: 100 },
  { subject: 'Behaviour', A: results.behaviourScore, fullMark: 100 },
  { subject: 'Trust', A: 100 - results.trustScore, fullMark: 100 },
]

const modelOutputs = [
  { name: 'Fake Profile Model', fake: 94.2, genuine: 5.8, confidence: 97.1 },
  { name: 'Spammer Model', fake: 78.4, genuine: 21.6, confidence: 91.3 },
]

const timeline = [
  { step: 'Face Verification', status: 'done', result: '91.3% match', color: '#00F5FF' },
  { step: 'Username Similarity', status: 'done', result: '87.4% similar', color: '#7B61FF' },
  { step: 'Bio Similarity', status: 'done', result: '74.2% overlap', color: '#00FFA3' },
  { step: 'Profile Prediction', status: 'done', result: 'FAKE — 94.2%', color: '#FFD54F' },
  { step: 'Spammer Prediction', status: 'done', result: 'SPAMMER — 78.4%', color: '#FF9800' },
  { step: 'Explainable AI', status: 'done', result: 'Report ready', color: '#00F5FF' },
  { step: 'Recommendations', status: 'done', result: '5 actions queued', color: '#7B61FF' },
]

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

export default function ResultDashboard({ onNavigate }: ResultDashboardProps) {
  const isCritical = results.threatLevel === 'Critical'

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk' }}>Analysis Results</h1>
          <p className="text-sm text-muted">Investigation #INV-8822 · Completed 0s ago</p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.04 }}
            onClick={() => onNavigate('explainable')}
            className="btn-holographic px-4 py-2 rounded-xl text-xs flex items-center gap-2"
          >
            <Eye size={14} /> Explain AI
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            onClick={() => onNavigate('profile-diff')}
            className="btn-holographic px-4 py-2 rounded-xl text-xs flex items-center gap-2"
          >
            Compare Profiles
          </motion.button>
        </div>
      </motion.div>

      {/* Decision banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl p-6 text-center relative overflow-hidden"
        style={{
          background: isCritical ? 'rgba(255,61,113,0.08)' : 'rgba(0,255,163,0.08)',
          border: `1px solid ${isCritical ? 'rgba(255,61,113,0.3)' : 'rgba(0,255,163,0.3)'}`,
        }}
      >
        <div className="absolute inset-0 cyber-grid opacity-20" />
        <div className="relative">
          <div className={`inline-block text-5xl font-black mb-3 ${isCritical ? 'badge-critical' : 'badge-low'} px-8 py-3 rounded-2xl`}
            style={{ fontFamily: 'Space Grotesk', letterSpacing: '0.05em', fontSize: '1.8rem' }}>
            {results.decision}
          </div>
          <div className="flex items-center justify-center gap-8 mt-4">
            <GaugeArc value={Math.round(results.cloneProbability)} color="#FF3D71" label="Clone Probability %" />
            <GaugeArc value={results.trustScore} color="#FFD54F" label="Trust Score" />
            <GaugeArc value={Math.round(results.aiConfidence)} color="#00F5FF" label="AI Confidence %" />
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
            {radarData.map((d) => (
              <div key={d.subject} className="flex items-center justify-between text-xs">
                <span className="text-muted">{d.subject} Similarity</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full" style={{ width: `${d.A}%`, background: '#00F5FF' }} />
                  </div>
                  <span className="font-mono text-cyan">{d.A}%</span>
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
          style={{ border: '1px solid rgba(255,61,113,0.15)' }}
        >
          <h3 className="font-bold mb-3 w-full" style={{ fontFamily: 'Space Grotesk' }}>Threat Assessment</h3>

          <div className="flex flex-col items-center gap-4 flex-1 justify-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(255,61,113,0.1)',
                border: '2px solid rgba(255,61,113,0.4)',
                boxShadow: '0 0 40px rgba(255,61,113,0.3)',
              }}
            >
              <AlertTriangle size={36} color="#FF3D71" />
            </div>
            <div
              className="badge-critical text-xl font-black px-6 py-2 rounded-xl"
              style={{ fontFamily: 'Space Grotesk', letterSpacing: '0.05em' }}
            >
              {results.threatLevel}
            </div>
          </div>

          <div className="w-full space-y-3 mt-4">
            {[
              { label: 'Risk Level', value: results.risk, color: '#FF3D71' },
              { label: 'Trust Score', value: `${results.trustScore}/100`, color: '#FFD54F' },
              { label: 'AI Confidence', value: `${results.aiConfidence}%`, color: '#00F5FF' },
              { label: 'Clone Probability', value: `${results.cloneProbability}%`, color: '#FF3D71' },
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
              onClick={() => onNavigate('recommendations')}
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
                  <div className="text-sm font-bold font-mono text-danger">{m.fake}%</div>
                </div>
                <div className="flex-1 text-center py-2 rounded-lg" style={{ background: 'rgba(0,255,163,0.1)', border: '1px solid rgba(0,255,163,0.2)' }}>
                  <div className="text-xs text-muted">Genuine</div>
                  <div className="text-sm font-bold font-mono text-success">{m.genuine}%</div>
                </div>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted">Confidence</span>
                <span className="font-mono text-cyan">{m.confidence}%</span>
              </div>
            </div>
          ))}

          {/* DeepFace */}
          <div className="p-4 rounded-xl" style={{ background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.12)' }}>
            <div className="text-xs font-mono text-cyan mb-3">DeepFace Verification</div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">Status</span>
                <span className="text-success font-mono">VERIFIED MATCH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Distance</span>
                <span className="text-cyan font-mono">0.142</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Threshold</span>
                <span className="text-muted font-mono">0.400</span>
              </div>
            </div>
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
