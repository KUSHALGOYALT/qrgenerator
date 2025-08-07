import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { incidentTypesAPI } from '../services/api'

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
    order: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [typesRes, sitesRes] = await Promise.all([
        incidentTypesAPI.getAll(),
        fetch('/hex/api/sites/').then(res => res.json())
      ])
      
      setIncidentTypes(typesRes.data.results || typesRes.data)
      setSites(sitesRes.results || sitesRes)
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
      order: 0
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
      order: type.order
    })
    setSelectedSite(type.site)
    setShowModal(true)
  }

  const handleDeleteType = async (typeId) => {
    if (window.confirm('Are you sure you want to delete this incident type?')) {
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
      order: 0
    })
    setSelectedSite('')
    setError('')
  }

  const filteredTypes = selectedSite 
    ? incidentTypes.filter(type => type.site === selectedSite)
    : incidentTypes

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
          Manage incident types for each site. Each site can have its own customized list of incident types.
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
          <div key={type.id} className="card">
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
                  onClick={() => handleDeleteType(type.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete Incident Type"
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
                type.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {type.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="text-xs text-gray-500">
              Order: {type.order}
            </div>
          </div>
        ))}
      </div>

      {filteredTypes.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No incident types found</h3>
          <p className="text-gray-600">
            {incidentTypes.length === 0 
              ? 'No incident types have been created yet.'
              : 'No incident types match the current filter.'
            }
          </p>
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
                  rows="3"
                  placeholder="Description of this incident type"
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
                  min="0"
                />
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
                  <span className="ml-2 text-sm text-gray-700">Active</span>
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