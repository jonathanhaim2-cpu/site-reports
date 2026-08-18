import { useState } from 'react'
import { APPS_SCRIPT_URL, SITES, CONTRACTOR_COMPANIES } from './config.js'

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const OTHER_COMPANY = '__other__'

function emptyRow() {
  return { id: crypto.randomUUID(), company: '', customCompany: '', workers: '' }
}

function resolveCompany(row) {
  return row.company === OTHER_COMPANY ? row.customCompany : row.company
}

export default function ReportForm() {
  const [date, setDate] = useState(todayISO())
  const [site, setSite] = useState(SITES[0] || '')
  const [foreman, setForeman] = useState(localStorage.getItem('foremanName') || '')
  const [rows, setRows] = useState([emptyRow()])
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | done | error

  function updateRow(id, field, value) {
    setRows(rs => rs.map(r => (r.id === id ? { ...r, [field]: value } : r)))
  }

  function addRow() {
    setRows(rs => [...rs, emptyRow()])
  }

  function removeRow(id) {
    setRows(rs => (rs.length > 1 ? rs.filter(r => r.id !== id) : rs))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!site || !foreman.trim()) return

    const validRows = rows.filter(r => resolveCompany(r).trim() && r.workers)
    if (validRows.length === 0) {
      alert('יש להזין לפחות שורת חברה אחת עם מספר עובדים')
      return
    }

    localStorage.setItem('foremanName', foreman.trim())
    setStatus('sending')

    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          date,
          site,
          foreman: foreman.trim(),
          notes: notes.trim(),
          rows: validRows.map(r => ({
            company: resolveCompany(r).trim(),
            workers: Number(r.workers),
          })),
        }),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || 'שגיאה')
      setStatus('done')
      setRows([emptyRow()])
      setNotes('')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className="page center">
        <div className="card success">
          <h2>הדיווח נשלח בהצלחה ✓</h2>
          <p>תאריך: {date} | אתר: {site}</p>
          <button className="btn" onClick={() => setStatus('idle')}>דיווח נוסף</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="card">
        <div className="brand-header">
          <img src="/logo.png" alt="קל פלד" className="brand-logo" />
          <h1>דיווח יומי - אתר בנייה</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>תאריך</span>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </label>

          <label className="field">
            <span>אתר</span>
            <select value={site} onChange={e => setSite(e.target.value)} required>
              {SITES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>

          <label className="field">
            <span>שם מנהל העבודה</span>
            <input type="text" value={foreman} onChange={e => setForeman(e.target.value)} placeholder="שם מלא" required />
          </label>

          <h3 className="section-title">חברות קבלן שהגיעו היום</h3>

          {rows.map((row, i) => (
            <div className="row-group" key={row.id}>
              <label className="field">
                <span>חברה #{i + 1}</span>
                <select
                  value={row.company}
                  onChange={e => updateRow(row.id, 'company', e.target.value)}
                >
                  <option value="" disabled>בחר חברה</option>
                  {CONTRACTOR_COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value={OTHER_COMPANY}>אחר...</option>
                </select>
              </label>

              {row.company === OTHER_COMPANY && (
                <label className="field">
                  <span>שם החברה</span>
                  <input
                    type="text"
                    value={row.customCompany}
                    onChange={e => updateRow(row.id, 'customCompany', e.target.value)}
                    placeholder="הקלד שם חברה"
                    autoFocus
                  />
                </label>
              )}
              <div className="row-inline">
                <label className="field small">
                  <span>כמות עובדים</span>
                  <input
                    type="number" min="0" inputMode="numeric"
                    value={row.workers}
                    onChange={e => updateRow(row.id, 'workers', e.target.value)}
                  />
                </label>
                {rows.length > 1 && (
                  <button type="button" className="btn-remove" onClick={() => removeRow(row.id)} aria-label="הסר">✕</button>
                )}
              </div>
            </div>
          ))}

          <button type="button" className="btn-secondary" onClick={addRow}>+ הוסף חברה נוספת</button>

          <label className="field">
            <span>הערות (לא חובה)</span>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
          </label>

          {status === 'error' && <p className="error-msg">שליחה נכשלה, נסה שוב</p>}

          <button type="submit" className="btn" disabled={status === 'sending'}>
            {status === 'sending' ? 'שולח...' : 'שלח דיווח'}
          </button>
        </form>
      </div>
    </div>
  )
}
