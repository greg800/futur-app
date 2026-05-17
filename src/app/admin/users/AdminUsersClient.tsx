'use client'

import { useState } from 'react'

interface User {
  id: number
  first_name: string
  last_name: string
  pseudo: string
  email: string
  role: string
  created_at: string
  entity_name: string | null
}

const ROLE_COLORS: Record<string, string> = {
  invite: '#8B8B8B',
  lecteur: '#2D6A4F',
  admin: '#1B4332',
}

export default function AdminUsersClient({ users: initial, currentUserId }: { users: User[]; currentUserId: number }) {
  const [users, setUsers] = useState(initial)
  const [saving, setSaving] = useState<number | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)

  async function changeRole(userId: number, role: string) {
    setSaving(userId)
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    })
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
    setSaving(null)
  }

  async function deleteUser(user: User) {
    if (!confirm(`Supprimer ${user.first_name} ${user.last_name} et toutes ses réponses ?\n\nCette action est irrémédiable.`)) return
    setDeleting(user.id)
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    })
    if (res.ok) setUsers(prev => prev.filter(u => u.id !== user.id))
    setDeleting(null)
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Gestion des utilisateurs</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
        {users.length} compte{users.length > 1 ? 's' : ''} enregistré{users.length > 1 ? 's' : ''}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {users.map(user => (
          <div key={user.id} style={{
            background: '#fff', border: '1px solid var(--border)', borderRadius: 12,
            padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20,
            opacity: deleting === user.id ? 0.4 : 1, transition: 'opacity 0.2s',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%', background: 'var(--green-pale)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 700, color: 'var(--green)', flexShrink: 0,
            }}>
              {user.first_name[0]}{user.last_name[0]}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 16 }}>
                {user.first_name} {user.last_name}
                {user.id === currentUserId && (
                  <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-secondary)' }}>(vous)</span>
                )}
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                {user.email}{user.entity_name && <> · {user.entity_name}</>}
              </div>
            </div>

            <select
              value={user.role}
              onChange={e => changeRole(user.id, e.target.value)}
              disabled={saving === user.id || user.id === currentUserId}
              style={{
                padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8,
                fontSize: 14, fontWeight: 500, color: ROLE_COLORS[user.role],
                background: '#fff', cursor: user.id === currentUserId ? 'not-allowed' : 'pointer',
                outline: 'none', opacity: saving === user.id ? 0.5 : 1,
              }}
            >
              <option value="invite">Invité</option>
              <option value="lecteur">Lecteur</option>
              <option value="admin">Admin</option>
            </select>

            {user.id !== currentUserId && (
              <button
                onClick={() => deleteUser(user)}
                disabled={deleting === user.id}
                style={{
                  background: 'none', border: '1px solid #F5C6C0', color: '#C0392B',
                  padding: '8px 14px', borderRadius: 8, fontSize: 13,
                  cursor: 'pointer', fontWeight: 500, flexShrink: 0,
                }}
              >
                Supprimer
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
