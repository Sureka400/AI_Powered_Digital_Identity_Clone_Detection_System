import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Play, ChevronRight, Shield, Eye, Zap, Globe } from 'lucide-react'

type Page = 'landing' | 'dashboard' | 'investigation' | 'ai-room' | 'results' | 'explainable' | 'recommendations' | 'profile-diff' | 'threat-intel' | 'history'

interface LandingProps {
  onNavigate: (page: Page) => void
}

function AnimatedCounter({ target, suffix = '', duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const start = Date.now()
        const tick = () => {
          const elapsed = Date.now() - start
          const progress = Math.min(elapsed / duration, 1)
          const ease = 1 - Math.pow(1 - progress, 3)
          setCount(Math.round(ease * target))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [target, duration])

  return <div ref={ref} className="counter">{count.toLocaleString()}{suffix}</div>
}

function EarthCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = 500
    canvas.height = 500

    const cx = 250
    const cy = 250
    const r = 180

    let angle = 0
    const networkNodes: Array<{ lat: number; lng: number; active: boolean; pulse: number }> = Array.from({ length: 30 }, () => ({
      lat: (Math.random() - 0.5) * Math.PI,
      lng: Math.random() * Math.PI * 2,
      active: Math.random() > 0.5,
      pulse: Math.random() * Math.PI * 2,
    }))

    const project = (lat: number, lng: number, rot: number) => {
      const x = r * Math.cos(lat) * Math.sin(lng + rot)
      const y = r * Math.sin(lat)
      const z = r * Math.cos(lat) * Math.cos(lng + rot)
      return { x: cx + x, y: cy - y, z }
    }

    const draw = () => {
      ctx.clearRect(0, 0, 500, 500)

      // Globe glow
      const grd = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 1.5)
      grd.addColorStop(0, 'rgba(0,245,255,0.03)')
      grd.addColorStop(1, 'transparent')
      ctx.fillStyle = grd
      ctx.fillRect(0, 0, 500, 500)

      // Globe circle
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(0,245,255,0.15)'
      ctx.lineWidth = 1
      ctx.stroke()

      // Latitude lines
      for (let lat = -75; lat <= 75; lat += 25) {
        const latR = (lat * Math.PI) / 180
        ctx.beginPath()
        let first = true
        for (let lng = 0; lng <= 360; lng += 5) {
          const lngR = (lng * Math.PI) / 180
          const pt = project(latR, lngR, angle)
          if (pt.z > 0) {
            if (first) { ctx.moveTo(pt.x, pt.y); first = false }
            else ctx.lineTo(pt.x, pt.y)
          } else first = true
        }
        ctx.strokeStyle = 'rgba(0,245,255,0.06)'
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // Longitude lines
      for (let lng = 0; lng < 360; lng += 30) {
        const lngR = (lng * Math.PI) / 180
        ctx.beginPath()
        let first = true
        for (let lat = -90; lat <= 90; lat += 5) {
          const latR = (lat * Math.PI) / 180
          const pt = project(latR, lngR, angle)
          if (pt.z > 0) {
            if (first) { ctx.moveTo(pt.x, pt.y); first = false }
            else ctx.lineTo(pt.x, pt.y)
          } else first = true
        }
        ctx.strokeStyle = 'rgba(123,97,255,0.06)'
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // Network nodes
      networkNodes.forEach((node, i) => {
        const pt = project(node.lat, node.lng, angle)
        if (pt.z > 0) {
          node.pulse += 0.05
          const pulseSize = Math.sin(node.pulse) * 4 + 5
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2)
          ctx.fillStyle = node.active ? '#00F5FF' : '#7B61FF'
          ctx.globalAlpha = 0.8
          ctx.fill()

          if (node.active) {
            ctx.beginPath()
            ctx.arc(pt.x, pt.y, pulseSize, 0, Math.PI * 2)
            ctx.strokeStyle = '#00F5FF'
            ctx.globalAlpha = 0.2 * (1 - Math.abs(Math.sin(node.pulse)))
            ctx.lineWidth = 0.5
            ctx.stroke()
          }

          // Connections
          for (let j = i + 1; j < networkNodes.length; j++) {
            const other = networkNodes[j]
            const pt2 = project(other.lat, other.lng, angle)
            if (pt2.z > 0) {
              const dx = pt.x - pt2.x
              const dy = pt.y - pt2.y
              const dist = Math.sqrt(dx * dx + dy * dy)
              if (dist < 120) {
                ctx.beginPath()
                ctx.moveTo(pt.x, pt.y)
                ctx.lineTo(pt2.x, pt2.y)
                ctx.strokeStyle = '#00F5FF'
                ctx.globalAlpha = (1 - dist / 120) * 0.12
                ctx.lineWidth = 0.5
                ctx.stroke()
              }
            }
          }
        }
        ctx.globalAlpha = 1
      })

      angle += 0.003
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
}

const stats = [
  { label: 'Profiles Scanned', value: 2847391, suffix: '', icon: Eye },
  { label: 'Detection Accuracy', value: 98, suffix: '%', icon: Shield },
  { label: "Today's Scans", value: 12483, suffix: '', icon: Zap },
  { label: 'Threats Prevented', value: 4291, suffix: '', icon: Globe },
]

export default function Landing({ onNavigate }: LandingProps) {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 400], [0, 100])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden cyber-grid">
        {/* Aurora */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,245,255,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 50%, rgba(123,97,255,0.06) 0%, transparent 50%)',
          }}
        />

        {/* Earth */}
        <motion.div
          style={{ y, opacity }}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-[560px] h-[560px] opacity-80"
        >
          <EarthCanvas />
        </motion.div>

        {/* Hero content */}
        <div className="relative z-10 max-w-3xl px-8 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono mb-6"
              style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.2)', color: '#00F5FF', letterSpacing: '0.1em' }}
            >
              <div className="status-dot status-online" />
              AI SYSTEM OPERATIONAL · v3.8.1
            </div>

            <h1
              className="text-5xl lg:text-7xl font-bold leading-tight mb-6"
              style={{ fontFamily: 'Space Grotesk', letterSpacing: '-0.02em' }}
            >
              <span className="text-white">AI Powered</span>
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #00F5FF, #7B61FF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Digital Identity
              </span>
              <br />
              <span className="text-white">Intelligence</span>
            </h1>

            <p className="text-lg mb-8 leading-relaxed max-w-xl" style={{ color: '#94A3B8' }}>
              Detect cloned identities using Artificial Intelligence, Deep Learning and Explainable AI.
              Enterprise-grade protection against identity fraud at scale.
            </p>

            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate('investigation')}
                className="btn-liquid px-8 py-4 rounded-xl flex items-center gap-2 text-sm font-bold"
                style={{ fontFamily: 'Space Grotesk', letterSpacing: '0.04em' }}
              >
                <Play size={16} />
                Start Investigation
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate('dashboard')}
                className="btn-holographic px-8 py-4 rounded-xl flex items-center gap-2 text-sm"
              >
                View Dashboard
                <ChevronRight size={16} />
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Scan line effect */}
        <div
          className="absolute left-0 right-0 h-px pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.4), transparent)',
            animation: 'scan-line 4s linear infinite',
          }}
        />
      </section>

      {/* Stats */}
      <section className="py-20 px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03, y: -4 }}
                className="glass gradient-border rounded-2xl p-6 text-center"
              >
                <div className="flex justify-center mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(0,245,255,0.1)' }}
                  >
                    <stat.icon size={18} color="#00F5FF" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-cyan mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs text-muted">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk' }}>
              Powered by{' '}
              <span style={{ background: 'linear-gradient(135deg,#00F5FF,#7B61FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Advanced AI
              </span>
            </h2>
            <p className="text-muted max-w-xl mx-auto">Military-grade identity verification using multi-modal deep learning models with explainable outputs.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Eye, title: 'Face Verification', desc: 'DeepFace neural network compares facial geometry across profiles with sub-millisecond precision.', color: '#00F5FF' },
              { icon: Shield, title: 'Clone Detection', desc: 'Multi-layer AI models analyze username patterns, biography content, and behavioral signals.', color: '#7B61FF' },
              { icon: Zap, title: 'Explainable AI', desc: 'Every decision backed by feature importance scores, model confidence, and human-readable explanations.', color: '#00FFA3' },
            ].map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="glass rounded-2xl p-8 animate-float"
                style={{ animationDelay: `${i * 1.2}s`, border: `1px solid ${feat.color}18` }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `${feat.color}15`, border: `1px solid ${feat.color}30` }}
                >
                  <feat.icon size={22} color={feat.color} />
                </div>
                <h3 className="text-lg font-bold mb-3" style={{ fontFamily: 'Space Grotesk', color: feat.color }}>{feat.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
