import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { contactsAPI } from '../services/api'

const ContactModal = ({ contact, sites, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    phone_number: '',
    site: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name,
        designation: contact.designation,
        phone_number: contact.phone_number,
        site: contact.site,
      })
    }
  }, [contact])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!formData.designation.trim()) {
      newErrors.designation = 'Designation is required'
    }
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required'
    }
    if (!formData.site) {
      newErrors.site = 'Site is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      if (contact) {
        await contactsAPI.update(contact.id, formData)
      } else {
        await contactsAPI.create(formData)
      }
      onSaved()
    } catch (error) {
      console.error('Error saving contact:', error)
      if (error.response?.data) {
        setErrors(error.response.data)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {contact ? 'Edit Contact' : 'Add New Contact'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="site" className="block text-sm font-medium text-gray-700 mb-1">
                Site *
              </label>
              <select
                id="site"
                name="site"
                value={formData.site}
                onChange={handleChange}
                className={`input-field ${errors.site ? 'border-red-500' : ''}`}
              >
                <option value="">Select a site</option>
                {sites.sort((a, b) => a.name.localeCompare(b.name)).map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
              {errors.site && (
                <p className="text-red-500 text-sm mt-1">{errors.site}</p>
              )}
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Enter contact name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-1">
                Designation *
              </label>
              <input
                type="text"
                id="designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className={`input-field ${errors.designation ? 'border-red-500' : ''}`}
                placeholder="Enter designation"
              />
              {errors.designation && (
                <p className="text-red-500 text-sm mt-1">{errors.designation}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className={`input-field ${errors.phone_number ? 'border-red-500' : ''}`}
                placeholder="Enter phone number"
              />
              {errors.phone_number && (
                <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : (contact ? 'Update Contact' : 'Create Contact')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ContactModal 