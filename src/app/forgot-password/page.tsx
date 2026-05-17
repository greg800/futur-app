'use client'

import { useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/Logo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setLoading(false)
    setSent(true)
  }

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

        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>
          Mot de passe oublié
        </h1>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              background: 'var(--green-pale)',
              color: 'var(--green)',
              padding: '16px',
              borderRadius: 10,
              marginBottom: 24,
              fontSize: 15,
            }}>
              Si un compte existe pour <strong>{email}</strong>, vous allez recevoir un email avec un lien de réinitialisation.
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
              Vérifiez aussi vos spams. Le lien est valable 1 heure.
            </p>
            <Link href="/login" style={{ color: 'var(--green)', fontWeight: 500, fontSize: 14 }}>
              ← Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 28, fontSize: 14 }}>
              Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.fr"
                  required
                  autoFocus
                />
              </div>
              <button type="submit" className="btn" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? 'Envoi…' : 'Envoyer le lien →'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
              <Link href="/login" style={{ color: 'var(--green)', fontWeight: 500 }}>
                ← Retour à la connexion
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
