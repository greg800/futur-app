import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const questions = await query('SELECT * FROM questions ORDER BY position')

  const myResponses = await query(
    'SELECT question_id, answer, comment FROM responses WHERE user_id = $1',
    [session.userId]
  )

  const responseMap: Record<number, { answer: string; comment: string }> = {}
  myResponses.forEach((r: any) => { responseMap[r.question_id] = { answer: r.answer, comment: r.comment } })

  return NextResponse.json({ questions, responses: responseMap })
}
