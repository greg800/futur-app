#!/usr/bin/env node
// Lance le seed puis démarre Next.js
const { spawn } = require('child_process')
const path = require('path')

async function runSeed() {
  return new Promise((resolve, reject) => {
    const seed = spawn('node', ['scripts/seed.js'], { stdio: 'inherit', cwd: __dirname, env: process.env })
    seed.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`Seed exited with code ${code}`))
    })
  })
}

async function main() {
  try {
    console.log('→ Seed database...')
    await runSeed()
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
}

main()
