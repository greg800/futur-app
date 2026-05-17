import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const db = getDb()
  const users = db.prepare(`
    SELECT u.id, u.first_name, u.last_name, u.pseudo, u.email, u.role, u.created_at,
           e.name as entity_name
    FROM users u LEFT JOIN entities e ON u.entity_id = e.id
    ORDER BY u.created_at DESC
  `).all()

  return NextResponse.json({ users })
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const { userId, role } = await req.json()
  if (!userId || !['invite', 'lecteur', 'admin'].includes(role)) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }

  const db = getDb()
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, userId)

  return NextResponse.json({ ok: true })
}
