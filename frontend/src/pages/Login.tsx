import { FormEvent, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Brain, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react'
import api from '../api/api'

interface LoginProps {
  onBack: () => void
  onLogin: (user: { name: string; email: string }, remember: boolean) => void
}

interface StoredAccount {
  name: string
  email: string
  password: string
}

const ACCOUNTS_KEY = 'idclone_accounts'

const getAccounts = (): StoredAccount[] => {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]') as StoredAccount[]
  } catch {
    return []
  }
}

export default function Login({ onBack, onLogin }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [resetRequested, setResetRequested] = useState(false)
  const [resetCode, setResetCode] = useState('')
  const [resetMessage, setResetMessage] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [formError, setFormError] = useState('')
  const normalizedEmail = email.trim().toLowerCase()
  const existingAccount = normalizedEmail
    ? getAccounts().find((account) => account.email.toLowerCase() === normalizedEmail)
    : undefined

  const handleEmailChange = (value: string) => {
    setEmail(value)
    setFormError('')
    setResetMessage('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const accounts = getAccounts()
    const existingAccount = accounts.find((account) => account.email.toLowerCase() === normalizedEmail)

    if (isResettingPassword) {
      setFormError('')
      setResetMessage('')
      setIsSubmitting(true)
      try {
        if (!resetRequested) {
          const response = await api.post('/auth/password-reset/request', { email: normalizedEmail })
          setResetMessage(response.data.message)
          setResetRequested(true)
        } else {
          if (password !== confirmPassword) {
            setFormError('Passwords do not match. Please try again.')
            return
          }
          const response = await api.post('/auth/password-reset/confirm', { email: normalizedEmail, token: resetCode, password })
          setResetMessage(response.data.message)
          setIsResettingPassword(false)
          setResetRequested(false)
          setResetCode('')
          setPassword('')
          setConfirmPassword('')
        }
      } catch (error: any) {
        // The local account fallback keeps development-only accounts usable if
        // the API is not running. Server-backed accounts always use reset codes.
        if (!error?.response && existingAccount) {
          if (!resetRequested) {
            setResetRequested(true)
            setResetMessage('Reset code delivery is unavailable. Set a new password for this local account.')
          } else if (password !== confirmPassword) {
            setFormError('Passwords do not match. Please try again.')
          } else {
            const updatedAccounts = accounts.map((account) => account.email.toLowerCase() === normalizedEmail
              ? { ...account, password }
              : account)
            localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(updatedAccounts))
            setResetMessage('Your password has been reset. You can now sign in.')
            setIsResettingPassword(false)
            setResetRequested(false)
            setResetCode('')
            setPassword('')
            setConfirmPassword('')
          }
        } else {
          setFormError(error?.response?.data?.detail || 'Unable to reset your password. Please try again.')
        }
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    if (isCreatingAccount && password !== confirmPassword) {
      setFormError('Passwords do not match. Please try again.')
      return
    }

    setFormError('')
    setIsSubmitting(true)
    try {
      const response = await api.post(isCreatingAccount ? '/auth/register' : '/auth/login', isCreatingAccount
        ? { name: name.trim(), email: normalizedEmail, password }
        : { email: normalizedEmail, password })
      onLogin(response.data, remember)
    } catch (error: any) {
      const serverMessage = error?.response?.data?.detail
      if (serverMessage) {
        setFormError(serverMessage)
        setIsSubmitting(false)
        return
      }

      // Keep the UI usable when the API is temporarily offline, while the
      // backend-backed path above remains the source of truth when available.
      if (isCreatingAccount) {
        if (existingAccount) {
          setFormError('An account with this email already exists. Please sign in instead.')
          setIsSubmitting(false)
          return
        }
        const newAccount = { name: name.trim(), email: normalizedEmail, password }
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, newAccount]))
        onLogin({ name: newAccount.name, email: newAccount.email }, remember)
      } else if (!existingAccount) {
        setFormError('No account exists for this email. Please create an account first.')
        setIsSubmitting(false)
      } else if (existingAccount.password !== password) {
        setFormError('Incorrect password. Please try again.')
        setIsSubmitting(false)
      } else {
        onLogin({ name: existingAccount.name, email: existingAccount.email }, remember)
      }
    }
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
          <h1 className="text-3xl font-bold text-white">{isResettingPassword ? 'Reset your password' : (isCreatingAccount ? 'Create your account' : 'Welcome back')}</h1>
          <p className="mt-2 text-sm text-muted">{isResettingPassword ? (resetRequested ? 'Enter the reset code from your email and choose a new password.' : 'Enter your work email and we will send you a reset code.') : (isCreatingAccount ? 'Set up your secure analyst workspace in a few seconds.' : 'Sign in to continue protecting digital identities.')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isCreatingAccount && !isResettingPassword && (
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Analyst username</span>
              <div className="mt-2 flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <UserRound size={17} className="text-cyan shrink-0" />
                <input required value={name} onChange={(event) => setName(event.target.value)} type="text" autoComplete="username" placeholder="Choose a username" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" />
              </div>
            </label>
          )}

          <label className="block">
            <span className="text-xs font-medium text-slate-300">Work email</span>
            <div className="mt-2 flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Mail size={17} className="text-cyan shrink-0" />
              <input required value={email} onChange={(event) => handleEmailChange(event.target.value)} type="email" autoComplete="email" placeholder="analyst@company.com" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" />
            </div>
            {normalizedEmail && (
              <p className={`mt-2 text-xs ${existingAccount ? 'text-cyan' : 'text-muted'}`}>
                {existingAccount
                  ? (isCreatingAccount ? 'This email already has an account. Sign in instead.' : 'Account found. Enter your password to sign in.')
                  : (isCreatingAccount ? 'New email. Create your analyst account.' : 'New email. Create an account to continue.')}
              </p>
            )}
          </label>

          {isResettingPassword && resetRequested && (
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Reset code</span>
              <div className="mt-2 flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <ShieldCheck size={17} className="text-cyan shrink-0" />
                <input required value={resetCode} onChange={(event) => setResetCode(event.target.value)} type="text" autoComplete="one-time-code" placeholder="Code from email" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" />
              </div>
            </label>
          )}

          {(!isResettingPassword || resetRequested) && <label className="block">
            <span className="text-xs font-medium text-slate-300">Password</span>
            <div className="mt-2 flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <LockKeyhole size={17} className="text-cyan shrink-0" />
              <input required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? 'text' : 'password'} autoComplete={isCreatingAccount || isResettingPassword ? 'new-password' : 'current-password'} placeholder={isCreatingAccount || isResettingPassword ? 'Create a new password' : 'Enter your password'} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="text-muted hover:text-cyan transition-colors" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </label>}

          {(isCreatingAccount || (isResettingPassword && resetRequested)) && (
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
              {!isResettingPassword && <><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="accent-cyan" />
              {isCreatingAccount ? 'I agree to the terms of service' : 'Remember this device'}</>}
            </label>
            {isResettingPassword
              ? <button type="button" onClick={() => { setIsResettingPassword(false); setResetRequested(false); setResetCode(''); setPassword(''); setConfirmPassword(''); setFormError(''); setResetMessage('') }} className="text-cyan hover:text-white transition-colors">Back to sign in</button>
              : !isCreatingAccount && <button type="button" onClick={() => { setIsResettingPassword(true); setFormError(''); setResetMessage(''); setPassword('') }} className="text-cyan hover:text-white transition-colors">Forgot password?</button>}
          </div>

          {formError && <p className="text-xs text-danger">{formError}</p>}
          {resetMessage && <p className="text-xs text-success">{resetMessage}</p>}

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isSubmitting} className="btn-liquid w-full rounded-xl py-3.5 text-sm disabled:opacity-70">
            {isSubmitting ? (isResettingPassword ? 'Processing...' : (isCreatingAccount ? 'Creating account...' : 'Authenticating...')) : (isResettingPassword ? (resetRequested ? 'Reset password' : 'Send reset code') : (isCreatingAccount ? 'Create account' : 'Sign in securely'))}
          </motion.button>
        </form>

        {!isResettingPassword && <p className="mt-6 text-center text-sm text-muted">
          {isCreatingAccount ? 'Already have an account?' : 'New to IDCLONE.AI?'}{' '}
          <button
            type="button"
            onClick={() => { setIsCreatingAccount((creating) => !creating); setIsSubmitting(false); setFormError(''); setPassword(''); setConfirmPassword('') }}
            className="text-cyan hover:text-white transition-colors font-medium"
          >
            {isCreatingAccount ? 'Sign in' : 'Create an account'}
          </button>
        </p>}

        <div className="mt-7 flex items-center justify-center gap-2 text-xs text-muted">
          <ShieldCheck size={15} className="text-success" />
          Protected with enterprise-grade encryption
        </div>
      </motion.section>
    </main>
  )
}
