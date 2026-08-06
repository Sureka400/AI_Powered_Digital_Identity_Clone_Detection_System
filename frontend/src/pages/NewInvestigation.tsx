import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Upload, Zap, Loader, AlertCircle } from 'lucide-react'
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

function dataURLtoFile(dataURL: string, filename: string): File {
  const arr = dataURL.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

// ---------- Local fallback computations (used when backend is unavailable) ----------

// Levenshtein-based username similarity (0-100), mirrors rapidfuzz.fuzz.ratio
function localUsernameSimilarity(u1: string, u2: string): number {
  const s1 = u1.toLowerCase()
  const s2 = u2.toLowerCase()
  if (s1 === s2) return 100
  if (!s1.length || !s2.length) return 0
  const dist = levenshtein(s1, s2)
  const maxLen = Math.max(s1.length, s2.length)
  return Math.round((1 - dist / maxLen) * 100 * 100) / 100
}

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    }
  }
  return dp[m][n]
}

// Simple token-overlap bio similarity (0-100), approximates cosine similarity
function localBioSimilarity(b1: string, b2: string): number {
  if (!b1.trim() && !b2.trim()) return 100
  if (!b1.trim() || !b2.trim()) return 0
  const tokenize = (s: string) =>
    s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
  const t1 = new Set(tokenize(b1))
  const t2 = new Set(tokenize(b2))
  const intersection = [...t1].filter((w) => t2.has(w)).length
  const union = new Set([...t1, ...t2]).size
  return Math.round((intersection / union) * 100 * 100) / 100
}

// Heuristic fake-profile prediction mirroring the trained model's feature set
function localProfilePredict(p: ProfileData) {
  let fakeScore = 0
  if (!p.image) fakeScore += 15
  if (p.username.length <= 4) fakeScore += 10
  if (/\d/.test(p.username)) fakeScore += 10
  if (p.displayName.length === 0) fakeScore += 10
  if (p.bio.length < 10) fakeScore += 15
  if (!p.externalUrl) fakeScore += 10
  if (p.recentlyJoined) fakeScore += 15
  const followers = Number(p.followers) || 0
  const following = Number(p.following) || 0
  if (followers < 50) fakeScore += 10
  if (following > followers * 3 && followers > 0) fakeScore += 5

  const prediction = fakeScore >= 50 ? 1 : 0
  const fake_probability = Math.min(fakeScore * 1.2, 99)
  return {
    prediction,
    result: prediction === 1 ? 'Fake' : 'Real',
    confidence: Math.round(Math.max(fakeScore, 100 - fakeScore) * 100) / 100,
    fake_probability: Math.round(fake_probability * 100) / 100,
  }
}

// Heuristic spammer prediction
function localSpammerPredict(p: ProfileData) {
  let spamScore = 0
  const followers = Number(p.followers) || 0
  const following = Number(p.following) || 0
  if (following > followers * 3 && followers > 0) spamScore += 25
  if (followers < 50) spamScore += 20
  if (/\d/.test(p.username)) spamScore += 15
  if (/\d/.test(p.displayName)) spamScore += 10
  if (p.recentlyJoined) spamScore += 15
  if (p.isBusiness) spamScore += 10
  if (p.hasGuides) spamScore += 5

  const prediction = spamScore >= 50 ? 1 : 0
  const spammer_probability = Math.min(spamScore * 1.3, 99)
  return {
    prediction,
    result: prediction === 1 ? 'Fake' : 'Real',
    confidence: Math.round(Math.max(spamScore, 100 - spamScore) * 100) / 100,
    spammer_probability: Math.round(spammer_probability * 100) / 100,
  }
}

// Local trust score mirroring backend/utils/trust_score.py
function localTrustScore(
  profileFake: boolean,
  spammer: boolean,
  usernameSim: number,
  bioSim: number,
  faceSim: number,
  faceVerified: boolean,
) {
  let score = 100
  if (profileFake) score -= 20
  if (spammer) score -= 5
  if (usernameSim > 90) score -= 8
  else if (usernameSim > 75) score -= 5
  else if (usernameSim > 60) score -= 3
  if (bioSim > 90) score -= 8
  else if (bioSim > 75) score -= 5
  else if (bioSim > 60) score -= 3
  if (faceSim > 90) score -= 30
  else if (faceSim > 80) score -= 18
  else if (faceSim > 70) score -= 10
  if (faceVerified) score -= 15
  score = Math.max(score, 0)

  let status = 'Genuine'
  let risk = 'Low'
  if (score < 50) {
    status = 'Clone Detected'
    risk = 'High'
  } else if (score < 75) {
    status = 'Suspicious'
    risk = 'Moderate'
  }

  return { trust_score: score, status, risk }
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
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canAnalyze = original.username && clone.username

  const handleAnalyze = async () => {
    if (!canAnalyze || isAnalyzing) return;

    setIsAnalyzing(true);
    setError(null);

    // Results accumulators with local fallback defaults
    let profileData: any = localProfilePredict(clone);
    let spammerData: any = localSpammerPredict(clone);
    let usernameData: any = {
      username_similarity: localUsernameSimilarity(original.username, clone.username),
      match: false,
    };
    let bioData: any = {
      bio_similarity: localBioSimilarity(original.bio, clone.bio),
      match: false,
    };
    let faceData: { verified: boolean; distance: number; threshold: number; similarity?: number; model?: string } | null = null;
    let analyzeData: any = localTrustScore(
      profileData.prediction === 1,
      spammerData.prediction === 1,
      usernameData.username_similarity,
      bioData.bio_similarity,
      0,
      false,
    );

    const failures: string[] = [];

    // 1. Fake Profile prediction (on suspected clone)
    try {
      const profileResponse = await api.post("/profile/predict", {
        profile_pic: clone.image ? 1 : 0,
        username_length: clone.username.length,
        fullname_words: clone.displayName.split(" ").filter(Boolean).length,
        fullname_length: clone.displayName.length,
        name_equals_username:
          clone.username.toLowerCase() ===
          clone.displayName.toLowerCase().replace(/\s/g, "")
            ? 1
            : 0,
        description_length: clone.bio.length,
        external_url: clone.externalUrl ? 1 : 0,
        private: clone.isPrivate ? 1 : 0,
        posts: Number(clone.posts) || 0,
        followers: Number(clone.followers) || 0,
        following: Number(clone.following) || 0,
      });
      profileData = profileResponse.data;
    } catch (e) {
      console.error("Profile API failed, using local fallback:", e);
      failures.push("Fake Profile model");
    }

    // 2. Spammer prediction (on suspected clone)
    try {
      const spammerResponse = await api.post("/spammer/predict", {
        edge_followed_by: Number(clone.followers) || 0,
        edge_follow: Number(clone.following) || 0,
        username_length: clone.username.length,
        username_has_number: /\d/.test(clone.username) ? 1 : 0,
        full_name_has_number: /\d/.test(clone.displayName) ? 1 : 0,
        full_name_length: clone.displayName.length,
        is_private: clone.isPrivate ? 1 : 0,
        is_joined_recently: clone.recentlyJoined ? 1 : 0,
        has_channel: clone.isChannel ? 1 : 0,
        is_business_account: clone.isBusiness ? 1 : 0,
        has_guides: clone.hasGuides ? 1 : 0,
        has_external_url: clone.externalUrl ? 1 : 0,
      });
      spammerData = spammerResponse.data;
    } catch (e) {
      console.error("Spammer API failed, using local fallback:", e);
      failures.push("Spammer model");
    }

    // 3. Username similarity
    try {
      const usernameResponse = await api.post("/username/similarity", {
        username1: original.username,
        username2: clone.username,
      });
      usernameData = usernameResponse.data;
    } catch (e) {
      console.error("Username API failed, using local fallback:", e);
      failures.push("Username similarity");
    }

    // 4. Bio similarity
    try {
      const bioResponse = await api.post("/bio/similarity", {
        bio1: original.bio,
        bio2: clone.bio,
      });
      bioData = bioResponse.data;
    } catch (e) {
      console.error("Bio API failed, using local fallback:", e);
      failures.push("Bio similarity");
    }

    // 5. Face verification (only if both images present)
    if (original.image && clone.image) {
      try {
        const formData = new FormData();
        formData.append("image1", dataURLtoFile(original.image, "original.jpg"));
        formData.append("image2", dataURLtoFile(clone.image, "clone.jpg"));
        // NOTE: Do NOT set Content-Type manually — axios must auto-generate
        // the multipart boundary string. Setting it manually breaks the upload.
        const faceResponse = await api.post("/face/verify", formData, {
          timeout: 120000,
        });
        faceData = faceResponse.data;
      } catch (e) {
        console.error("Face API failed, skipping face verification:", e);
        failures.push("Face verification");
      }
    }

    // 6. Trust score analysis (aggregate) — try backend, fallback to local
    const faceSim = faceData
      ? Math.round((1 - faceData.distance / faceData.threshold) * 100)
      : 0;
    try {
      const analyzeResponse = await api.post("/analyze/", {
        profile_fake: profileData.prediction === 1,
        spammer: spammerData.prediction === 1,
        username_similarity: usernameData.username_similarity,
        bio_similarity: bioData.bio_similarity,
        face_similarity: faceSim,
        face_verified: faceData ? faceData.verified : false,
        original_username: original.username,
        clone_username: clone.username,
      });
      analyzeData = analyzeResponse.data;
    } catch (e) {
      console.error("Analyze API failed, using local fallback:", e);
      failures.push("Trust score");
    }

    // Always navigate to AI room with whatever data we have
    onNavigate("ai-room", {
      profile: profileData,
      spammer: spammerData,
      username: usernameData,
      bio: bioData,
      face: faceData,
      analyze: analyzeData,
      original,
      clone,
      warnings: failures.length > 0 ? failures : undefined,
    });

    setIsAnalyzing(false);
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
        className="flex flex-col items-center pt-4 gap-3"
      >
        <motion.button
          whileHover={canAnalyze && !isAnalyzing ? { scale: 1.04, boxShadow: '0 0 60px rgba(0,245,255,0.5)' } : {}}
          whileTap={canAnalyze && !isAnalyzing ? { scale: 0.97 } : {}}
          onClick={handleAnalyze}
          disabled={!canAnalyze || isAnalyzing}
          className="relative px-16 py-5 rounded-2xl text-lg font-bold"
          style={{
            fontFamily: 'Space Grotesk',
            letterSpacing: '0.08em',
            background: isAnalyzing
              ? 'linear-gradient(135deg, rgba(0,245,255,0.25), rgba(123,97,255,0.25))'
              : canAnalyze
                ? 'linear-gradient(135deg, rgba(0,245,255,0.15), rgba(123,97,255,0.15))'
                : 'rgba(255,255,255,0.04)',
            border: canAnalyze ? '1px solid rgba(0,245,255,0.5)' : '1px solid rgba(255,255,255,0.08)',
            color: canAnalyze ? '#00F5FF' : '#94A3B8',
            cursor: canAnalyze && !isAnalyzing ? 'pointer' : 'not-allowed',
            opacity: isAnalyzing ? 0.85 : 1,
          }}
        >
          {/* Animated border */}
          {canAnalyze && !isAnalyzing && (
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
            {isAnalyzing ? (
              <>
                <Loader size={22} className="animate-spin" />
                ANALYZING...
              </>
            ) : (
              <>
                <Zap size={22} />
                ANALYZE IDENTITY
              </>
            )}
          </div>
        </motion.button>

        {isAnalyzing && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-cyan font-mono"
          >
            Running AI pipeline · analyzing profile data...
          </motion.p>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg"
            style={{ background: 'rgba(255,61,113,0.08)', border: '1px solid rgba(255,61,113,0.3)' }}
          >
            <AlertCircle size={14} color="#FF3D71" />
            <span className="text-xs text-danger">{error}</span>
          </motion.div>
        )}

        {!canAnalyze && !isAnalyzing && (
          <p className="text-center text-xs text-muted">Fill in at least a username for both profiles to proceed</p>
        )}
      </motion.div>
    </div>
  )
}
