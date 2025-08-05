import { useState, useEffect } from 'react'
import { AlertTriangle, Eye, Filter, Image } from 'lucide-react'
import { incidentsAPI, sitesAPI } from '../services/api'
import IncidentImageModal from './IncidentImageModal'

const IncidentsManagement = () => {
  const [incidents, setIncidents] = useState([])
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSite, setSelectedSite] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [incidentsResponse, sitesResponse] = await Promise.all([
        incidentsAPI.getAll(),
        sitesAPI.getAll()
      ])
      setIncidents(incidentsResponse.data.results || incidentsResponse.data)
      setSites(sitesResponse.data.results || sitesResponse.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSiteName = (siteId) => {
    const site = sites.find(s => s.id === siteId)
    return site ? site.name : 'Unknown Site'
  }

  const getIncidentTypeLabel = (type) => {
    const types = {
      'unsafe_conditions': 'Unsafe Conditions',
      'unsafe_actions': 'Unsafe Actions',
      'near_miss': 'Near Miss',
      'general_feedback': 'General Feedback',
    }
    return types[type] || type
  }

  const getCriticalityColor = (criticality) => {
    const colors = {
      'low': 'text-green-600 bg-green-100',
      'medium': 'text-yellow-600 bg-yellow-100',
      'high': 'text-orange-600 bg-orange-100',
      'critical': 'text-red-600 bg-red-100',
    }
    return colors[criticality] || 'text-gray-600 bg-gray-100'
  }

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl)
  }

  const filteredIncidents = incidents.filter(incident => {
    if (selectedSite && incident.site !== selectedSite) return false
    if (selectedType && incident.incident_type !== selectedType) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Incidents</h1>
        </div>
        <p className="mt-2 text-gray-600">
          View all reported incidents across all sites.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-4">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
          
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="input-field max-w-xs"
          >
            <option value="">All Sites</option>
            {sites.sort((a, b) => a.name.localeCompare(b.name)).map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="input-field max-w-xs"
          >
            <option value="">All Types</option>
            <option value="unsafe_conditions">Unsafe Conditions</option>
            <option value="unsafe_actions">Unsafe Actions</option>
            <option value="near_miss">Near Miss</option>
            <option value="general_feedback">General Feedback</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredIncidents.map((incident) => (
          <div key={incident.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-gray-500" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {getIncidentTypeLabel(incident.incident_type)}
                  </h3>
                  {incident.incident_type !== 'general_feedback' && incident.criticality && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCriticalityColor(incident.criticality)}`}>
                      {incident.criticality_display}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{getSiteName(incident.site)}</p>
                <p className="text-gray-700">{incident.description}</p>
                
                {/* Image Display */}
                {incident.image && (
                  <div className="mt-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Image className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Attached Image:</span>
                    </div>
                    <div className="relative">
                      <img
                        src={incident.image}
                        alt="Incident"
                        className="w-32 h-24 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleImageClick(incident.image)}
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                      <div className="hidden w-32 h-24 bg-gray-100 rounded-lg border flex items-center justify-center text-xs text-gray-500">
                        Failed to load
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Eye className="h-4 w-4" />
                <span>{incident.is_anonymous ? 'Anonymous' : incident.reporter_name}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>{new Date(incident.created_at).toLocaleDateString()}</span>
              {incident.image && (
                <button
                  onClick={() => handleImageClick(incident.image)}
                  className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                >
                  <Image className="h-3 w-3" />
                  <span>View Image</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredIncidents.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No incidents found</h3>
          <p className="text-gray-600">
            {incidents.length === 0 
              ? 'No incidents have been reported yet.'
              : 'No incidents match the current filters.'
            }
          </p>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <IncidentImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  )
}

export default IncidentsManagement 