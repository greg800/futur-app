'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'

function ResetForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return }
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error || 'Erreur'); return }
    router.push('/login?reset=1')
  }

  if (!token) {
    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--error)', marginBottom: 16 }}>Lien invalide.</p>
        <Link href="/forgot-password" style={{ color: 'var(--green)', fontWeight: 500 }}>
          Demander un nouveau lien
        </Link>
      </div>
    )
  }

  return (
    <>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>
        Nouveau mot de passe
      </h1>
      <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 28, fontSize: 14 }}>
        Choisissez un mot de passe d'au moins 6 caractères.
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {error && <div className="error-msg">{error}</div>}
        <div className="field">
          <label>Nouveau mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="6 caractères minimum"
            minLength={6}
            required
            autoFocus
          />
        </div>
        <div className="field">
          <label>Confirmer le mot de passe</label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Répétez le mot de passe"
            minLength={6}
            required
          />
        </div>
        <button type="submit" className="btn" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
          {loading ? 'Enregistrement…' : 'Enregistrer →'}
        </button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--surface)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: '#fff',
        borderRadius: 16,
        padding: '48px 40px',
        border: '1px solid var(--border)',
      }}>
        <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'center' }}>
          <Logo size={36} />
        </div>
        <Suspense fallback={<div>Chargement…</div>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  )
}
