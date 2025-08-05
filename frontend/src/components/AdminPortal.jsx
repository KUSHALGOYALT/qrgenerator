import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, QrCode, Building2 } from 'lucide-react'
import { sitesAPI } from '../services/api'
import SiteModal from './SiteModal'
import QRCodeModal from './QRCodeModal'

const AdminPortal = () => {
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedSite, setSelectedSite] = useState(null)
  const [editingSite, setEditingSite] = useState(null)

  useEffect(() => {
    fetchSites()
  }, [])

  const fetchSites = async () => {
    try {
      setLoading(true)
      const response = await sitesAPI.getAll()
      setSites(response.data.results || response.data)
    } catch (error) {
      console.error('Error fetching sites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSite = () => {
    setEditingSite(null)
    setShowModal(true)
  }

  const handleEditSite = (site) => {
    setEditingSite(site)
    setShowModal(true)
  }

  const handleDeleteSite = async (siteId) => {
    if (window.confirm('Are you sure you want to delete this site?')) {
      try {
        await sitesAPI.delete(siteId)
        fetchSites()
      } catch (error) {
        console.error('Error deleting site:', error)
      }
    }
  }

  const handleShowQRCode = async (site) => {
    setSelectedSite(site)
    setShowQRModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingSite(null)
  }

  const handleSiteSaved = () => {
    fetchSites()
    handleModalClose()
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Site Management</h1>
          <button
            onClick={handleCreateSite}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Site
          </button>
        </div>
        <p className="mt-2 text-gray-600">
          Manage your sites and their associated emergency contacts and incidents.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sites.sort((a, b) => a.name.localeCompare(b.name)).map((site) => (
          <div key={site.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{site.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{site.address}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleShowQRCode(site)}
                  className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                  title="Generate QR Code"
                >
                  <QrCode className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleEditSite(site)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Edit Site"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteSite(site.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete Site"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="flex justify-between text-sm text-gray-500">
              <span>Created: {new Date(site.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {sites.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Building2 className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sites yet</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first site.</p>
          <button onClick={handleCreateSite} className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Site
          </button>
        </div>
      )}

      {showModal && (
        <SiteModal
          site={editingSite}
          onClose={handleModalClose}
          onSaved={handleSiteSaved}
        />
      )}

      {showQRModal && selectedSite && (
        <QRCodeModal
          site={selectedSite}
          onClose={() => setShowQRModal(false)}
        />
      )}
    </div>
  )
}

export default AdminPortal 