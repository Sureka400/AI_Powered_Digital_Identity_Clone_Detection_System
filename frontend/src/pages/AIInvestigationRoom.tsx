import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Loader, Activity } from 'lucide-react'

type Page = 'landing' | 'dashboard' | 'investigation' | 'ai-room' | 'results' | 'explainable' | 'recommendations' | 'profile-diff' | 'threat-intel' | 'history' | 'settings'

interface AIInvestigationRoomProps {
  onNavigate: (page: Page, data?: unknown) => void
  investigationData?: unknown
}

const modules = [
  { id: 'face', label: 'Face Verification Module', color: '#00F5FF', delay: 0 },
  { id: 'username', label: 'Username Analysis Module', color: '#7B61FF', delay: 800 },
  { id: 'bio', label: 'Bio Analysis Module', color: '#00FFA3', delay: 1600 },
  { id: 'fake', label: 'Fake Profile Model', color: '#FFD54F', delay: 2400 },
  { id: 'spammer', label: 'Spammer Detection Model', color: '#FF9800', delay: 3200 },
  { id: 'decision', label: 'Decision Engine', color: '#FF3D71', delay: 4000 },
  { id: 'xai', label: 'Explainable AI', color: '#00F5FF', delay: 4800 },
  { id: 'recommend', label: 'Recommendation Engine', color: '#7B61FF', delay: 5600 },
]

const consoleLogs = [
  { t: 200, msg: '[INIT] Loading AI pipeline...', color: '#94A3B8' },
  { t: 600, msg: '[FACE] DeepFace model initialized', color: '#00F5FF' },
  { t: 900, msg: '[FACE] Extracting facial embeddings...', color: '#00F5FF' },
  { t: 1400, msg: '[FACE] Cosine distance: 0.142 — MATCH', color: '#00FFA3' },
  { t: 1800, msg: '[USERNAME] Tokenizing identifiers...', color: '#7B61FF' },
  { t: 2200, msg: '[USERNAME] Levenshtein score: 0.87', color: '#7B61FF' },
  { t: 2600, msg: '[BIO] NLP embedding similarity: 0.74', color: '#00FFA3' },
  { t: 3000, msg: '[BIO] Topic model: 93% overlap detected', color: '#00FFA3' },
  { t: 3400, msg: '[FAKE] Profile classification: FAKE 94.2%', color: '#FFD54F' },
  { t: 3800, msg: '[SPAMMER] Behavioral flags: 7/9 triggered', color: '#FF9800' },
  { t: 4200, msg: '[DECISION] Aggregating model outputs...', color: '#FF3D71' },
  { t: 4600, msg: '[DECISION] Clone probability: 94.2%', color: '#FF3D71' },
  { t: 5000, msg: '[XAI] Computing SHAP feature importances...', color: '#00F5FF' },
  { t: 5400, msg: '[XAI] Explanation generated', color: '#00F5FF' },
  { t: 5800, msg: '[RECOMMEND] Generating security recommendations...', color: '#7B61FF' },
  { t: 6200, msg: '[COMPLETE] Analysis finished. Trust Score: 12/100', color: '#00FFA3' },
]

function AICore() {
  return (
    <div className="relative w-40 h-40 mx-auto">
      {/* Outer rings */}
      {[1, 1.4, 1.8].map((scale, i) => (
        <div
          key={i}
          className="absolute inset-0 rounded-full border"
          style={{
            transform: `scale(${scale})`,
            borderColor: `rgba(0,245,255,${0.15 - i * 0.04})`,
            animation: `spin-slow ${6 + i * 3}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
          }}
        />
      ))}
      {/* Core sphere */}
      <div
        className="absolute inset-8 rounded-full flex items-center justify-center"
        style={{
          background: 'radial-gradient(circle, rgba(0,245,255,0.3) 0%, rgba(123,97,255,0.2) 50%, transparent 100%)',
          boxShadow: '0 0 40px rgba(0,245,255,0.5), 0 0 80px rgba(123,97,255,0.3)',
          animation: 'pulse-cyan 2s ease-in-out infinite',
        }}
      >
        <Activity size={24} color="#00F5FF" />
      </div>
      {/* Orbiting dots */}
      {[0, 90, 180, 270].map((deg, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            top: `${50 + 46 * Math.sin((deg * Math.PI) / 180)}%`,
            left: `${50 + 46 * Math.cos((deg * Math.PI) / 180)}%`,
            transform: 'translate(-50%, -50%)',
            background: i % 2 === 0 ? '#00F5FF' : '#7B61FF',
            boxShadow: `0 0 8px ${i % 2 === 0 ? '#00F5FF' : '#7B61FF'}`,
            animation: `spin-slow ${4}s linear infinite`,
          }}
        />
      ))}
    </div>
  )
}

export default function AIInvestigationRoom({ onNavigate, investigationData }: AIInvestigationRoomProps) {
  const [activeModules, setActiveModules] = useState<string[]>([])
  const [logs, setLogs] = useState<typeof consoleLogs>([])
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)
  const totalDuration = 7000

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    modules.forEach((m) => {
      timers.push(setTimeout(() => {
        setActiveModules((prev) => [...prev, m.id])
      }, m.delay))
    })

    consoleLogs.forEach((log) => {
      timers.push(setTimeout(() => {
        setLogs((prev) => [...prev, log])
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
      }, log.t))
    })

    const progressInterval = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(p + 100 / (totalDuration / 100), 100)
        return next
      })
    }, 100)

    timers.push(setTimeout(() => {
      clearInterval(progressInterval)
      setProgress(100)
      setDone(true)
    }, totalDuration))

    return () => {
      timers.forEach(clearTimeout)
      clearInterval(progressInterval)
    }
  }, [])

  useEffect(() => {
    if (done) {
      const t = setTimeout(() => {
        onNavigate('results', investigationData)
      }, 1500)
      return () => clearTimeout(t)
    }
  }, [done, onNavigate, investigationData])

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center space-y-8">
      {/* Title */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ fontFamily: 'Space Grotesk', background: 'linear-gradient(135deg,#00F5FF,#7B61FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          AI Investigation Room
        </h1>
        <p className="text-sm text-muted">Multi-modal AI pipeline executing identity analysis</p>
      </motion.div>

      {/* Main panel */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module ring */}
        <div className="lg:col-span-1 glass rounded-2xl p-6 flex flex-col items-center" style={{ border: '1px solid rgba(0,245,255,0.12)' }}>
          <div className="mb-6">
            <AICore />
          </div>

          {/* Progress ring */}
          <div className="relative w-24 h-24 mb-4">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
              <circle
                cx="50" cy="50" r="40" fill="none" stroke="#00F5FF" strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.1s linear', filter: 'drop-shadow(0 0 8px #00F5FF)' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold font-mono text-cyan">{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Modules list */}
          <div className="w-full space-y-2">
            {modules.map((mod) => {
              const active = activeModules.includes(mod.id)
              return (
                <div key={mod.id} className="flex items-center gap-2 text-xs">
                  <div className="shrink-0">
                    {active ? (
                      <CheckCircle size={12} color="#00FFA3" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border" style={{ borderColor: 'rgba(255,255,255,0.15)' }} />
                    )}
                  </div>
                  <span className={active ? 'text-white' : 'text-muted'} style={{ color: active ? mod.color : undefined }}>
                    {mod.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Console */}
        <div className="lg:col-span-2 glass rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(0,245,255,0.08)' }}>
          {/* Console header */}
          <div className="px-4 py-3 flex items-center gap-2" style={{ background: 'rgba(0,245,255,0.04)', borderBottom: '1px solid rgba(0,245,255,0.08)' }}>
            <div className="flex gap-1.5">
              {['#FF3D71', '#FFD54F', '#00FFA3'].map((c) => (
                <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
              ))}
            </div>
            <span className="text-xs font-mono text-muted ml-2">AI PIPELINE CONSOLE</span>
            {done && (
              <span className="ml-auto text-xs font-mono text-success flex items-center gap-1">
                <CheckCircle size={12} /> COMPLETE
              </span>
            )}
          </div>

          <div
            ref={logRef}
            className="p-4 font-mono text-xs space-y-1.5 overflow-y-auto"
            style={{ height: 360, background: 'rgba(5,8,22,0.8)' }}
          >
            <div className="text-muted mb-3" style={{ color: '#4a5568' }}>$ idclone-ai analyze --mode=deep --models=all</div>
            <AnimatePresence>
              {logs.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ color: log.color, fontFamily: 'JetBrains Mono, monospace' }}
                >
                  {log.msg}
                </motion.div>
              ))}
            </AnimatePresence>
            {!done && (
              <div className="flex items-center gap-2 text-muted">
                <Loader size={12} className="animate-spin" />
                <span>Processing...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {done && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-success font-mono text-sm">Analysis complete · Redirecting to results...</div>
        </motion.div>
      )}
    </div>
  )
}
