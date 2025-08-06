import { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'
import { sitesAPI } from '../services/api'

const QRCodeModal = ({ site, onClose }) => {
  const [qrData, setQrData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (site) {
      fetchQRCode()
    }
  }, [site])

  const fetchQRCode = async () => {
    try {
      setLoading(true)
      const response = await sitesAPI.getQRCode(site.id)
      setQrData(response.data)
    } catch (error) {
      console.error('Error fetching QR code:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (qrData?.qr_code) {
      const link = document.createElement('a')
      link.href = qrData.qr_code
      link.download = `${site.name}-qr-code.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              QR Code for {site.name}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : qrData ? (
            <div className="space-y-4">
              <div className="text-center">
                <img
                  src={qrData.qr_code}
                  alt="QR Code"
                  className="mx-auto border border-gray-200 rounded-lg"
                />
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Public URL: <span className="font-mono text-xs break-all">{qrData.url}</span>
                </p>
                <button
                  onClick={handleDownload}
                  className="btn-primary flex items-center gap-2 mx-auto"
                >
                  <Download className="h-4 w-4" />
                  Download QR Code
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Failed to generate QR code</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QRCodeModal 