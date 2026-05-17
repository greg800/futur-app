import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDb } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { token, password } = await req.json()

  if (!token || !password || password.length < 6) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }

  const db = getDb()
  const row = db.prepare(
    `SELECT * FROM password_reset_tokens
     WHERE token = ? AND used = 0 AND expires_at > datetime('now')`
  ).get(token) as any

  if (!row) {
    return NextResponse.json({ error: 'Lien invalide ou expiré' }, { status: 400 })
  }

  const hash = await bcrypt.hash(password, 10)
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, row.user_id)
  db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE id = ?').run(row.id)

  return NextResponse.json({ ok: true })
}
