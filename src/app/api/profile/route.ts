export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { queryOne, execute } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const { firstName, lastName, pseudo, email, entityId, newEntityName, password } = await req.json()

  let finalEntityId = entityId
  if (newEntityName) {
    const row = await queryOne<{ id: number }>(
      'INSERT INTO entities (name) VALUES ($1) RETURNING id',
      [newEntityName]
    )
    finalEntityId = row!.id
  }

  const conflict = await queryOne(
    'SELECT id FROM users WHERE (email = $1 OR pseudo = $2) AND id != $3',
    [email, pseudo, session.userId]
  )
  if (conflict) return NextResponse.json({ error: 'Email ou pseudo déjà utilisé' }, { status: 409 })

  if (password) {
    const hash = await bcrypt.hash(password, 10)
    await execute(`
      UPDATE users SET first_name=$1, last_name=$2, pseudo=$3, email=$4, entity_id=$5, password_hash=$6
      WHERE id=$7
    `, [firstName, lastName, pseudo, email, finalEntityId || null, hash, session.userId])
  } else {
    await execute(`
      UPDATE users SET first_name=$1, last_name=$2, pseudo=$3, email=$4, entity_id=$5
      WHERE id=$6
    `, [firstName, lastName, pseudo, email, finalEntityId || null, session.userId])
  }

  return NextResponse.json({ ok: true })
}
