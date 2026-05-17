import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const db = getDb()
  const questions = db.prepare('SELECT * FROM questions ORDER BY position').all() as any[]

  const myResponses = db.prepare(`
    SELECT question_id, answer, comment FROM responses WHERE user_id = ?
  `).all(session.userId) as any[]

  const responseMap: Record<number, { answer: string; comment: string }> = {}
  myResponses.forEach(r => { responseMap[r.question_id] = { answer: r.answer, comment: r.comment } })

  return NextResponse.json({ questions, responses: responseMap })
}
