import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { query, queryOne } from '@/lib/db'
import Navbar from '@/components/Navbar'
import ResultatsClient from './ResultatsClient'
import { Q_SUMMARIES } from '@/lib/questions'

export default async function ResultatsPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role === 'invite') redirect('/questionnaire')

  const currentUser = await queryOne(
    'SELECT first_name, last_name, pseudo, role FROM users WHERE id = $1',
    [session.userId]
  )

  const questions = await query('SELECT id, position, text FROM questions ORDER BY position')

  const respondents = await query(`
    SELECT u.id, u.first_name || ' ' || u.last_name as name,
           u.pseudo, e.name as entity,
           MAX(r.updated_at) as last_date
    FROM users u
    JOIN responses r ON r.user_id = u.id AND r.answer IS NOT NULL
    LEFT JOIN entities e ON u.entity_id = e.id
    GROUP BY u.id, u.first_name, u.last_name, u.pseudo, e.name
    ORDER BY last_date ASC
  `)

  const allResponses = await query(`
    SELECT user_id, question_id, answer, comment
    FROM responses WHERE answer IS NOT NULL
  `)

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
        isAdmin={session.role === 'admin'}
      />
    </div>
  )
}
