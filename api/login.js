import crypto from 'crypto'

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', chunk => { data += chunk })
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

function makeToken(secret) {
  const expires = Date.now() + 8 * 60 * 60 * 1000 // 8 hours
  const sig = crypto.createHmac('sha256', secret).update(String(expires)).digest('hex')
  return `${expires}.${sig}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  let body = {}
  try {
    const raw = await readBody(req)
    body = JSON.parse(raw)
  } catch {}

  const PASS = process.env.DASHBOARD_PASSWORD
  const SECRET = process.env.JWT_SECRET || PASS

  if (!PASS || body.password !== PASS) {
    return res.status(401).json({ error: 'wrong password' })
  }

  res.status(200).json({ token: makeToken(SECRET) })
}
