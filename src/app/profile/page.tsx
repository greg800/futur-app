import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'
import Navbar from '@/components/Navbar'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const db = getDb()
  const user = db.prepare(`
    SELECT u.id, u.first_name, u.last_name, u.pseudo, u.email, u.role, u.entity_id,
           e.name as entity_name
    FROM users u LEFT JOIN entities e ON u.entity_id = e.id
    WHERE u.id = ?
  `).get(session.userId) as any

  const entities = db.prepare('SELECT id, name FROM entities ORDER BY name').all() as any[]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)' }}>
      <Navbar user={user} />
      <ProfileClient user={user} entities={entities} />
    </div>
  )
}
