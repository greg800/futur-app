'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  first_name: string
  last_name: string
  pseudo: string
  email: string
  role: string
  entity_id: number | null
  entity_name: string | null
}

interface Entity { id: number; name: string }

const ROLE_LABELS: Record<string, string> = {
  invite: 'Invité',
  lecteur: 'Lecteur',
  admin: 'Administrateur',
}

export default function ProfileClient({ user, entities }: { user: User; entities: Entity[] }) {
  const router = useRouter()
  const [form, setForm] = useState({
    firstName: user.first_name,
    lastName: user.last_name,
    pseudo: user.pseudo,
    email: user.email,
    entityId: user.entity_id ? String(user.entity_id) : '',
    newEntityName: '',
    password: '',
  })
  const [showNewEntity, setShowNewEntity] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    const payload: any = { ...form }
    if (!showNewEntity) delete payload.newEntityName
    if (showNewEntity) delete payload.entityId
    if (!payload.password) delete payload.password

    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) { setError(data.error || 'Erreur'); return }
    setSuccess(true)
    router.refresh()
  }

  async function handleLogout() {
    setLoggingOut(true)
    await fetch('/api/auth/me', { method: 'DELETE' })
    router.push('/login')
    router.refresh()
  }

  const initials = `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '48px 24px' }}>
      {/* Avatar + rôle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'var(--green)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          fontWeight: 700,
          flexShrink: 0,
        }}>
          {initials}
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>
            {user.first_name} {user.last_name}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
            @{user.pseudo} ·{' '}
            <span style={{
              background: 'var(--green-pale)',
              color: 'var(--green)',
              padding: '2px 8px',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 600,
            }}>
              {ROLE_LABELS[user.role] || user.role}
            </span>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <div style={{
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '32px',
        marginBottom: 16,
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Mes coordonnées</h2>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {error && <div className="error-msg">{error}</div>}
          {success && (
            <div style={{
              color: 'var(--green)',
              fontSize: 14,
              padding: '12px 16px',
              background: 'var(--green-pale)',
              borderRadius: 8,
            }}>
              Modifications enregistrées ✓
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="field">
              <label>Prénom</label>
              <input value={form.firstName} onChange={e => set('firstName', e.target.value)} required />
            </div>
            <div className="field">
              <label>Nom</label>
              <input value={form.lastName} onChange={e => set('lastName', e.target.value)} required />
            </div>
          </div>

          <div className="field">
            <label>Pseudo</label>
            <input value={form.pseudo} onChange={e => set('pseudo', e.target.value)} required />
          </div>

          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required />
          </div>

          <div className="field">
            <label>Entité</label>
            {!showNewEntity ? (
              <select value={form.entityId} onChange={e => {
                if (e.target.value === '__new__') { setShowNewEntity(true); set('entityId', '') }
                else set('entityId', e.target.value)
              }}>
                <option value="">— Aucune —</option>
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
                <button type="button" className="btn-ghost"
                  onClick={() => { setShowNewEntity(false); set('newEntityName', '') }}
                  style={{ padding: '12px 14px', fontSize: 14 }}>✕</button>
              </div>
            )}
          </div>

          {!showPassword ? (
            <button type="button" onClick={() => setShowPassword(true)}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 14,
                cursor: 'pointer', textDecoration: 'underline', textAlign: 'left', padding: 0 }}>
              Changer le mot de passe
            </button>
          ) : (
            <div className="field">
              <label>Nouveau mot de passe</label>
              <input type="password" value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder="6 caractères minimum" minLength={6} autoFocus />
            </div>
          )}

          <button type="submit" className="btn" disabled={saving}
            style={{ alignSelf: 'flex-start', marginTop: 8 }}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </form>
      </div>

      {/* Déconnexion */}
      <div style={{
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>Se déconnecter</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            Vous serez redirigé vers la page de connexion
          </div>
        </div>
        <button onClick={handleLogout} disabled={loggingOut}
          className="btn-ghost"
          style={{ color: '#C0392B', borderColor: '#F5C6C0', whiteSpace: 'nowrap' }}>
          {loggingOut ? '…' : 'Se déconnecter'}
        </button>
      </div>
    </div>
  )
}
