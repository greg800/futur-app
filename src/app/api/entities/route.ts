import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  const db = getDb()
  const entities = db.prepare('SELECT id, name FROM entities ORDER BY name').all()
  return NextResponse.json({ entities })
}
