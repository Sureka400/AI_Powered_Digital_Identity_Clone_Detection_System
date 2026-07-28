import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Upload, Zap } from 'lucide-react'
import api from "../api/api";
type Page = 'landing' | 'dashboard' | 'investigation' | 'ai-room' | 'results' | 'explainable' | 'recommendations' | 'profile-diff' | 'threat-intel' | 'history' | 'settings'

interface ProfileData {
  image: string | null
  username: string
  displayName: string
  bio: string
  followers: string
  following: string
  posts: string
  isPrivate: boolean
  isBusiness: boolean
  isChannel: boolean
  hasGuides: boolean
  externalUrl: string
  recentlyJoined: boolean
}

const defaultProfile = (): ProfileData => ({
  image: null,
  username: '',
  displayName: '',
  bio: '',
  followers: '',
  following: '',
  posts: '',
  isPrivate: false,
  isBusiness: false,
  isChannel: false,
  hasGuides: false,
  externalUrl: '',
  recentlyJoined: false,
})

function calcScore(p: ProfileData) {
  let score = 0
  if (p.username) score += 15
  if (p.displayName) score += 15
  if (p.bio) score += 20
  if (p.followers) score += 10
  if (p.following) score += 10
  if (p.posts) score += 10
  if (p.externalUrl) score += 10
  if (p.image) score += 10
  return Math.min(score, 100)
}

function autoFields(p: ProfileData) {
  return {
    usernameLength: p.username.length,
    descLength: p.bio.length,
    fullNameLength: p.displayName.length,
    usernameHasNumbers: /\d/.test(p.username),
    fullNameHasNumbers: /\d/.test(p.displayName),
    nameEqualsUsername: p.username.toLowerCase() === p.displayName.toLowerCase().replace(/\s/g, ''),
  }
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <label className="toggle-switch">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="toggle-slider" />
      </label>
      <span className="text-sm text-muted">{label}</span>
    </label>
  )
}

function ProfileCard({ title, color, data, onChange }: {
  title: string
  color: string
  data: ProfileData
  onChange: (d: ProfileData) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const score = calcScore(data)
  const auto = autoFields(data)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (ev) => onChange({ ...data, image: ev.target?.result as string })
      reader.readAsDataURL(file)
    }
  }, [data, onChange])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => onChange({ ...data, image: ev.target?.result as string })
      reader.readAsDataURL(file)
    }
  }

  const field = (key: keyof ProfileData, placeholder: string, type: 'text' | 'number' = 'text') => (
    <input
      type={type}
      placeholder={placeholder}
      value={data[key] as string}
      onChange={(e) => onChange({ ...data, [key]: e.target.value })}
      className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.06)',
        color: '#F8FAFC',
        fontFamily: 'Inter, sans-serif',
      }}
      onFocus={(e) => (e.target.style.borderColor = color + '60')}
      onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
    />
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl overflow-hidden"
      style={{ border: `1px solid ${color}25` }}
    >
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-2" style={{ background: `${color}08`, borderBottom: `1px solid ${color}15` }}>
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: color }} />
        <h3 className="font-bold text-sm" style={{ fontFamily: 'Space Grotesk', color }}>{title}</h3>
        <div className="ml-auto flex items-center gap-2">
          <div
            className="text-xs font-mono px-2 py-1 rounded-lg"
            style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
          >
            Score: {score}/100
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Upload area */}
        <div
          className="relative rounded-xl overflow-hidden cursor-pointer transition-all"
          style={{
            border: `2px dashed ${dragging ? color : color + '30'}`,
            background: dragging ? `${color}08` : 'rgba(255,255,255,0.02)',
            minHeight: 160,
          }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          {data.image ? (
            <img src={data.image} alt="Profile" className="w-full h-40 object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                <Upload size={20} color={color} />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium" style={{ color }}>Drop image here</div>
                <div className="text-xs text-muted mt-0.5">or click to browse</div>
              </div>
            </div>
          )}
        </div>

        {/* Profile fields */}
        <div className="space-y-3">
          {field('username', 'Username (e.g. john_doe)')}
          {field('displayName', 'Display Name')}
          <textarea
            placeholder="Biography..."
            value={data.bio}
            onChange={(e) => onChange({ ...data, bio: e.target.value })}
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all resize-none"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#F8FAFC',
              fontFamily: 'Inter, sans-serif',
            }}
          />
          <div className="grid grid-cols-3 gap-2">
            {field('followers', 'Followers', 'number')}
            {field('following', 'Following', 'number')}
            {field('posts', 'Posts', 'number')}
          </div>
          {field('externalUrl', 'External URL')}
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-2 gap-3">
          <Toggle checked={data.isPrivate} onChange={(v) => onChange({ ...data, isPrivate: v })} label="Private" />
          <Toggle checked={data.isBusiness} onChange={(v) => onChange({ ...data, isBusiness: v })} label="Business" />
          <Toggle checked={data.isChannel} onChange={(v) => onChange({ ...data, isChannel: v })} label="Channel" />
          <Toggle checked={data.hasGuides} onChange={(v) => onChange({ ...data, hasGuides: v })} label="Guides" />
          <Toggle checked={data.recentlyJoined} onChange={(v) => onChange({ ...data, recentlyJoined: v })} label="Recently Joined" />
        </div>

        {/* Auto-calculated */}
        <div className="rounded-xl p-4 space-y-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="text-xs font-mono text-muted mb-2" style={{ letterSpacing: '0.1em' }}>AUTO-CALCULATED FEATURES</div>
          {[
            { label: 'Username Length', value: auto.usernameLength },
            { label: 'Bio Length', value: auto.descLength },
            { label: 'Display Name Length', value: auto.fullNameLength },
            { label: 'Username Has Numbers', value: auto.usernameHasNumbers ? 'Yes' : 'No' },
            { label: 'Name Has Numbers', value: auto.fullNameHasNumbers ? 'Yes' : 'No' },
            { label: 'Name = Username', value: auto.nameEqualsUsername ? 'Yes' : 'No' },
          ].map((f) => (
            <div key={f.label} className="flex justify-between text-xs">
              <span className="text-muted">{f.label}</span>
              <span className="font-mono" style={{ color }}>{f.value}</span>
            </div>
          ))}
        </div>

        {/* Completion bar */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted">Profile Completion</span>
            <span className="font-mono" style={{ color }}>{score}%</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.5 }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${color}80, ${color})`, boxShadow: `0 0 8px ${color}50` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

interface NewInvestigationProps {
  onNavigate: (page: Page, data?: unknown) => void
}

export default function NewInvestigation({ onNavigate }: NewInvestigationProps) {
  const [original, setOriginal] = useState<ProfileData>(defaultProfile())
  const [clone, setClone] = useState<ProfileData>(defaultProfile())

  const canAnalyze = original.username && clone.username

  const handleAnalyze = async () => {

  if (!canAnalyze) return;

  try {

    const response = await api.post("/analyze/", {
      original: original,
      clone: clone
    });

    console.log(response.data);

    onNavigate(
      "results",
      response.data
    );

  } catch(error) {

    console.error(
      "API Error:",
      error
    );

  }
};
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(180deg, #00F5FF, #7B61FF)' }} />
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk' }}>New Investigation</h1>
        </div>
        <p className="text-sm text-muted ml-4">Enter both profile details to begin identity clone analysis</p>
      </motion.div>

      {/* Profile cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
        <ProfileCard title="ORIGINAL PROFILE" color="#00F5FF" data={original} onChange={setOriginal} />

        {/* VS divider */}
        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs"
            style={{
              background: 'linear-gradient(135deg, rgba(0,245,255,0.2), rgba(123,97,255,0.2))',
              border: '2px solid rgba(0,245,255,0.4)',
              fontFamily: 'Space Grotesk',
              color: '#F8FAFC',
              boxShadow: '0 0 20px rgba(0,245,255,0.3)',
            }}
          >
            VS
          </div>
        </div>

        <ProfileCard title="SUSPECTED CLONE" color="#7B61FF" data={clone} onChange={setClone} />
      </div>

      {/* Analyze button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center pt-4"
      >
        <motion.button
          whileHover={canAnalyze ? { scale: 1.04, boxShadow: '0 0 60px rgba(0,245,255,0.5)' } : {}}
          whileTap={canAnalyze ? { scale: 0.97 } : {}}
          onClick={handleAnalyze}
          className="relative px-16 py-5 rounded-2xl text-lg font-bold"
          style={{
            fontFamily: 'Space Grotesk',
            letterSpacing: '0.08em',
            background: canAnalyze
              ? 'linear-gradient(135deg, rgba(0,245,255,0.15), rgba(123,97,255,0.15))'
              : 'rgba(255,255,255,0.04)',
            border: canAnalyze ? '1px solid rgba(0,245,255,0.5)' : '1px solid rgba(255,255,255,0.08)',
            color: canAnalyze ? '#00F5FF' : '#94A3B8',
            cursor: canAnalyze ? 'pointer' : 'not-allowed',
          }}
        >
          {/* Animated border */}
          {canAnalyze && (
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, #00F5FF, #7B61FF, #00F5FF)',
                backgroundSize: '200% 200%',
                animation: 'borderRotate 2s linear infinite',
                padding: '1px',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'destination-out',
                maskComposite: 'exclude',
              }}
            />
          )}
          <div className="flex items-center gap-3">
            <Zap size={22} />
            ANALYZE IDENTITY
          </div>
        </motion.button>
      </motion.div>

      {!canAnalyze && (
        <p className="text-center text-xs text-muted">Fill in at least a username for both profiles to proceed</p>
      )}
    </div>
  )
}
