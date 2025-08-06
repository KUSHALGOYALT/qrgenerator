import { useState, useEffect } from 'react'
import { AlertTriangle, Eye, Filter, Image, CheckCircle } from 'lucide-react'
import { incidentsAPI, sitesAPI } from '../services/api'
import IncidentImageModal from './IncidentImageModal'

const IncidentsManagement = () => {
  const [incidents, setIncidents] = useState([])
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSite, setSelectedSite] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
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
      console.log('Fetched incidents:', incidentsResponse.data)
      console.log('First incident images:', incidentsResponse.data[0]?.images)
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

  const getStatusColor = (status) => {
    const colors = {
      'open': 'text-red-600 bg-red-100',
      'in_progress': 'text-yellow-600 bg-yellow-100',
      'resolved': 'text-green-600 bg-green-100',
      'closed': 'text-gray-600 bg-gray-100',
    }
    return colors[status] || 'text-gray-600 bg-gray-100'
  }

  const getStatusLabel = (status) => {
    const labels = {
      'open': 'Open',
      'in_progress': 'In Progress',
      'resolved': 'Resolved',
      'closed': 'Closed',
    }
    return labels[status] || status
  }

  const handleImageClick = (imageUrl) => {
    console.log('Image clicked:', imageUrl)
    setSelectedImage(imageUrl)
  }

  const handleStatusChange = async (incidentId, newStatus) => {
    try {
      console.log('Updating incident status:', incidentId, 'to:', newStatus)
      await incidentsAPI.update(incidentId, { status: newStatus })
      
      // Update the incident in local state
      setIncidents(prevIncidents => 
        prevIncidents.map(incident => 
          incident.id === incidentId 
            ? { ...incident, status: newStatus }
            : incident
        )
      )
    } catch (error) {
      console.error('Error updating incident status:', error)
      console.error('Error details:', error.response?.data)
    }
  }

  const filteredIncidents = incidents.filter(incident => {
    // Always exclude closed incidents unless specifically filtering for them
    if (incident.status === 'closed' && selectedStatus !== 'closed') return false
    if (selectedSite && incident.site !== selectedSite) return false
    if (selectedType && incident.incident_type !== selectedType) return false
    if (selectedStatus && incident.status !== selectedStatus) return false
    return true
  })

  const sitesSorted = [...sites].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Incidents Management</h2>
          
          {/* Filters - Mobile Responsive */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            {/* Site Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
              >
                <option value="">All Sites</option>
                {sitesSorted.map(site => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center space-x-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
              >
                <option value="">All Types</option>
                <option value="unsafe_conditions">Unsafe Conditions</option>
                <option value="unsafe_actions">Unsafe Actions</option>
                <option value="near_miss">Near Miss</option>
                <option value="general_feedback">General Feedback</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading incidents...</p>
        </div>
      )}

      {/* Incidents List */}
      <div className="space-y-4">
        {filteredIncidents.map(incident => (
          <div key={incident.id} className="bg-white rounded-lg border p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {getIncidentTypeLabel(incident.incident_type)}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">{incident.site_name}</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                    {getStatusLabel(incident.status)}
                  </span>
                  {incident.criticality && incident.incident_type !== 'general_feedback' && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCriticalityColor(incident.criticality)}`}>
                      {incident.criticality_display}
                    </span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Eye className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{incident.is_anonymous ? 'Anonymous' : incident.reporter_name}</span>
                  </div>
                  <select
                    value={incident.status}
                    onChange={(e) => handleStatusChange(incident.id, e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-0"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-700 mb-3 break-words">{incident.description}</p>
              
              {/* Multiple Images Display */}
              {incident.images && incident.images.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Image className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Attached Images ({incident.images.length}):
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                    {incident.images.map((image, index) => {
                      console.log('Rendering image:', image.image_url, 'Index:', index)
                      return (
                        <div key={image.id || index} className="relative">
                          <img
                            src={image.image_url}
                            alt={`Incident ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleImageClick(image.image_url)}
                            onLoad={() => {
                              console.log('✅ Image loaded successfully:', image.image_url)
                              console.log('Image element:', document.querySelector(`img[src="${image.image_url}"]`))
                            }}
                            onError={(e) => {
                              console.error('❌ Image failed to load:', image.image_url, e)
                              console.error('Error details:', e.target.error)
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                            style={{ backgroundColor: 'transparent' }}
                          />
                          <div className="hidden w-full h-20 bg-gray-100 rounded-lg border flex items-center justify-center text-xs text-gray-500">
                            Failed to load
                          </div>
                          {image.caption && (
                            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                              {image.caption}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>{new Date(incident.created_at).toLocaleDateString()}</span>
              {incident.images && incident.images.length > 0 && (
                <button
                  onClick={() => handleImageClick(incident.images[0].image_url)}
                  className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                >
                  <Image className="h-3 w-3" />
                  <span>View Images ({incident.images.length})</span>
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