import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AdminPortal from './components/AdminPortal'
import PublicFeedback from './components/PublicFeedback'
import Layout from './components/Layout'
import EmergencyContactsManagement from './components/EmergencyContactsManagement'
import IncidentsManagement from './components/IncidentsManagement'
import QRCodeManagement from './components/QRCodeManagement'
import HomePage from './components/HomePage'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Layout><AdminPortal /></Layout>} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/admin" element={<Layout><AdminPortal /></Layout>} />
          <Route path="/admin/contacts" element={<Layout><EmergencyContactsManagement /></Layout>} />
          <Route path="/admin/incidents" element={<Layout><IncidentsManagement /></Layout>} />
          <Route path="/admin/qr-codes" element={<Layout><QRCodeManagement /></Layout>} />
          <Route path="/public/:siteId" element={<PublicFeedback />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App 