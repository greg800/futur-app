import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const { questionId, answer, comment } = await req.json()

  if (!questionId || !answer) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
  }

  const db = getDb()
  db.prepare(`
    INSERT INTO responses (user_id, question_id, answer, comment, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, question_id) DO UPDATE SET
      answer = excluded.answer,
      comment = excluded.comment,
      updated_at = excluded.updated_at
  `).run(session.userId, questionId, answer, comment || null)

  return NextResponse.json({ ok: true })
}
