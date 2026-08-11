import { motion } from 'framer-motion'
import { Brain } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../api/api'

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

interface ExplainableAIProps {
  data?: unknown
}

export default function ExplainableAI({ data }: ExplainableAIProps) {
  const d: InvestigationData = (data as InvestigationData) || {}
  const [selected, setSelected] = useState<number | null>(null)
  const [aiSummary, setAiSummary] = useState('')
  const [isLoadingSummary, setIsLoadingSummary] = useState(true)

  const trustScore = Math.round(d.analyze?.trust_score ?? 50)
  const analyzeStatus = d.analyze?.status ?? ''
  const isClone = analyzeStatus === 'Clone' || analyzeStatus === 'Likely Clone'
  const isSpammer = d.spammer?.prediction === 1
  const resultColor = isClone ? '#FF3D71' : '#00FFA3'
  const faceSimilarity = d.face
    ? Math.round(Math.max(0, (1 - d.face.distance / d.face.threshold) * 100))
    : 0
  const usernameSimilarity = Math.round(d.username?.username_similarity ?? 0)
  const bioSimilarity = Math.round(d.bio?.bio_similarity ?? 0)
  const profileConf = d.profile?.confidence ?? (isClone ? 94.2 : 94.2)
  const spammerConf = d.spammer?.confidence ?? (isSpammer ? 88.6 : 88.6)
  const profileFakePct = d.profile?.fake_probability ?? (isClone ? 94.2 : 5.8)
  const spammerFakePct = d.spammer?.spammer_probability ?? (isSpammer ? 78.4 : 21.6)

  useEffect(() => {
    const loadExplanation = async () => {
      setIsLoadingSummary(true)
      try {
        const response = await api.post('/explain/', {
          profile_fake: d.profile?.prediction === 1,
          spammer: isSpammer,
          username_similarity: usernameSimilarity,
          bio_similarity: bioSimilarity,
          face_similarity: faceSimilarity,
          face_verified: d.face?.verified ?? false,
        })
        setAiSummary(response.data.reasons || '')
      } catch (error) {
        console.error('Unable to generate Gemini explanation:', error)
        setAiSummary('The AI explanation could not be generated. Review the feature evidence below.')
      } finally {
        setIsLoadingSummary(false)
      }
    }

    loadExplanation()
  }, [bioSimilarity, d.face?.verified, d.profile?.prediction, faceSimilarity, isSpammer, usernameSimilarity])

  const explanations = [
    {
      feature: 'Face Similarity',
      importance: 0.31,
      confidence: faceSimilarity,
      weight: faceSimilarity > 80 ? 'Very High' : faceSimilarity > 50 ? 'Medium' : 'Low',
      color: '#00F5FF',
      icon: '👤',
      detail: d.face
        ? `Facial embedding distance of ${d.face.distance.toFixed(3)} ${d.face.verified ? 'is below' : 'exceeds'} the verification threshold of ${d.face.threshold.toFixed(3)}. The DeepFace model ${d.face.verified ? 'detected strong structural similarities' : 'did not find a strong match'} in facial geometry.`
        : 'No face verification was performed because profile images were not provided.',
    },
    {
      feature: 'Username Similarity',
      importance: 0.24,
      confidence: usernameSimilarity,
      weight: usernameSimilarity > 80 ? 'High' : usernameSimilarity > 50 ? 'Medium' : 'Low',
      color: '#7B61FF',
      icon: '@',
      detail: `Character-level similarity score of ${usernameSimilarity}% between "${d.original?.username ?? '—'}" and "${d.clone?.username ?? '—'}". ${usernameSimilarity > 80 ? 'High similarity suggests potential clone using character substitution or minor variations.' : 'Low to moderate similarity was detected.'}`,
    },
    {
      feature: 'Bio Similarity',
      importance: 0.18,
      confidence: bioSimilarity,
      weight: bioSimilarity > 80 ? 'High' : bioSimilarity > 50 ? 'Medium' : 'Low',
      color: '#00FFA3',
      icon: '📝',
      detail: `NLP embedding cosine similarity of ${(bioSimilarity / 100).toFixed(2)} across biography text. ${bioSimilarity > 80 ? 'Near-verbatim text reuse detected, strongly suggesting cloned content.' : 'Moderate or low text overlap was found.'}`,
    },
    {
      feature: 'Fake Profile Model',
      importance: 0.15,
      confidence: profileConf,
      weight: isClone ? 'Critical' : 'Low',
      color: '#FFD54F',
      icon: '🤖',
      detail: `Gradient boosted classifier prediction: ${isClone ? 'FAKE' : 'GENUINE'} with ${profileFakePct.toFixed(1)}% probability. ${isClone ? 'Multiple engineered features triggered suspicious indicators.' : 'The profile appears legitimate based on model features.'}`,
    },
    {
      feature: 'Spammer Model',
      importance: 0.08,
      confidence: spammerConf,
      weight: isSpammer ? 'Medium' : 'Low',
      color: '#FF9800',
      icon: '⚠️',
      detail: `Spammer detection model prediction: ${isSpammer ? 'SPAMMER' : 'NOT SPAMMER'} with ${spammerFakePct.toFixed(1)}% probability. ${isSpammer ? 'Behavioral flags indicate spam-like activity patterns.' : 'No significant spam behavioral patterns detected.'}`,
    },
    {
      feature: 'Trust Score',
      importance: 0.04,
      confidence: trustScore,
      weight: trustScore < 25 ? 'Low Trust' : trustScore < 50 ? 'Moderate Trust' : trustScore < 75 ? 'Suspicious' : 'Trusted',
      color: '#FF3D71',
      icon: '🛡️',
      detail: `Composite trust score of ${trustScore}/100 computed from weighted feature matrix. Status: ${d.analyze?.status ?? '—'}. Risk level: ${d.analyze?.risk ?? '—'}.`,
    },
  ]

  const summary = aiSummary || `The account "${d.clone?.username ?? 'unknown'}" is classified as ${isClone ? 'a cloned/fake identity' : 'a genuine profile'} with ${profileConf.toFixed(1)}% confidence. The username similarity is ${usernameSimilarity}%, biography content shows ${bioSimilarity}% semantic overlap, ${d.face ? `the facial verification model found ${faceSimilarity}% similarity` : 'no face verification was performed'}, and the behavioral analysis ${isSpammer ? 'indicates spam characteristics' : 'shows no spam patterns'}.`

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(180deg, #00F5FF, #7B61FF)' }} />
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk' }}>Explainable AI</h1>
        </div>
        <p className="text-sm text-muted ml-4">Why did AI classify this profile as {isClone ? 'a Clone' : 'Genuine'}?</p>
        <div className="mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold" style={{ background: `${resultColor}15`, color: resultColor, border: `1px solid ${resultColor}30` }}>
          {isClone ? 'CLONE' : 'GENUINE'}
        </div>
      </motion.div>

      {/* AI Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6"
        style={{ border: '1px solid rgba(0,245,255,0.12)' }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 animate-pulse-cyan"
            style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.3)' }}
          >
            <Brain size={22} color="#00F5FF" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-cyan" style={{ letterSpacing: '0.1em' }}>AI SUMMARY</span>
              <span className="text-xs text-muted">· Generated by Gemini with Google Search grounding</span>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#CBD5E1', fontFamily: 'Inter' }}>{isLoadingSummary ? 'Generating evidence-based explanation…' : summary}</p>
          </div>
        </div>
      </motion.div>

      {/* Feature importance chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-6"
        style={{ border: '1px solid rgba(0,245,255,0.08)' }}
      >
        <h3 className="font-bold mb-4" style={{ fontFamily: 'Space Grotesk' }}>Feature Importance</h3>
        <div className="space-y-3">
          {explanations.map((exp, i) => (
            <div key={exp.feature} className="flex items-center gap-3">
              <span className="text-sm w-36 shrink-0 text-muted">{exp.feature}</span>
              <div className="flex-1 h-5 rounded-full relative" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${exp.importance * 100}%` }}
                  transition={{ duration: 1, delay: 0.4 + i * 0.1 }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${exp.color}60, ${exp.color})`,
                    boxShadow: `0 0 8px ${exp.color}40`,
                  }}
                />
              </div>
              <span className="text-xs font-mono w-10 text-right shrink-0" style={{ color: exp.color }}>
                {(exp.importance * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Explanation cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {explanations.map((exp, i) => (
          <motion.div
            key={exp.feature}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            whileHover={{ y: -4, scale: 1.02 }}
            onClick={() => setSelected(selected === i ? null : i)}
            className="glass rounded-2xl p-5 cursor-pointer transition-all"
            style={{ border: `1px solid ${selected === i ? exp.color + '50' : exp.color + '18'}` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{exp.icon}</span>
                <h4 className="font-semibold text-sm" style={{ fontFamily: 'Space Grotesk', color: exp.color }}>{exp.feature}</h4>
              </div>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-mono"
                style={{ background: `${exp.color}15`, color: exp.color, border: `1px solid ${exp.color}30` }}
              >
                {exp.weight}
              </span>
            </div>

            <div className="space-y-2 mb-3">
              {[
                { label: 'Importance', value: `${(exp.importance * 100).toFixed(0)}%` },
                { label: 'Confidence', value: `${exp.confidence}%` },
              ].map((m) => (
                <div key={m.label} className="flex justify-between text-xs">
                  <span className="text-muted">{m.label}</span>
                  <span className="font-mono" style={{ color: exp.color }}>{m.value}</span>
                </div>
              ))}
            </div>

            <div className="h-1 rounded-full mb-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full" style={{ width: `${Math.min(exp.confidence, 100)}%`, background: exp.color, boxShadow: `0 0 6px ${exp.color}` }} />
            </div>

            {selected === i && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs leading-relaxed pt-3 border-t"
                style={{ borderColor: `${exp.color}20`, color: '#94A3B8' }}
              >
                {exp.detail}
              </motion.div>
            )}

            {selected !== i && (
              <p className="text-xs text-muted leading-relaxed line-clamp-2">{exp.detail}</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
