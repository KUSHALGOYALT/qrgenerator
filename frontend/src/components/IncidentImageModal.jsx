import { X } from 'lucide-react'

const IncidentImageModal = ({ imageUrl, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Incident Image</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          <img
            src={imageUrl}
            alt="Incident"
            className="max-w-full max-h-[70vh] object-contain mx-auto"
            onError={(e) => {
              console.error('Image failed to load in modal:', imageUrl)
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'block'
            }}
          />
          <div className="hidden text-center text-gray-500 mt-4">
            Failed to load image
          </div>
        </div>
      </div>
    </div>
  )
}

export default IncidentImageModal 