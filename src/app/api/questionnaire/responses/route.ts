export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const { questionId, answer, comment } = await req.json()

  if (!questionId || !answer) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
  }

  await execute(`
    INSERT INTO responses (user_id, question_id, answer, comment, updated_at)
    VALUES ($1, $2, $3, $4, NOW())
    ON CONFLICT (user_id, question_id) DO UPDATE SET
      answer = EXCLUDED.answer,
      comment = EXCLUDED.comment,
      updated_at = EXCLUDED.updated_at
  `, [session.userId, questionId, answer, comment || null])

  return NextResponse.json({ ok: true })
}
