export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  const entities = await query('SELECT id, name FROM entities ORDER BY name')
  return NextResponse.json({ entities })
}
