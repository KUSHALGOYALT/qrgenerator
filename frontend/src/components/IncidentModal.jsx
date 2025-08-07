import { useState } from 'react'
import { X, Upload, User, Phone, Camera, Trash2 } from 'lucide-react'
import { incidentsAPI } from '../services/api'
import CameraCapture from './CameraCapture'
import { isCameraSupported } from '../utils/cameraUtils'

const IncidentModal = ({ site, incidentType, onClose, onSubmitted }) => {
  const [formData, setFormData] = useState({
    incident_type: incidentType.name,
    criticality: 'medium',
    description: '',
    images: [],
    is_anonymous: false,
    reporter_name: '',
    reporter_phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [imagePreviews, setImagePreviews] = useState([])
  const [showCamera, setShowCamera] = useState(false)

  const criticalityLevels = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'critical', label: 'Critical', color: 'text-red-600' },
  ]

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target
    
    if (type === 'file' && files.length > 0) {
      const newImages = Array.from(files)
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }))
      
      // Create previews for new images
      newImages.forEach(file => {
        const reader = new FileReader()
        reader.onload = (e) => {
          setImagePreviews(prev => [...prev, {
            id: Date.now() + Math.random(),
            url: e.target.result,
            file: file
          }])
        }
        reader.readAsDataURL(file)
      })
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleCameraCapture = (file) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, file]
    }))
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreviews(prev => [...prev, {
        id: Date.now() + Math.random(),
        url: e.target.result,
        file: file
      }])
    }
    reader.readAsDataURL(file)
    
    setShowCamera(false)
  }

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length > 2000) {
      newErrors.description = 'Description cannot exceed 2000 characters'
    }
    
    if (!formData.is_anonymous) {
      if (!formData.reporter_name.trim()) {
        newErrors.reporter_name = 'Name is required when not anonymous'
      }
      if (!formData.reporter_phone.trim()) {
        newErrors.reporter_phone = 'Phone number is required when not anonymous'
      }
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
      const submitData = {
        ...formData,
        site: site.id,
      }
      
      // Remove criticality if the incident type doesn't require it
      if (!incidentType.requires_criticality) {
        delete submitData.criticality
      }
      
      const response = await incidentsAPI.create(submitData)
      
      // Log success - email notifications are handled server-side
      console.log('Incident submitted successfully')
      console.log('Note: Email notifications are sent automatically if configured')
      
      onSubmitted()
    } catch (error) {
      console.error('Error submitting incident:', error)
      if (error.response?.data) {
        setErrors(error.response.data)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Report {incidentType.display_name}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Criticality - Show only if the incident type requires it */}
              {incidentType.requires_criticality && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Criticality Level *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {criticalityLevels.map((level) => (
                      <label
                        key={level.value}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          formData.criticality === level.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="criticality"
                          value={level.value}
                          checked={formData.criticality === level.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full border-2 mr-2 ${
                            formData.criticality === level.value
                              ? 'border-primary-500 bg-primary-500'
                              : 'border-gray-300'
                          }`} />
                          <span className={`text-sm font-medium ${level.color}`}>
                            {level.label}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.criticality && (
                    <p className="text-red-500 text-sm mt-1">{errors.criticality}</p>
                  )}
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Please describe the incident or feedback in detail..."
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images (Optional)
                </label>
                <div className="space-y-4">
                  {/* Upload Button */}
                  <div className="flex gap-2">
                    <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Images
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleChange}
                        className="hidden"
                      />
                    </label>
                    
                    {isCameraSupported() && (
                      <button
                        type="button"
                        onClick={() => setShowCamera(true)}
                        className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Take Photo
                      </button>
                    )}
                  </div>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={preview.id} className="relative">
                          <img
                            src={preview.url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Anonymous Reporting */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_anonymous"
                    checked={formData.is_anonymous}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Submit anonymously</span>
                </label>
              </div>

              {/* Reporter Information - Show only if not anonymous */}
              {!formData.is_anonymous && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        name="reporter_name"
                        value={formData.reporter_name}
                        onChange={handleChange}
                        className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter your name"
                      />
                    </div>
                    {errors.reporter_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.reporter_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="tel"
                        name="reporter_phone"
                        value={formData.reporter_phone}
                        onChange={handleChange}
                        className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    {errors.reporter_phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.reporter_phone}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </>
  )
}

export default IncidentModal 