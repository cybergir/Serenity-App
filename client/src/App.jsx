import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AppShell from './components/layout/AppShell'
import Home from './pages/Home'
import Tasks from './pages/Tasks'
import Capture from './pages/Capture'
import Insights from './pages/Insights'
import Vault from './pages/Vault'
import Presence from './pages/Presence'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex h-screen items-center justify-center text-slate-400">...</div>
  if (!user) return <Navigate to="/login" />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/" element={
        <ProtectedRoute>
          <AppShell />
        </ProtectedRoute>
      }>
        <Route index element={<Home />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="capture" element={<Capture />} />
        <Route path="insights" element={<Insights />} />
        <Route path="vault" element={<Vault />} />
        <Route path="presence" element={<Presence />} />
      </Route>
    </Routes>
  )
}