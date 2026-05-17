import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getDb } from '@/lib/db'
import { sendMail, forgotPasswordEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 })

  const db = getDb()
  const user = db.prepare('SELECT id, first_name FROM users WHERE email = ?').get(email) as any

  // Always return success to avoid email enumeration
  if (!user) return NextResponse.json({ ok: true })

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1h

  db.prepare(
    'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)'
  ).run(user.id, token, expiresAt)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'
  const link = `${baseUrl}/reset-password?token=${token}`

  const { subject, html } = forgotPasswordEmail(link)
  await sendMail(email, subject, html)

  return NextResponse.json({ ok: true })
}
