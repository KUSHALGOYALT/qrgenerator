import { useState, useEffect } from 'react'
import { X, Phone, User, Building2 } from 'lucide-react'
import { sitesAPI } from '../services/api'

const EmergencyContactsModal = ({ site, onClose }) => {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  
  console.log('EmergencyContactsModal rendered with site:', site)

  useEffect(() => {
    if (site) {
      fetchContacts()
    }
  }, [site])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      console.log('Fetching contacts for site:', site.id)
      const response = await sitesAPI.getContacts(site.id)
      console.log('Contacts response:', response.data)
      setContacts(response.data)
    } catch (error) {
      console.error('Error fetching contacts:', error)
      console.error('Error details:', error.response?.data)
    } finally {
      setLoading(false)
    }
  }

  const handleCall = (phoneNumber) => {
    window.location.href = `tel:${phoneNumber}`
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Emergency Contacts
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-gray-500" />
              <div>
                <h4 className="font-medium text-gray-900">{site.name}</h4>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            </div>
          ) : contacts.length > 0 ? (
            <div className="space-y-4">
              {/* National Emergency Contacts */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  National Emergency Numbers
                </h4>
                <div className="space-y-2">
                  {contacts.filter(contact => 
                    ['100', '102', '101', '1098'].includes(contact.phone_number)
                  ).map((contact) => (
                    <div
                      key={contact.id}
                      className="p-3 border border-red-200 bg-red-50 rounded-lg hover:border-red-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <User className="h-4 w-4 text-red-500" />
                            <h4 className="font-medium text-gray-900">{contact.name}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{contact.designation}</p>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-red-500" />
                            <span className="text-sm font-medium text-gray-700">{contact.phone_number}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleCall(contact.phone_number)}
                          className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <Phone className="h-3 w-3" />
                          <span className="text-xs font-medium">Call</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Site-Specific Contacts */}
              {contacts.filter(contact => 
                !['100', '102', '101', '1098'].includes(contact.phone_number)
              ).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Site Emergency Contacts
                  </h4>
                  <div className="space-y-2">
                    {contacts.filter(contact => 
                      !['100', '102', '101', '1098'].includes(contact.phone_number)
                    ).map((contact) => (
                      <div
                        key={contact.id}
                        className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <User className="h-4 w-4 text-gray-500" />
                              <h4 className="font-medium text-gray-900">{contact.name}</h4>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{contact.designation}</p>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-700">{contact.phone_number}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleCall(contact.phone_number)}
                            className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          >
                            <Phone className="h-3 w-3" />
                            <span className="text-xs font-medium">Call</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <Phone className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Emergency Contacts</h3>
              <p className="text-gray-600">
                No emergency contacts have been configured for this site.
              </p>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="btn-secondary w-full"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmergencyContactsModal 