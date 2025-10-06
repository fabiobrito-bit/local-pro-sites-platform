import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import ClientLayout from './pages/client/ClientLayout'
import ClientDashboard from './pages/ClientDashboard'
import ClientContent from './pages/client/ClientContent'
import ClientChat from './pages/client/ClientChat'
import ClientAnalytics from './pages/client/ClientAnalytics'
import ClientFiles from './pages/client/ClientFiles'
import ClientProfile from './pages/client/ClientProfile'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/AdminDashboard'
import AdminClients from './pages/admin/AdminClients'
import AdminRequests from './pages/admin/AdminRequests'
import AdminWebsites from './pages/admin/AdminWebsites'
import AdminSupport from './pages/admin/AdminSupport'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminSettings from './pages/admin/AdminSettings'

function App() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />

        {/* Dashboard routes */}
        <Route
          path="/dashboard"
          element={user?.role === 'client' ? <ClientDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin"
          element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />}
        />
        </Route>

        {/* Default redirect */}
        <Route
          path="/"
          element={
            !user ? (
              <Navigate to="/login" />
            ) : user.role === 'admin' ? (
              <Navigate to="/admin" />
            ) : (
              <Navigate to="/client" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
