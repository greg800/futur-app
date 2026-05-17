import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDb } from '@/lib/db'
import { signToken, setTokenCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { firstName, lastName, pseudo, email, password, entityId, newEntityName } = await req.json()

  if (!firstName || !lastName || !pseudo || !email || !password) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  const db = getDb()

  let finalEntityId = entityId
  if (newEntityName) {
    const result = db.prepare('INSERT INTO entities (name) VALUES (?)').run(newEntityName)
    finalEntityId = result.lastInsertRowid
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ? OR pseudo = ?').get(email, pseudo)
  if (existing) {
    return NextResponse.json({ error: 'Email ou pseudo déjà utilisé' }, { status: 409 })
  }

  const hash = await bcrypt.hash(password, 10)
  const result = db.prepare(`
    INSERT INTO users (first_name, last_name, pseudo, email, entity_id, password_hash, role)
    VALUES (?, ?, ?, ?, ?, ?, 'invite')
  `).run(firstName, lastName, pseudo, email, finalEntityId || null, hash)

  const token = await signToken({ userId: Number(result.lastInsertRowid), email, role: 'invite' })
  const response = NextResponse.json({ ok: true })
  setTokenCookie(token)
  return response
}
