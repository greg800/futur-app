import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ user: null })

  const db = getDb()
  const user = db.prepare(`
    SELECT u.id, u.first_name, u.last_name, u.pseudo, u.email, u.role, e.name as entity_name
    FROM users u LEFT JOIN entities e ON u.entity_id = e.id
    WHERE u.id = ?
  `).get(session.userId) as any

  return NextResponse.json({ user })
}

export async function DELETE() {
  const { cookies } = await import('next/headers')
  cookies().delete('futur_token')
  return NextResponse.json({ ok: true })
}
