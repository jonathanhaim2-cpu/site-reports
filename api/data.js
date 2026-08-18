import crypto from 'crypto'

function verifyToken(token, secret) {
  if (!token) return false
  const [expires, sig] = token.split('.')
  if (!expires || !sig) return false
  if (Date.now() > Number(expires)) return false
  const expected = crypto.createHmac('sha256', secret).update(expires).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))
  } catch { return false }
}

export default async function handler(req, res) {
  const SECRET = process.env.JWT_SECRET || process.env.DASHBOARD_PASSWORD
  const token = (req.headers.authorization || '').replace('Bearer ', '')

  if (!verifyToken(token, SECRET)) return res.status(401).send('unauthorized')

  const url = process.env.SHEET_URL
  if (!url) return res.status(500).send('SHEET_URL not configured')

  try {
    const r = await fetch(url, { redirect: 'follow' })
    if (!r.ok) return res.status(502).send('upstream error')
    const text = await r.text()

    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store, max-age=0')
    res.status(200).send(text)
  } catch (e) {
    res.status(500).send('fetch error')
  }
}
