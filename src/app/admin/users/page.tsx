import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { query, queryOne } from '@/lib/db'
import Navbar from '@/components/Navbar'
import AdminUsersClient from './AdminUsersClient'

export default async function AdminUsersPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'admin') redirect('/questionnaire')

  const users = await query(`
    SELECT u.id, u.first_name, u.last_name, u.pseudo, u.email, u.role, u.created_at,
           e.name as entity_name
    FROM users u LEFT JOIN entities e ON u.entity_id = e.id
    ORDER BY u.created_at DESC
  `)

  const currentUser = await queryOne(
    'SELECT first_name, last_name, pseudo, role FROM users WHERE id = $1',
    [session.userId]
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)' }}>
      <Navbar user={currentUser} />
      <AdminUsersClient users={users as any[]} currentUserId={session.userId} />
    </div>
  )
}
