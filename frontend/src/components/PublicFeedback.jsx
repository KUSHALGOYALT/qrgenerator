import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Phone, AlertTriangle, Shield, Eye, Send, Home } from 'lucide-react'
import { sitesAPI, incidentsAPI } from '../services/api'
import IncidentModal from './IncidentModal'
import EmergencyContactsModal from './EmergencyContactsModal'
import Logo from './Logo'

const PublicFeedback = () => {
  const { siteId } = useParams()
  const [site, setSite] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showIncidentModal, setShowIncidentModal] = useState(false)
  const [showContactsModal, setShowContactsModal] = useState(false)
  const [selectedIncidentType, setSelectedIncidentType] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetchSite()
  }, [siteId])

  const fetchSite = async () => {
    try {
      setLoading(true)
      const response = await sitesAPI.getById(siteId)
      setSite(response.data)
    } catch (error) {
      console.error('Error fetching site:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleIncidentTypeClick = (type) => {
    setSelectedIncidentType(type)
    setShowIncidentModal(true)
  }

  const handleIncidentSubmitted = () => {
    setShowIncidentModal(false)
    setSelectedIncidentType(null)
    setSubmitted(true)
  }

  const handleNewSubmission = () => {
    setSubmitted(false)
  }

  const handleGoHome = () => {
    window.location.href = '/home'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!site) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Site Not Found</h1>
          <p className="text-gray-600 mb-4">The requested site could not be found.</p>
          <button onClick={handleGoHome} className="btn-primary">
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </button>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-green-500 mb-4">
            <Send className="h-12 w-12 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-600 mb-6">
            Your feedback has been submitted successfully. We appreciate you taking the time to help improve safety.
          </p>
          <div className="space-y-3">
            <button
              onClick={handleNewSubmission}
              className="btn-primary w-full"
            >
              Submit Another Response
            </button>
            <button
              onClick={handleGoHome}
              className="btn-secondary w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  const incidentTypes = [
    {
      type: 'unsafe_conditions',
      title: 'Unsafe Conditions',
      description: 'Report hazardous conditions or unsafe environments',
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
    {
      type: 'unsafe_actions',
      title: 'Unsafe Actions',
      description: 'Report unsafe behaviors or actions',
      icon: Shield,
      color: 'bg-orange-500',
    },
    {
      type: 'near_miss',
      title: 'Near Miss',
      description: 'Report incidents that almost happened',
      icon: Eye,
      color: 'bg-yellow-500',
    },
    {
      type: 'general_feedback',
      title: 'General Feedback',
      description: 'Provide general safety feedback or suggestions',
      icon: Send,
      color: 'bg-blue-500',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-start space-x-8 mb-6">
            <Logo size="xxlarge" showLogoOnly={true} />
            <div className="flex flex-col justify-center pt-2">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{site.name}</h1>
              <p className="text-gray-600">{site.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Report a Safety Issue
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Help us maintain a safe environment by reporting any safety concerns, 
            incidents, or providing feedback. All reports are handled confidentially.
          </p>
        </div>

        {/* Emergency Contacts Button */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowContactsModal(true)}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <Phone className="h-4 w-4" />
            Emergency Contacts
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {incidentTypes.map((incidentType) => (
            <div
              key={incidentType.type}
              onClick={() => handleIncidentTypeClick(incidentType.type)}
              className="card cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${incidentType.color} text-white`}>
                  <incidentType.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {incidentType.title}
                  </h3>
                  <p className="text-gray-600">
                    {incidentType.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            All reports are handled confidentially. Anonymous reporting is available.
          </p>
        </div>
      </div>

      {/* Modals */}
      {showIncidentModal && selectedIncidentType && (
        <IncidentModal
          site={site}
          incidentType={selectedIncidentType}
          onClose={() => setShowIncidentModal(false)}
          onSubmitted={handleIncidentSubmitted}
        />
      )}

      {showContactsModal && (
        <EmergencyContactsModal
          site={site}
          onClose={() => {
            console.log('Closing emergency contacts modal')
            setShowContactsModal(false)
          }}
        />
      )}
    </div>
  )
}

export default PublicFeedback 