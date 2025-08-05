import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Phone, User, Building2 } from 'lucide-react'
import { contactsAPI, sitesAPI } from '../services/api'
import ContactModal from './ContactModal'

const EmergencyContactsManagement = () => {
  const [contacts, setContacts] = useState([])
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingContact, setEditingContact] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [contactsResponse, sitesResponse] = await Promise.all([
        contactsAPI.getAll(),
        sitesAPI.getAll()
      ])
      setContacts(contactsResponse.data.results || contactsResponse.data)
      setSites(sitesResponse.data.results || sitesResponse.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateContact = () => {
    setEditingContact(null)
    setShowModal(true)
  }

  const handleEditContact = (contact) => {
    setEditingContact(contact)
    setShowModal(true)
  }

  const handleDeleteContact = async (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await contactsAPI.delete(contactId)
        fetchData()
      } catch (error) {
        console.error('Error deleting contact:', error)
      }
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingContact(null)
  }

  const handleContactSaved = () => {
    fetchData()
    handleModalClose()
  }

  const getSiteName = (siteId) => {
    const site = sites.find(s => s.id === siteId)
    return site ? site.name : 'Unknown Site'
  }

  // Group contacts by site
  const groupContactsBySite = () => {
    const grouped = {}
    
    // Initialize groups for all sites
    sites.forEach(site => {
      grouped[site.id] = {
        site: site,
        contacts: []
      }
    })
    
    // Add contacts to their respective sites
    contacts.forEach(contact => {
      if (grouped[contact.site]) {
        grouped[contact.site].contacts.push(contact)
      }
    })
    
    // Sort contacts within each site by name
    Object.values(grouped).forEach(group => {
      group.contacts.sort((a, b) => a.name.localeCompare(b.name))
    })
    
    // Sort sites by name
    return Object.values(grouped).sort((a, b) => a.site.name.localeCompare(b.site.name))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const groupedContacts = groupContactsBySite()

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Emergency Contacts</h1>
          <button
            onClick={handleCreateContact}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Contact
          </button>
        </div>
        <p className="mt-2 text-gray-600">
          Manage emergency contacts for each site.
        </p>
      </div>

      <div className="space-y-8">
        {groupedContacts.map((group) => (
          <div key={group.site.id} className="card">
            <div className="flex items-center space-x-2 mb-4">
              <Building2 className="h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900">{group.site.name}</h2>
              <span className="text-sm text-gray-500">({group.contacts.length} contacts)</span>
            </div>
            
            {group.contacts.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {group.contacts.map((contact) => (
                  <div key={contact.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <User className="h-4 w-4 text-gray-500" />
                          <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600">{contact.designation}</p>
                      </div>
                      <div className="flex gap-1">
                        <a
                          href={`tel:${contact.phone_number}`}
                          className="p-1 text-green-600 hover:text-green-700 transition-colors"
                          title="Call Contact"
                        >
                          <Phone className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => handleEditContact(contact)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit Contact"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteContact(contact.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete Contact"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Phone className="h-3 w-3" />
                      <span>{contact.phone_number}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <User className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No emergency contacts for this site</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {groupedContacts.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Building2 className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sites found</h3>
          <p className="text-gray-600 mb-4">Create sites first to add emergency contacts.</p>
        </div>
      )}

      {showModal && (
        <ContactModal
          contact={editingContact}
          sites={sites}
          onClose={handleModalClose}
          onSaved={handleContactSaved}
        />
      )}
    </div>
  )
}

export default EmergencyContactsManagement 