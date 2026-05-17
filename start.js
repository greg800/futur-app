#!/usr/bin/env node
// Lance le seed puis démarre Next.js
const { execSync, spawn } = require('child_process')
const path = require('path')

try {
  console.log('→ Seed database...')
  execSync('node scripts/seed.js', { stdio: 'inherit', cwd: __dirname })
} catch (e) {
  console.error('Seed error (non-fatal):', e.message)
}

const port = process.env.PORT || 3001
console.log(`→ Starting Next.js on port ${port}...`)

const next = spawn('node', ['node_modules/.bin/next', 'start', '-p', String(port)], {
  stdio: 'inherit',
  cwd: __dirname,
  env: process.env,
})

next.on('exit', (code) => process.exit(code || 0))
