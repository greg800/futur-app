import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
})

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const result = await pool.query(sql, params)
  return result.rows
}

export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const result = await pool.query(sql, params)
  return result.rows[0] ?? null
}

export async function execute(sql: string, params?: any[]): Promise<void> {
  await pool.query(sql, params)
}

export async function initSchema(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS entities (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      pseudo TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      entity_id INTEGER REFERENCES entities(id),
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'invite' CHECK(role IN ('invite','lecteur','admin')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS questions (
      id SERIAL PRIMARY KEY,
      section TEXT NOT NULL,
      preamble TEXT NOT NULL,
      text TEXT NOT NULL,
      position INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      question_id INTEGER NOT NULL REFERENCES questions(id),
      answer TEXT CHECK(answer IN ('oui','non','sans_position')),
      comment TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, question_id)
    );
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      used INTEGER NOT NULL DEFAULT 0
    );
  `)
}
