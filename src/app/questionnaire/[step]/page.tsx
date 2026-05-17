import { redirect, notFound } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { query, queryOne } from '@/lib/db'
import Navbar from '@/components/Navbar'
import QuestionClient from './QuestionClient'

interface Props {
  params: { step: string }
}

export default async function QuestionPage({ params }: Props) {
  const session = await getSession()
  if (!session) redirect('/login')

  const step = parseInt(params.step)
  if (isNaN(step) || step < 1) notFound()

  const questions = await query('SELECT * FROM questions ORDER BY position')
  const total = questions.length

  if (step > total) redirect('/questionnaire')

  const question = questions[step - 1]

  const existing = await queryOne(
    'SELECT answer, comment FROM responses WHERE user_id = $1 AND question_id = $2',
    [session.userId, question.id]
  )

  const user = await queryOne(
    'SELECT first_name, last_name, pseudo, role FROM users WHERE id = $1',
    [session.userId]
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <Navbar user={user} />
      <QuestionClient
        key={step}
        step={step}
        total={total}
        question={question}
        initialAnswer={existing?.answer || null}
        initialComment={existing?.comment || ''}
        user={user}
      />
    </div>
  )
}
