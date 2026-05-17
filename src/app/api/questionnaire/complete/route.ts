export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { queryOne } from '@/lib/db'
import { sendMail, completionEmail } from '@/lib/email'

export async function POST() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const user = await queryOne<{ first_name: string; email: string }>(
    'SELECT first_name, email FROM users WHERE id = $1',
    [session.userId]
  )

  const totalRow = await queryOne<{ n: string }>('SELECT COUNT(*) as n FROM questions')
  const total = parseInt(totalRow!.n)

  const answeredRow = await queryOne<{ n: string }>(
    'SELECT COUNT(*) as n FROM responses WHERE user_id = $1 AND answer IS NOT NULL',
    [session.userId]
  )
  const answered = parseInt(answeredRow!.n)

  if (answered < total) return NextResponse.json({ ok: false, reason: 'incomplete' })

  const { subject, html } = completionEmail(user!.first_name)
  await sendMail(user!.email, subject, html)

  return NextResponse.json({ ok: true })
}
