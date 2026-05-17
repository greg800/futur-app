export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { queryOne } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ user: null })

  const user = await queryOne(`
    SELECT u.id, u.first_name, u.last_name, u.pseudo, u.email, u.role, e.name as entity_name
    FROM users u LEFT JOIN entities e ON u.entity_id = e.id
    WHERE u.id = $1
  `, [session.userId])

  return NextResponse.json({ user })
}

export async function DELETE() {
  const { cookies } = await import('next/headers')
  cookies().delete('futur_token')
  return NextResponse.json({ ok: true })
}
