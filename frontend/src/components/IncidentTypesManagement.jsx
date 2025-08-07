import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, AlertTriangle, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react'
import { incidentTypesAPI, sitesAPI } from '../services/api'

const IncidentTypesManagement = () => {
  const [incidentTypes, setIncidentTypes] = useState([])
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingType, setEditingType] = useState(null)
  const [selectedSite, setSelectedSite] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    requires_criticality: true,
    is_active: true,
    order: 0,
    icon: 'AlertTriangle',
    color: 'bg-red-500'
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [typesRes, sitesRes] = await Promise.all([
        incidentTypesAPI.getAll(),
        sitesAPI.getAll()
      ])
      
      const typesData = typesRes.data.results || typesRes.data
      const sitesData = sitesRes.data.results || sitesRes.data
      
      console.log('Fetched incident types:', typesData)
      console.log('Fetched sites:', sitesData)
      
      setIncidentTypes(typesData)
      setSites(sitesData)
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load incident types')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateType = () => {
    setEditingType(null)
    setFormData({
      name: '',
      display_name: '',
      description: '',
      requires_criticality: true,
      is_active: true,
      order: 0,
      icon: 'AlertTriangle',
      color: 'bg-red-500'
    })
    setShowModal(true)
  }

  const handleEditType = (type) => {
    setEditingType(type)
    setFormData({
      name: type.name,
      display_name: type.display_name,
      description: type.description || '',
      requires_criticality: type.requires_criticality,
      is_active: type.is_active,
      order: type.order,
      icon: type.icon || 'AlertTriangle',
      color: type.color || 'bg-red-500'
    })
    setSelectedSite(type.site)
    setShowModal(true)
  }

  const handleToggleActive = async (type) => {
    const action = type.is_active ? 'disable' : 'enable'
    const confirmMessage = type.is_active 
      ? 'Are you sure you want to disable this incident type? It will no longer appear on the public site.'
      : 'Are you sure you want to enable this incident type? It will now appear on the public site.'

    if (window.confirm(confirmMessage)) {
      try {
        await incidentTypesAPI.update(type.id, {
          ...type,
          is_active: !type.is_active
        })
        fetchData()
      } catch (error) {
        console.error('Error updating incident type:', error)
        setError(`Failed to ${action} incident type`)
      }
    }
  }

  const handleDeleteType = async (typeId) => {
    if (window.confirm('Are you sure you want to permanently delete this incident type? This action cannot be undone and will remove all associated data.')) {
      try {
        await incidentTypesAPI.delete(typeId)
        fetchData()
      } catch (error) {
        console.error('Error deleting incident type:', error)
        setError('Failed to delete incident type')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedSite) {
      setError('Please select a site')
      return
    }

    try {
      const data = {
        ...formData,
        site: selectedSite
      }

      if (editingType) {
        await incidentTypesAPI.update(editingType.id, data)
      } else {
        await incidentTypesAPI.create(data)
      }
      
      setShowModal(false)
      fetchData()
    } catch (error) {
      console.error('Error saving incident type:', error)
      setError('Failed to save incident type')
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingType(null)
    setFormData({
      name: '',
      display_name: '',
      description: '',
      requires_criticality: true,
      is_active: true,
      order: 0,
      icon: 'AlertTriangle',
      color: 'bg-red-500'
    })
    setSelectedSite('')
    setError('')
  }

  // Filter by site first
  let filteredTypes = selectedSite && selectedSite !== ""
    ? incidentTypes.filter(type => type.site === selectedSite)
    : incidentTypes

  // Optionally hide disabled types from admin view
  // Uncomment the next line if you want to hide disabled types
  // filteredTypes = filteredTypes.filter(type => type.is_active)

  console.log('Selected site:', selectedSite)
  console.log('Total incident types:', incidentTypes.length)
  console.log('Filtered incident types:', filteredTypes.length)

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
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Incident Types Management</h1>
          <button
            onClick={handleCreateType}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Incident Type
          </button>
        </div>
        <p className="mt-2 text-gray-600">
          Manage incident types for each site. Disabled types will not appear on the public site but data is preserved.
        </p>
      </div>

      {/* Site Filter */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by Site:</label>
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Sites</option>
            {sites.map(site => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Incident Types List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTypes.map((type) => (
          <div key={type.id} className={`card ${!type.is_active ? 'opacity-60' : ''}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{type.display_name}</h3>
                <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                <p className="text-xs text-gray-500 mt-1">Site: {sites.find(s => s.id === type.site)?.name || 'Unknown'}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditType(type)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Edit Incident Type"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleToggleActive(type)}
                  className={`p-2 transition-colors ${
                    type.is_active 
                      ? 'text-gray-400 hover:text-orange-600' 
                      : 'text-orange-600 hover:text-orange-700'
                  }`}
                  title={type.is_active ? 'Disable Incident Type' : 'Enable Incident Type'}
                >
                  {type.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => handleDeleteType(type.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Permanently Delete Incident Type"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                type.requires_criticality ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {type.requires_criticality ? 'Requires Criticality' : 'No Criticality'}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                type.is_active ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
              }`}>
                {type.is_active ? 'Active' : 'Disabled'}
              </span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Order: {type.order}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>Icon: {type.icon || 'AlertTriangle'}</span>
              <span>Color: {type.color || 'bg-red-500'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTypes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Incident Types Found</h3>
          <p className="text-gray-600 mb-6">
            {selectedSite 
              ? 'No incident types have been created for this site yet.'
              : 'No incident types have been created yet.'
            }
          </p>
          <button
            onClick={handleCreateType}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <Plus className="h-4 w-4" />
            Create First Incident Type
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">
                {editingType ? 'Edit Incident Type' : 'Add Incident Type'}
              </h3>
              <button
                onClick={handleModalClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site *
                </label>
                <select
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a site</option>
                  {sites.map(site => (
                    <option key={site.id} value={site.id}>
                      {site.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., unsafe_conditions"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Unsafe Conditions"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe this incident type..."
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="AlertTriangle">AlertTriangle</option>
                  <option value="Shield">Shield</option>
                  <option value="Eye">Eye</option>
                  <option value="Send">Send</option>
                  <option value="AlertCircle">AlertCircle</option>
                  <option value="Bell">Bell</option>
                  <option value="Bug">Bug</option>
                  <option value="Camera">Camera</option>
                  <option value="CheckCircle">CheckCircle</option>
                  <option value="Clock">Clock</option>
                  <option value="Factory">Factory</option>
                  <option value="Flame">Flame</option>
                  <option value="Heart">Heart</option>
                  <option value="Info">Info</option>
                  <option value="Lightbulb">Lightbulb</option>
                  <option value="MessageCircle">MessageCircle</option>
                  <option value="Settings">Settings</option>
                  <option value="Tool">Tool</option>
                  <option value="Wrench">Wrench</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <select
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bg-red-500">Red</option>
                  <option value="bg-orange-500">Orange</option>
                  <option value="bg-yellow-500">Yellow</option>
                  <option value="bg-green-500">Green</option>
                  <option value="bg-blue-500">Blue</option>
                  <option value="bg-purple-500">Purple</option>
                  <option value="bg-pink-500">Pink</option>
                  <option value="bg-gray-500">Gray</option>
                </select>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.requires_criticality}
                    onChange={(e) => setFormData({...formData, requires_criticality: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Requires Criticality</span>
                </label>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active (Visible on Public Site)</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {editingType ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default IncidentTypesManagement 