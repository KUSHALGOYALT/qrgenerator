import { useState, useEffect } from 'react'
import { Settings, Mail, AlertTriangle, Building2, Eye, CheckCircle, Clock, XCircle } from 'lucide-react'
import { sitesAPI, incidentsAPI, notificationEmailsAPI } from '../services/api'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    sites: 0,
    totalIncidents: 0,
    openIncidents: 0,
    resolvedIncidents: 0,
    closedIncidents: 0,
    emails: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const [sitesRes, incidentsRes, emailsRes] = await Promise.all([
        sitesAPI.getAll(),
        incidentsAPI.getAll(),
        notificationEmailsAPI.getAll()
      ])
      
      const sites = sitesRes.data.results || sitesRes.data
      const incidents = incidentsRes.data.results || incidentsRes.data
      const emails = emailsRes.data.results || emailsRes.data
      
      // Calculate incident statistics
      const openIncidents = incidents.filter(incident => incident.status === 'open').length
      const resolvedIncidents = incidents.filter(incident => incident.status === 'resolved').length
      const closedIncidents = incidents.filter(incident => incident.status === 'closed').length
      
      setStats({
        sites: sites.length,
        totalIncidents: incidents.length,
        openIncidents,
        resolvedIncidents,
        closedIncidents,
        emails: emails.length
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }



  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overview of your HSE portal system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sites</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.sites}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Incidents</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalIncidents}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <Clock className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Open Incidents</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.openIncidents}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.resolvedIncidents}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notification Email Management */}
        <div className="card">
          <div className="flex items-center mb-4">
            <Mail className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Notification Emails</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Manage email notifications for incident reports. Add, remove, or modify email addresses that receive notifications.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Currently configured: <span className="font-medium text-blue-600">{stats.emails} email(s)</span>
          </p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.href = '/admin?tab=emails'}
              className="btn-primary w-full text-center"
            >
              Manage Notification Emails
            </button>
          </div>
        </div>

        {/* Quick Access */}
        <div className="card">
          <div className="flex items-center mb-4">
            <Settings className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Quick Access</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Access key management features for your safety system.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => window.location.href = '/admin?tab=sites'}
              className="btn-secondary text-sm py-2"
            >
              Manage Sites
            </button>
            <button
              onClick={() => window.location.href = '/admin?tab=incidents'}
              className="btn-secondary text-sm py-2"
            >
              View Incidents
            </button>
            <button
              onClick={() => window.location.href = '/admin?tab=contacts'}
              className="btn-secondary text-sm py-2"
            >
              Emergency Contacts
            </button>
            <button
              onClick={() => window.location.href = '/admin?tab=qr'}
              className="btn-secondary text-sm py-2"
            >
              QR Codes
            </button>
          </div>
        </div>
      </div>

      {/* Incident Status Summary */}
      {stats.totalIncidents > 0 && (
        <div className="card">
          <div className="flex items-center mb-4">
            <Eye className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Incident Status Summary</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.openIncidents}</div>
              <div className="text-sm text-yellow-700">Open</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalIncidents - stats.openIncidents - stats.resolvedIncidents - stats.closedIncidents}</div>
              <div className="text-sm text-blue-700">In Progress</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.resolvedIncidents}</div>
              <div className="text-sm text-green-700">Resolved</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{stats.closedIncidents}</div>
              <div className="text-sm text-gray-700">Closed</div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default AdminDashboard 