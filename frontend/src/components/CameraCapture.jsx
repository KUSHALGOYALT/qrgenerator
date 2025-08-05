import { useState, useRef, useEffect } from 'react'
import { Camera, RotateCcw, X, AlertTriangle } from 'lucide-react'
import { isCameraSupported, getCameraConstraints } from '../utils/cameraUtils'

const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isCameraSupported()) {
      setError('Camera is not supported on this device.')
      return
    }
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      setError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia(getCameraConstraints())
      
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.onloadedmetadata = () => {
          setIsCameraActive(true)
        }
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      let errorMessage = 'Unable to access camera.'
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera access was denied. Please allow camera permissions and try again.'
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.'
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Camera is not supported on this device.'
      }
      
      setError(errorMessage)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
      setIsCameraActive(false)
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        // Create a file from the blob
        const file = new File([blob], `photo_${Date.now()}.jpg`, {
          type: 'image/jpeg'
        })
        onCapture(file)
        stopCamera()
      }
    }, 'image/jpeg', 0.8)
  }

  const handleClose = () => {
    stopCamera()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Take Photo</h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          {error ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">
                <AlertTriangle className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-gray-700 mb-4">{error}</p>
              <div className="space-y-3">
                <button
                  onClick={startCamera}
                  className="btn-primary flex items-center space-x-2 mx-auto"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Retry</span>
                </button>
                <button
                  onClick={handleClose}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover"
                />
                {!isCameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="text-center text-white">
                      <Camera className="h-8 w-8 mx-auto mb-2" />
                      <p>Initializing camera...</p>
                    </div>
                  </div>
                )}
              </div>

              <canvas ref={canvasRef} className="hidden" />

              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleClose}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={capturePhoto}
                  disabled={!isCameraActive}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Camera className="h-4 w-4" />
                  <span>Capture Photo</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CameraCapture 