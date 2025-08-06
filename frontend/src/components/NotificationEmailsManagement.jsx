import { useState, useEffect } from 'react'
import { Plus, Trash2, Mail, AlertCircle } from 'lucide-react'
import { notificationEmailsAPI } from '../services/api'

const NotificationEmailsManagement = () => {
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)
  const [newEmail, setNewEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchEmails()
  }, [])

  const fetchEmails = async () => {
    try {
      setLoading(true)
      const response = await notificationEmailsAPI.getAll()
      setEmails(response.data.results || response.data)
    } catch (error) {
      console.error('Error fetching notification emails:', error)
      setError('Failed to load notification emails')
    } finally {
      setLoading(false)
    }
  }

  const handleAddEmail = async (e) => {
    e.preventDefault()
    
    if (!newEmail.trim()) {
      setError('Please enter an email address')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail.trim())) {
      setError('Please enter a valid email address')
      return
    }

    try {
      await notificationEmailsAPI.create({ email: newEmail.trim() })
      setNewEmail('')
      setSuccess('Email added successfully!')
      setError('')
      fetchEmails()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error adding email:', error)
      if (error.response?.data?.email) {
        setError('This email is already registered')
      } else {
        setError('Failed to add email')
      }
      setSuccess('')
    }
  }

  const handleDeleteEmail = async (emailId) => {
    if (window.confirm('Are you sure you want to remove this notification email?')) {
      try {
        await notificationEmailsAPI.delete(emailId)
        setSuccess('Email removed successfully!')
        setError('')
        fetchEmails()
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000)
      } catch (error) {
        console.error('Error deleting email:', error)
        setError('Failed to remove email')
        setSuccess('')
      }
    }
  }

  const handleEmailChange = (e) => {
    setNewEmail(e.target.value)
    setError('') // Clear error when user starts typing
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Mail className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Notification Emails</h1>
        </div>
        <p className="text-gray-600">
          Manage email addresses that will receive notifications when incidents are reported.
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Email Form */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Notification Email</h2>
        <form onSubmit={handleAddEmail} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="flex space-x-2">
              <input
                type="email"
                id="email"
                value={newEmail}
                onChange={handleEmailChange}
                placeholder="Enter email address"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Email List */}
      <div className="bg-white rounded-lg border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Notification Emails ({emails.length})</h2>
        </div>
        
        {emails.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notification emails</h3>
            <p className="text-gray-600">
              Add email addresses to receive incident notifications.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {emails.map((email) => (
              <div key={email.id} className="px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900">{email.email}</span>
                </div>
                <button
                  onClick={() => handleDeleteEmail(email.id)}
                  className="text-red-600 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                  title="Remove email"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">How it works</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>• All incident reports will be automatically sent to these email addresses</p>
              <p>• Emails include incident details like site, type, description, and reporter information</p>
              <p>• You can add or remove email addresses at any time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationEmailsManagement 