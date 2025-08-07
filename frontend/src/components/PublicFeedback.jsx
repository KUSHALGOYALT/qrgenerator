import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Phone, AlertTriangle, Shield, Eye, Send } from 'lucide-react'
import { sitesAPI, incidentsAPI, incidentTypesAPI } from '../services/api'
import IncidentModal from './IncidentModal'
import EmergencyContactsModal from './EmergencyContactsModal'
import Logo from './Logo'

const PublicFeedback = () => {
  const { siteId } = useParams()
  const [site, setSite] = useState(null)
  const [incidentTypes, setIncidentTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showIncidentModal, setShowIncidentModal] = useState(false)
  const [showContactsModal, setShowContactsModal] = useState(false)
  const [selectedIncidentType, setSelectedIncidentType] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetchSiteData()
  }, [siteId])

  const fetchSiteData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch site and incident types in parallel
      const [siteResponse, typesResponse] = await Promise.all([
        sitesAPI.getById(siteId),
        incidentTypesAPI.getAll({ site: siteId })
      ])
      
      setSite(siteResponse.data)
      
      // Filter only active incident types and sort by order
      const activeTypes = (typesResponse.data.results || typesResponse.data)
        .filter(type => type.is_active)
        .sort((a, b) => a.order - b.order)
      
      setIncidentTypes(activeTypes)
    } catch (error) {
      console.error('Error fetching site data:', error)
      setError('Failed to load site information. Please try again.')
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

  // Icon mapping for incident types
  const getIconForType = (typeName) => {
    const iconMap = {
      'unsafe_conditions': AlertTriangle,
      'unsafe_actions': Shield,
      'near_miss': Eye,
      'general_feedback': Send,
    }
    return iconMap[typeName] || Send
  }

  // Color mapping for incident types
  const getColorForType = (typeName) => {
    const colorMap = {
      'unsafe_conditions': 'bg-red-500',
      'unsafe_actions': 'bg-orange-500',
      'near_miss': 'bg-yellow-500',
      'general_feedback': 'bg-blue-500',
    }
    return colorMap[typeName] || 'bg-gray-500'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchSiteData}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!site) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Site Not Found</h1>
          <p className="text-gray-600 mb-4">The requested site could not be found.</p>
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
              className="btn-primary w-full flex items-center justify-center"
            >
              Submit Another Response
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Logo size="xxlarge" showLogoOnly={true} />
            <div className="flex flex-col items-end text-right">
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

        {/* Incident Types Grid */}
        {incidentTypes.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {incidentTypes.map((incidentType) => {
              const IconComponent = getIconForType(incidentType.name)
              const colorClass = getColorForType(incidentType.name)
              
              return (
                <div
                  key={incidentType.id}
                  onClick={() => handleIncidentTypeClick(incidentType)}
                  className="card cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${colorClass} text-white`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {incidentType.display_name}
                      </h3>
                      <p className="text-gray-600">
                        {incidentType.description || 'Report an incident or provide feedback'}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <AlertTriangle className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Feedback Forms Available</h3>
            <p className="text-gray-600">
              No feedback forms have been configured for this site. Please contact the administrator.
            </p>
          </div>
        )}

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