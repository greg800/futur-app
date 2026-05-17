import { redirect, notFound } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'
import QuestionClient from './QuestionClient'

interface Props {
  params: { step: string }
}

export default async function QuestionPage({ params }: Props) {
  const session = await getSession()
  if (!session) redirect('/login')

  const step = parseInt(params.step)
  if (isNaN(step) || step < 1) notFound()

  const db = getDb()
  const questions = db.prepare('SELECT * FROM questions ORDER BY position').all() as any[]
  const total = questions.length

  if (step > total) redirect('/questionnaire')

  const question = questions[step - 1]

  const existing = db.prepare(
    'SELECT answer, comment FROM responses WHERE user_id = ? AND question_id = ?'
  ).get(session.userId, question.id) as any

  const user = db.prepare(
    'SELECT first_name, last_name, pseudo, role FROM users WHERE id = ?'
  ).get(session.userId) as any

  return (
    <QuestionClient
      step={step}
      total={total}
      question={question}
      initialAnswer={existing?.answer || null}
      initialComment={existing?.comment || ''}
      user={user}
    />
  )
}
