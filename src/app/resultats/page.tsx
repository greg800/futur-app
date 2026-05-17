import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'
import Navbar from '@/components/Navbar'
import ResultatsClient from './ResultatsClient'
import { Q_SUMMARIES } from '@/lib/questions'

export default async function ResultatsPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role === 'invite') redirect('/questionnaire')

  const db = getDb()

  const currentUser = db.prepare(
    'SELECT first_name, last_name, pseudo, role FROM users WHERE id = ?'
  ).get(session.userId) as any

  const questions = db.prepare('SELECT id, position, text FROM questions ORDER BY position').all() as any[]

  const respondents = db.prepare(`
    SELECT u.id, u.first_name || ' ' || u.last_name as name,
           u.pseudo, e.name as entity,
           MAX(r.updated_at) as last_date
    FROM users u
    JOIN responses r ON r.user_id = u.id AND r.answer IS NOT NULL
    LEFT JOIN entities e ON u.entity_id = e.id
    GROUP BY u.id
    ORDER BY last_date ASC
  `).all() as any[]

  const allResponses = db.prepare(`
    SELECT user_id, question_id, answer, comment
    FROM responses WHERE answer IS NOT NULL
  `).all() as any[]

  const responseMap: Record<number, Record<number, { answer: string; comment: string | null }>> = {}
  ;(allResponses as any[]).forEach(r => {
    if (!responseMap[r.user_id]) responseMap[r.user_id] = {}
    responseMap[r.user_id][r.question_id] = { answer: r.answer, comment: r.comment }
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)' }}>
      <Navbar user={currentUser} />
      <ResultatsClient
        questions={questions}
        respondents={respondents}
        responseMap={responseMap}
        summaries={Q_SUMMARIES}
      />
    </div>
  )
}
