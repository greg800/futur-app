import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { queryOne } from '@/lib/db'
import { signToken, setTokenCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  const user = await queryOne('SELECT * FROM users WHERE email = $1', [email])

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 })
  }

  const token = await signToken({ userId: user.id, email: user.email, role: user.role })
  const response = NextResponse.json({ ok: true, role: user.role })
  setTokenCookie(token)
  return response
}
