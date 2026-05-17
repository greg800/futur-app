import { NextRequest, NextResponse } from 'next/server'
import { query, execute } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const users = await query(`
    SELECT u.id, u.first_name, u.last_name, u.pseudo, u.email, u.role, u.created_at,
           e.name as entity_name
    FROM users u LEFT JOIN entities e ON u.entity_id = e.id
    ORDER BY u.created_at DESC
  `)

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

  await execute('UPDATE users SET role = $1 WHERE id = $2', [role, userId])

  return NextResponse.json({ ok: true })
}
