export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { queryOne, execute } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { token, password } = await req.json()

  if (!token || !password || password.length < 6) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }

  const row = await queryOne(
    `SELECT * FROM password_reset_tokens
     WHERE token = $1 AND used = 0 AND expires_at > NOW()`,
    [token]
  )

  if (!row) {
    return NextResponse.json({ error: 'Lien invalide ou expiré' }, { status: 400 })
  }

  const hash = await bcrypt.hash(password, 10)
  await execute('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, row.user_id])
  await execute('UPDATE password_reset_tokens SET used = 1 WHERE id = $1', [row.id])

  return NextResponse.json({ ok: true })
}
