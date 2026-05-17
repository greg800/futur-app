'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'

interface Entity { id: number; name: string }

export default function RegisterPage() {
  const router = useRouter()
  const [entities, setEntities] = useState<Entity[]>([])
  const [form, setForm] = useState({
    firstName: '', lastName: '', pseudo: '', email: '', password: '',
    entityId: '', newEntityName: '',
  })
  const [showNewEntity, setShowNewEntity] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/entities').then(r => r.json()).then(d => setEntities(d.entities || []))
  }, [])

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload: any = { ...form }
    if (!showNewEntity) delete payload.newEntityName
    if (showNewEntity) delete payload.entityId

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error || 'Erreur'); return }

    router.push('/questionnaire')
    router.refresh()
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
        maxWidth: 460,
        background: '#fff',
        borderRadius: 16,
        padding: '48px 40px',
        border: '1px solid var(--border)',
      }}>
        <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'center' }}>
          <Logo size={36} />
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>
          Créer un compte
        </h1>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 32, fontSize: 15 }}>
          Rejoignez la plateforme FUTUR
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {error && <div className="error-msg">{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="field">
              <label>Prénom</label>
              <input value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Marie" required autoFocus />
            </div>
            <div className="field">
              <label>Nom</label>
              <input value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Dupont" required />
            </div>
          </div>

          <div className="field">
            <label>Pseudo</label>
            <input value={form.pseudo} onChange={e => set('pseudo', e.target.value)} placeholder="marie.dupont" required />
          </div>

          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="marie@exemple.fr" required />
          </div>

          <div className="field">
            <label>Entité</label>
            {!showNewEntity ? (
              <select
                value={form.entityId}
                onChange={e => {
                  if (e.target.value === '__new__') { setShowNewEntity(true); set('entityId', '') }
                  else set('entityId', e.target.value)
                }}
              >
                <option value="">— Sélectionner —</option>
                {entities.map(en => (
                  <option key={en.id} value={en.id}>{en.name}</option>
                ))}
                <option value="__new__">+ Créer une nouvelle entité</option>
              </select>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={form.newEntityName}
                  onChange={e => set('newEntityName', e.target.value)}
                  placeholder="Nom de l'entité"
                  required
                  style={{ flex: 1 }}
                />
                <button type="button" className="btn-ghost" onClick={() => { setShowNewEntity(false); set('newEntityName', '') }}
                  style={{ padding: '12px 14px', fontSize: 14 }}>
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className="field">
            <label>Mot de passe</label>
            <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" required minLength={6} />
          </div>

          <button type="submit" className="btn" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
            {loading ? 'Création…' : 'Créer mon compte →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: 'var(--text-secondary)' }}>
          Déjà un compte ?{' '}
          <Link href="/login" style={{ color: 'var(--green)', fontWeight: 500 }}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
