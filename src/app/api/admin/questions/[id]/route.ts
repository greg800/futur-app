export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const { text } = await req.json()
  if (!text?.trim()) return NextResponse.json({ error: 'Texte requis' }, { status: 400 })

  await execute('UPDATE questions SET text = $1 WHERE id = $2', [text.trim(), params.id])
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const id = params.id
  // Delete responses for this question, then resequence positions
  await execute('DELETE FROM responses WHERE question_id = $1', [id])
  await execute('DELETE FROM questions WHERE id = $1', [id])
  // Resequence positions
  await execute(`
    WITH ranked AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY position) as new_pos
      FROM questions
    )
    UPDATE questions SET position = ranked.new_pos
    FROM ranked WHERE questions.id = ranked.id
  `)
  return NextResponse.json({ ok: true })
}
