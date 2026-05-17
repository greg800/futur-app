import { NextRequest, NextResponse } from 'next/server'
import { query, execute } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }
  const questions = await query('SELECT * FROM questions ORDER BY position')
  return NextResponse.json({ questions })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const { text, section, preamble } = await req.json()
  if (!text?.trim()) return NextResponse.json({ error: 'Texte requis' }, { status: 400 })

  const rows = await query('SELECT MAX(position) as max FROM questions')
  const nextPos = (rows[0].max || 0) + 1

  await execute(
    'INSERT INTO questions (section, preamble, text, position) VALUES ($1, $2, $3, $4)',
    [section || 'Pour un droit effectif à choisir son énergie', preamble || 'Vous engagez-vous à…', text.trim(), nextPos]
  )
  return NextResponse.json({ ok: true })
}
