import { motion } from 'framer-motion'
import { Moon, Bell, Server, Cpu, Info, CheckCircle } from 'lucide-react'
import { useState } from 'react'

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle-switch">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-slider" />
    </label>
  )
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 rounded-lg text-sm outline-none"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontFamily: 'Inter' }}
    >
      {options.map((o) => <option key={o} value={o} style={{ background: '#0B1120' }}>{o}</option>)}
    </select>
  )
}

export default function Settings() {
  const [animSpeed, setAnimSpeed] = useState('Normal')
  const [notifications, setNotifications] = useState(true)
  const [soundAlerts, setSoundAlerts] = useState(false)
  const [autoAnalyze, setAutoAnalyze] = useState(true)
  const [darkMode, setDarkMode] = useState(true)

  const sections = [
    {
      title: 'Appearance',
      icon: Moon,
      color: '#7B61FF',
      items: [
        {
          label: 'Dark Mode', desc: 'Cyberpunk dark theme (default)',
          control: <Toggle checked={darkMode} onChange={setDarkMode} />,
        },
        {
          label: 'Animation Speed', desc: 'Controls transition and effect speed',
          control: <Select value={animSpeed} onChange={setAnimSpeed} options={['Slow', 'Normal', 'Fast', 'Off']} />,
        },
      ],
    },
    {
      title: 'Notifications',
      icon: Bell,
      color: '#00F5FF',
      items: [
        {
          label: 'Push Notifications', desc: 'Receive alerts for new threats detected',
          control: <Toggle checked={notifications} onChange={setNotifications} />,
        },
        {
          label: 'Sound Alerts', desc: 'Play audio cue on critical threat detection',
          control: <Toggle checked={soundAlerts} onChange={setSoundAlerts} />,
        },
        {
          label: 'Auto-Analyze Queue', desc: 'Automatically process investigation queue',
          control: <Toggle checked={autoAnalyze} onChange={setAutoAnalyze} />,
        },
      ],
    },
  ]

  const statusItems = [
    { label: 'Backend API', value: 'Connected', color: '#00FFA3', icon: Server },
    { label: 'DeepFace Model', value: 'Loaded · v2.8', color: '#00FFA3', icon: Cpu },
    { label: 'Fake Profile Classifier', value: 'Loaded · v3.1', color: '#00FFA3', icon: Cpu },
    { label: 'Spammer Model', value: 'Loaded · v2.4', color: '#00FFA3', icon: Cpu },
    { label: 'NLP Bio Model', value: 'Loaded · v1.9', color: '#00FFA3', icon: Cpu },
    { label: 'Username Similarity', value: 'Loaded · v2.2', color: '#00FFA3', icon: Cpu },
  ]

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(180deg, #00F5FF, #7B61FF)' }} />
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk' }}>Settings</h1>
        </div>
        <p className="text-sm text-muted ml-4">Platform configuration and system status</p>
      </motion.div>

      {sections.map((section, si) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: si * 0.1 }}
          className="glass rounded-2xl overflow-hidden"
          style={{ border: `1px solid ${section.color}18` }}
        >
          <div className="px-6 py-4 flex items-center gap-3" style={{ background: `${section.color}06`, borderBottom: `1px solid ${section.color}12` }}>
            <section.icon size={16} color={section.color} />
            <h3 className="font-bold" style={{ fontFamily: 'Space Grotesk', color: section.color }}>{section.title}</h3>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {section.items.map((item) => (
              <div key={item.label} className="flex items-center justify-between px-6 py-4">
                <div>
                  <div className="text-sm font-medium text-white">{item.label}</div>
                  <div className="text-xs text-muted mt-0.5">{item.desc}</div>
                </div>
                {item.control}
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Backend Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(0,255,163,0.15)' }}
      >
        <div className="px-6 py-4 flex items-center gap-3" style={{ background: 'rgba(0,255,163,0.04)', borderBottom: '1px solid rgba(0,255,163,0.1)' }}>
          <Server size={16} color="#00FFA3" />
          <h3 className="font-bold" style={{ fontFamily: 'Space Grotesk', color: '#00FFA3' }}>Backend & AI Model Status</h3>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="status-dot status-online" />
            <span className="text-xs font-mono text-success">ALL SYSTEMS OPERATIONAL</span>
          </div>
        </div>
        <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          {statusItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-3">
                <item.icon size={14} color={item.color} />
                <span className="text-sm text-muted">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={12} color={item.color} />
                <span className="text-xs font-mono" style={{ color: item.color }}>{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Version */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-2xl p-5"
        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <Info size={16} color="#94A3B8" />
          <div>
            <div className="text-sm font-medium">IDClone.AI Platform</div>
            <div className="text-xs text-muted">Version 3.8.1 · Build 20260727 · Enterprise License</div>
          </div>
          <div className="ml-auto">
            <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ background: 'rgba(0,245,255,0.1)', color: '#00F5FF', border: '1px solid rgba(0,245,255,0.2)' }}>
              Up to date
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
