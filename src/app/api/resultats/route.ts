import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  if (session.role === 'invite') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const db = getDb()

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

  // Map: userId -> questionId -> { answer, comment }
  const responseMap: Record<number, Record<number, { answer: string; comment: string }>> = {}
  allResponses.forEach((r: any) => {
    if (!responseMap[r.user_id]) responseMap[r.user_id] = {}
    responseMap[r.user_id][r.question_id] = { answer: r.answer, comment: r.comment }
  })

  return NextResponse.json({ questions, respondents, responseMap })
}
