import { useState, useEffect } from 'react'
import { Settings, Mail, Users, AlertTriangle, Building2 } from 'lucide-react'
import { sitesAPI, incidentsAPI, contactsAPI, notificationEmailsAPI } from '../services/api'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    sites: 0,
    incidents: 0,
    contacts: 0,
    emails: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const [sitesRes, incidentsRes, contactsRes, emailsRes] = await Promise.all([
        sitesAPI.getAll(),
        incidentsAPI.getAll(),
        contactsAPI.getAll(),
        notificationEmailsAPI.getAll()
      ])
      
      const sites = sitesRes.data.results || sitesRes.data
      const incidents = incidentsRes.data.results || incidentsRes.data
      const contacts = contactsRes.data.results || contactsRes.data
      const emails = emailsRes.data.results || emailsRes.data
      
                    setStats({
                sites: sites.length,
                incidents: incidents.length,
                contacts: contacts.length,
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Incidents</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.incidents}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Emergency Contacts</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.contacts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 gap-6">
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
            <p className="text-xs text-gray-500 text-center">
              Opens frontend email management interface
            </p>
          </div>
        </div>
      </div>


    </div>
  )
}

export default AdminDashboard 