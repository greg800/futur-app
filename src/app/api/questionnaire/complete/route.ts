import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { sendMail, completionEmail } from '@/lib/email'

export async function POST() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const db = getDb()
  const user = db.prepare(
    'SELECT first_name, email FROM users WHERE id = ?'
  ).get(session.userId) as any

  const total = (db.prepare('SELECT COUNT(*) as n FROM questions').get() as any).n
  const answered = (db.prepare(
    'SELECT COUNT(*) as n FROM responses WHERE user_id = ? AND answer IS NOT NULL'
  ).get(session.userId) as any).n

  if (answered < total) return NextResponse.json({ ok: false, reason: 'incomplete' })

  const { subject, html } = completionEmail(user.first_name)
  await sendMail(user.email, subject, html)

  return NextResponse.json({ ok: true })
}
