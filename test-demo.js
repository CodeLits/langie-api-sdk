#!/usr/bin/env node

import http from 'http'

const options = {
  hostname: 'localhost',
  port: 5174,
  path: '/',
  method: 'GET'
}

const req = http.request(options, (res) => {
  console.log(`Demo status: ${res.statusCode}`)
  if (res.statusCode === 200) {
    console.log('✅ Demo is running successfully!')
    console.log(
      '🌐 Open http://localhost:5174 in your browser to test the LanguageSelect component'
    )
  } else {
    console.log('❌ Demo might have issues')
  }
})

req.on('error', (e) => {
  console.log('❌ Demo is not running:', e.message)
  console.log('Run: cd examples/demo && bun run dev --port 5174')
})

req.end()
