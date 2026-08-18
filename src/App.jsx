import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ReportForm from './ReportForm.jsx'
import Dashboard from './Dashboard.jsx'
import LoginPage from './LoginPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ReportForm />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
