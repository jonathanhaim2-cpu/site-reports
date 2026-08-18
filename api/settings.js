export default async function handler(req, res) {
  const url = process.env.SETTINGS_URL
  if (!url) return res.status(500).send('SETTINGS_URL not configured')

  try {
    const r = await fetch(url, { redirect: 'follow' })
    if (!r.ok) return res.status(502).send('upstream error')
    const text = await r.text()

    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    res.status(200).send(text)
  } catch (e) {
    res.status(500).send('fetch error')
  }
}
