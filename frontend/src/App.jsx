import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AdminPortal from './components/AdminPortal'
import AdminDashboard from './components/AdminDashboard'
import PublicFeedback from './components/PublicFeedback'
import Layout from './components/Layout'
import EmergencyContactsManagement from './components/EmergencyContactsManagement'
import IncidentsManagement from './components/IncidentsManagement'
import Login from './components/Login'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public routes */}
          <Route path="/public/:siteId" element={<PublicFeedback />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected admin routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout><AdminDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute>
              <Layout><AdminPortal /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute>
              <Layout><AdminDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/sites" element={
            <ProtectedRoute>
              <Layout><AdminPortal /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/contacts" element={
            <ProtectedRoute>
              <Layout><EmergencyContactsManagement /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/incidents" element={
            <ProtectedRoute>
              <Layout><IncidentsManagement /></Layout>
            </ProtectedRoute>
          } />

        </Routes>
      </div>
    </Router>
  )
}

export default App 