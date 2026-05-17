import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDb } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const { firstName, lastName, pseudo, email, entityId, newEntityName, password } = await req.json()

  const db = getDb()

  let finalEntityId = entityId
  if (newEntityName) {
    const result = db.prepare('INSERT INTO entities (name) VALUES (?)').run(newEntityName)
    finalEntityId = result.lastInsertRowid
  }

  const conflict = db.prepare(
    'SELECT id FROM users WHERE (email = ? OR pseudo = ?) AND id != ?'
  ).get(email, pseudo, session.userId)
  if (conflict) return NextResponse.json({ error: 'Email ou pseudo déjà utilisé' }, { status: 409 })

  if (password) {
    const hash = await bcrypt.hash(password, 10)
    db.prepare(`
      UPDATE users SET first_name=?, last_name=?, pseudo=?, email=?, entity_id=?, password_hash=?
      WHERE id=?
    `).run(firstName, lastName, pseudo, email, finalEntityId || null, hash, session.userId)
  } else {
    db.prepare(`
      UPDATE users SET first_name=?, last_name=?, pseudo=?, email=?, entity_id=?
      WHERE id=?
    `).run(firstName, lastName, pseudo, email, finalEntityId || null, session.userId)
  }

  return NextResponse.json({ ok: true })
}
