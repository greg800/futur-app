#!/usr/bin/env node
const { spawn } = require('child_process')

const port = process.env.PORT || 3001

// Start Next.js immediately so the health check passes
const next = spawn('node', ['node_modules/.bin/next', 'start', '-p', String(port)], {
  stdio: 'inherit',
  cwd: __dirname,
  env: process.env,
})
next.on('exit', (code) => process.exit(code || 0))

// Run seed in background — non-blocking
const seed = spawn('node', ['scripts/seed.js'], { stdio: 'inherit', cwd: __dirname, env: process.env })
seed.on('exit', (code) => {
  if (code !== 0) console.error(`Seed exited with code ${code}`)
})
