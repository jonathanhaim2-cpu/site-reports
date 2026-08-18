import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Papa from 'papaparse'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, Legend,
} from 'recharts'
import { AUTH_KEY, loadToken } from './LoginPage.jsx'

const COLORS = ['#00d4ff', '#a78bfa', '#10b981', '#f59e0b', '#ef4444', '#f97316', '#ec4899', '#14b8a6']

function useReports(token, onUnauth) {
  const [rows, setRows] = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)

  useEffect(() => {
    if (!token) return
    fetch('/api/data', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (r.status === 401) { onUnauth(); throw new Error('unauth') } return r.text() })
      .then(text => {
        const { data } = Papa.parse(text, { header: true, skipEmptyLines: true })
        const parsed = data.map(r => ({
          date: (r['תאריך'] || '').trim(),
          site: (r['אתר'] || '').trim(),
          foreman: (r['מנהל עבודה'] || '').trim(),
          company: (r['חברה'] || '').trim(),
          workers: Number(r['עובדים']) || 0,
          notes: (r['הערות'] || '').trim(),
        })).filter(r => r.date && r.site)
        setRows(parsed)
        setUpdatedAt(new Date())
      })
      .catch(() => {})
  }, [token])

  return { rows, updatedAt }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [token, setToken] = useState(() => loadToken())
  const handleUnauth = () => { localStorage.removeItem(AUTH_KEY); setToken(null) }

  useEffect(() => { if (!token) navigate('/login') }, [token, navigate])

  const { rows, updatedAt } = useReports(token, handleUnauth)

  const [siteFilter, setSiteFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const sites = useMemo(() => [...new Set((rows || []).map(r => r.site))].sort(), [rows])

  const filtered = useMemo(() => {
    if (!rows) return []
    return rows.filter(r =>
      (!siteFilter || r.site === siteFilter) &&
      (!fromDate || r.date >= fromDate) &&
      (!toDate || r.date <= toDate)
    )
  }, [rows, siteFilter, fromDate, toDate])

  const totalWorkers = filtered.reduce((s, r) => s + r.workers, 0)

  const byCompany = useMemo(() => {
    const map = {}
    filtered.forEach(r => {
      if (!map[r.company]) map[r.company] = { name: r.company, workers: 0 }
      map[r.company].workers += r.workers
    })
    return Object.values(map).sort((a, b) => b.workers - a.workers)
  }, [filtered])

  const byDate = useMemo(() => {
    const map = {}
    filtered.forEach(r => {
      if (!map[r.date]) map[r.date] = { date: r.date, workers: 0 }
      map[r.date].workers += r.workers
    })
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date))
  }, [filtered])

  if (!token) return null

  if (!rows) return (
    <div className="page center"><p>טוען נתונים...</p></div>
  )

  return (
    <div className="page">
      <div className="card">
        <div className="dash-header">
          <h1>📋 דשבורד דיווחי אתרים</h1>
          {updatedAt && <span className="muted">עודכן {updatedAt.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</span>}
        </div>

        <div className="filter-row">
          <label className="field small">
            <span>אתר</span>
            <select value={siteFilter} onChange={e => setSiteFilter(e.target.value)}>
              <option value="">כל האתרים</option>
              {sites.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="field small">
            <span>מתאריך</span>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          </label>
          <label className="field small">
            <span>עד תאריך</span>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
          </label>
        </div>

        <div className="kpi-row">
          <div className="kpi-card"><div className="kpi-value">{filtered.length}</div><div className="kpi-label">דיווחים</div></div>
          <div className="kpi-card"><div className="kpi-value">{totalWorkers}</div><div className="kpi-label">סה"כ עובדים (מצטבר)</div></div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-heading">עובדים לפי חברת קבלן</h2>
        <ResponsiveContainer width="100%" height={Math.max(200, byCompany.length * 48 + 40)}>
          <BarChart data={byCompany} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={140} />
            <Tooltip />
            <Legend />
            <Bar dataKey="workers" name="עובדים" fill={COLORS[0]} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2 className="card-heading">עובדים לפי תאריך</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={byDate} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="workers" name="עובדים" fill={COLORS[2]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2 className="card-heading">כל הדיווחים</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>תאריך</th><th>אתר</th><th>מנהל עבודה</th><th>חברה</th><th>עובדים</th><th>הערות</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice().reverse().map((r, i) => (
                <tr key={i}>
                  <td>{r.date}</td><td>{r.site}</td><td>{r.foreman}</td><td>{r.company}</td>
                  <td>{r.workers}</td><td>{r.notes}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="muted" style={{ textAlign: 'center' }}>אין נתונים להצגה</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
