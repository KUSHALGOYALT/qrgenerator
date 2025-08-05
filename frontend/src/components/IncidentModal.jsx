import { useState } from 'react'
import { X, Upload, User, Phone, Camera } from 'lucide-react'
import { incidentsAPI } from '../services/api'
import CameraCapture from './CameraCapture'
import { isCameraSupported } from '../utils/cameraUtils'

const IncidentModal = ({ site, incidentType, onClose, onSubmitted }) => {
  const [formData, setFormData] = useState({
    incident_type: incidentType,
    criticality: 'medium',
    description: '',
    image: null,
    is_anonymous: false,
    reporter_name: '',
    reporter_phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [imagePreview, setImagePreview] = useState(null)
  const [showCamera, setShowCamera] = useState(false)

  const criticalityLevels = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'critical', label: 'Critical', color: 'text-red-600' },
  ]

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target
    
    if (type === 'file' && files[0]) {
      const file = files[0]
      setFormData(prev => ({
        ...prev,
        image: file
      }))
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
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
      image: file
    }))
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target.result)
    reader.readAsDataURL(file)
    
    setShowCamera(false)
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
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
      
      // Remove criticality for general feedback
      if (incidentType === 'general_feedback') {
        delete submitData.criticality
      }
      
      await incidentsAPI.create(submitData)
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

  const getIncidentTypeTitle = (type) => {
    const titles = {
      'unsafe_conditions': 'Unsafe Conditions',
      'unsafe_actions': 'Unsafe Actions',
      'near_miss': 'Near Miss',
      'general_feedback': 'General Feedback',
    }
    return titles[type] || type
  }

  return (
    <>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Report {getIncidentTypeTitle(incidentType)}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Criticality - Hide for general feedback */}
              {incidentType !== 'general_feedback' && (
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
                        <span className={`font-medium ${level.color}`}>
                          {level.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className={`input-field ${errors.description ? 'border-red-500' : ''}`}
                  placeholder="Please provide a detailed description of the incident..."
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>

              {/* Image Upload/Capture */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image (Optional)
                </label>
                <div className="space-y-3">
                  {/* Camera and Upload Buttons */}
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowCamera(true)}
                      disabled={!isCameraSupported()}
                      className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                        isCameraSupported()
                          ? 'border-gray-300 hover:bg-gray-50'
                          : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                      title={!isCameraSupported() ? 'Camera not supported on this device' : 'Take a photo using your camera'}
                    >
                      <Camera className="h-4 w-4" />
                      <span>Take Photo</span>
                    </button>
                    <label className="cursor-pointer">
                      <div className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Upload className="h-4 w-4" />
                        <span>Choose File</span>
                      </div>
                      <input
                        type="file"
                        id="image"
                        name="image"
                        accept="image/*"
                        onChange={handleChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Camera support notice */}
                  {!isCameraSupported() && (
                    <p className="text-xs text-gray-500">
                      Camera capture is not available on this device. You can still upload images from your gallery.
                    </p>
                  )}

                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-16 w-16 object-cover rounded border"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">
                          {formData.image?.name || 'Captured image'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Click to remove
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, image: null }))
                          setImagePreview(null)
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Anonymous Checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_anonymous"
                  name="is_anonymous"
                  checked={formData.is_anonymous}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="is_anonymous" className="text-sm text-gray-700">
                  Submit anonymously
                </label>
              </div>

              {/* Reporter Information (shown when not anonymous) */}
              {!formData.is_anonymous && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Reporter Information</span>
                  </div>
                  
                  <div>
                    <label htmlFor="reporter_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="reporter_name"
                      name="reporter_name"
                      value={formData.reporter_name}
                      onChange={handleChange}
                      className={`input-field ${errors.reporter_name ? 'border-red-500' : ''}`}
                      placeholder="Enter your name"
                    />
                    {errors.reporter_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.reporter_name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="reporter_phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="reporter_phone"
                      name="reporter_phone"
                      value={formData.reporter_phone}
                      onChange={handleChange}
                      className={`input-field ${errors.reporter_phone ? 'border-red-500' : ''}`}
                      placeholder="Enter your phone number"
                    />
                    {errors.reporter_phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.reporter_phone}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Button */}
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