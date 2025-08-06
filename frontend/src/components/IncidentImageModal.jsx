import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

const IncidentImageModal = ({ images, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const isMultipleImages = Array.isArray(images) && images.length > 1
  const currentImage = Array.isArray(images) ? images[currentIndex] : images
  
  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }
  
  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }
  
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowLeft') handlePrevious()
    if (e.key === 'ArrowRight') handleNext()
  }
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">
            Incident Images {isMultipleImages ? `(${currentIndex + 1}/${images.length})` : ''}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 relative">
          {/* Navigation buttons for multiple images */}
          {isMultipleImages && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-lg transition-all z-10"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-lg transition-all z-10"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          
          <img
            src={currentImage.image_url}
            alt={`Incident ${currentIndex + 1}`}
            className="max-w-full max-h-[70vh] object-contain mx-auto"
            onError={(e) => {
              console.error('Image failed to load in modal:', currentImage.image_url)
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'block'
            }}
          />
          <div className="hidden text-center text-gray-500 mt-4">
            Failed to load image
          </div>
          
          {/* Image caption */}
          {currentImage.caption && (
            <div className="text-center text-sm text-gray-600 mt-2">
              {currentImage.caption}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default IncidentImageModal 