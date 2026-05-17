export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { queryOne, execute } from '@/lib/db'
import { signToken, setTokenCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { firstName, lastName, pseudo, email, password, entityId, newEntityName } = await req.json()

  if (!firstName || !lastName || !pseudo || !email || !password) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  let finalEntityId = entityId
  if (newEntityName) {
    const row = await queryOne<{ id: number }>(
      'INSERT INTO entities (name) VALUES ($1) RETURNING id',
      [newEntityName]
    )
    finalEntityId = row!.id
  }

  const existing = await queryOne('SELECT id FROM users WHERE email = $1 OR pseudo = $2', [email, pseudo])
  if (existing) {
    return NextResponse.json({ error: 'Email ou pseudo déjà utilisé' }, { status: 409 })
  }

  const hash = await bcrypt.hash(password, 10)
  const newUser = await queryOne<{ id: number }>(`
    INSERT INTO users (first_name, last_name, pseudo, email, entity_id, password_hash, role)
    VALUES ($1, $2, $3, $4, $5, $6, 'invite')
    RETURNING id
  `, [firstName, lastName, pseudo, email, finalEntityId || null, hash])

  const token = await signToken({ userId: newUser!.id, email, role: 'invite' })
  const response = NextResponse.json({ ok: true })
  setTokenCookie(token)
  return response
}
