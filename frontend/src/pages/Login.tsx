import { FormEvent, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Brain, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react'

interface LoginProps {
  onBack: () => void
  onLogin: () => void
}

export default function Login({ onBack, onLogin }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isCreatingAccount && password !== confirmPassword) {
      setFormError('Passwords do not match. Please try again.')
      return
    }
    setFormError('')
    setIsSubmitting(true)
    window.setTimeout(onLogin, 450)
  }

  return (
    <main className="min-h-screen relative flex items-center justify-center overflow-hidden cyber-grid px-5 py-12">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 70% at 12% 20%, rgba(0,245,255,0.11), transparent 60%), radial-gradient(ellipse 55% 65% at 90% 80%, rgba(123,97,255,0.12), transparent 65%)' }} />

      <button onClick={onBack} className="absolute top-7 left-6 md:left-10 z-10 flex items-center gap-2 text-sm text-muted hover:text-cyan transition-colors">
        <ArrowLeft size={16} /> Back to home
      </button>

      <motion.section
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md rounded-3xl p-7 sm:p-9 glass-strong"
        style={{ boxShadow: '0 0 70px rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.2)' }}
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(0,245,255,0.25), rgba(123,97,255,0.25))', border: '1px solid rgba(0,245,255,0.35)' }}>
            <Brain size={23} color="#00F5FF" />
          </div>
          <div>
            <div className="font-mono text-sm text-cyan" style={{ letterSpacing: '0.14em' }}>IDCLONE.AI</div>
            <div className="text-xs text-muted">Identity Intelligence Platform</div>
          </div>
        </div>

        <div className="mb-7">
          <p className="text-xs font-mono text-cyan mb-2" style={{ letterSpacing: '0.12em' }}>SECURE ACCESS</p>
          <h1 className="text-3xl font-bold text-white">{isCreatingAccount ? 'Create your account' : 'Welcome back'}</h1>
          <p className="mt-2 text-sm text-muted">{isCreatingAccount ? 'Set up your secure analyst workspace in a few seconds.' : 'Sign in to continue protecting digital identities.'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isCreatingAccount && (
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Full name</span>
              <div className="mt-2 flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <UserRound size={17} className="text-cyan shrink-0" />
                <input required type="text" autoComplete="name" placeholder="Your full name" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" />
              </div>
            </label>
          )}

          <label className="block">
            <span className="text-xs font-medium text-slate-300">Work email</span>
            <div className="mt-2 flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Mail size={17} className="text-cyan shrink-0" />
              <input required type="email" autoComplete="email" placeholder="analyst@company.com" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-300">Password</span>
            <div className="mt-2 flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <LockKeyhole size={17} className="text-cyan shrink-0" />
              <input required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? 'text' : 'password'} autoComplete={isCreatingAccount ? 'new-password' : 'current-password'} placeholder={isCreatingAccount ? 'Create a password' : 'Enter your password'} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="text-muted hover:text-cyan transition-colors" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </label>

          {isCreatingAccount && (
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Confirm password</span>
              <div className="mt-2 flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <LockKeyhole size={17} className="text-cyan shrink-0" />
                <input required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Confirm your password" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" />
              </div>
            </label>
          )}

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-muted cursor-pointer">
              <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="accent-cyan" />
              {isCreatingAccount ? 'I agree to the terms of service' : 'Remember this device'}
            </label>
            {!isCreatingAccount && <button type="button" className="text-cyan hover:text-white transition-colors">Forgot password?</button>}
          </div>

          {formError && <p className="text-xs text-danger">{formError}</p>}

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isSubmitting} className="btn-liquid w-full rounded-xl py-3.5 text-sm disabled:opacity-70">
            {isSubmitting ? (isCreatingAccount ? 'Creating account...' : 'Authenticating...') : (isCreatingAccount ? 'Create account' : 'Sign in securely')}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          {isCreatingAccount ? 'Already have an account?' : 'New to IDCLONE.AI?'}{' '}
          <button
            type="button"
            onClick={() => { setIsCreatingAccount((creating) => !creating); setIsSubmitting(false); setFormError(''); setPassword(''); setConfirmPassword('') }}
            className="text-cyan hover:text-white transition-colors font-medium"
          >
            {isCreatingAccount ? 'Sign in' : 'Create an account'}
          </button>
        </p>

        <div className="mt-7 flex items-center justify-center gap-2 text-xs text-muted">
          <ShieldCheck size={15} className="text-success" />
          Protected with enterprise-grade encryption
        </div>
      </motion.section>
    </main>
  )
}
