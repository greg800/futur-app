import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { query, queryOne } from '@/lib/db'
import Navbar from '@/components/Navbar'
import QuestionsClient from './QuestionsClient'

export default async function AdminQuestionsPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'admin') redirect('/questionnaire')

  const questions = await query('SELECT * FROM questions ORDER BY position')
  const currentUser = await queryOne(
    'SELECT first_name, last_name, pseudo, role FROM users WHERE id = $1',
    [session.userId]
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)' }}>
      <Navbar user={currentUser} />
      <QuestionsClient questions={questions as any[]} />
    </div>
  )
}
