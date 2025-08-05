import { useState, useEffect } from 'react'
import { QrCode, Download, ExternalLink } from 'lucide-react'
import { sitesAPI } from '../services/api'

const QRCodeManagement = () => {
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)
  const [qrData, setQrData] = useState({})

  useEffect(() => {
    fetchSites()
  }, [])

  const fetchSites = async () => {
    try {
      setLoading(true)
      const response = await sitesAPI.getAll()
      const sitesData = response.data.results || response.data
      setSites(sitesData)
      
      // Generate QR codes for all sites
      const qrPromises = sitesData.map(async (site) => {
        try {
          const qrResponse = await sitesAPI.getQRCode(site.id)
          return { [site.id]: qrResponse.data }
        } catch (error) {
          console.error(`Error fetching QR code for site ${site.id}:`, error)
          return { [site.id]: null }
        }
      })
      
      const qrResults = await Promise.all(qrPromises)
      const qrDataObj = qrResults.reduce((acc, result) => ({ ...acc, ...result }), {})
      setQrData(qrDataObj)
    } catch (error) {
      console.error('Error fetching sites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (siteId, siteName) => {
    const qrDataForSite = qrData[siteId]
    if (qrDataForSite?.qr_code) {
      const link = document.createElement('a')
      link.href = `data:image/png;base64,${qrDataForSite.qr_code}`
      link.download = `${siteName}-qr-code.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
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
          <h1 className="text-2xl font-bold text-gray-900">QR Code Management</h1>
        </div>
        <p className="mt-2 text-gray-600">
          Generate and download QR codes for each site's public feedback form.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sites.sort((a, b) => a.name.localeCompare(b.name)).map((site) => {
          const siteQrData = qrData[site.id]
          
          return (
            <div key={site.id} className="card">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{site.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{site.address}</p>
                
                {siteQrData ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <img
                        src={`data:image/png;base64,${siteQrData.qr_code}`}
                        alt={`QR Code for ${site.name}`}
                        className="border border-gray-200 rounded-lg max-w-full h-48 object-contain"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 break-all">
                        {siteQrData.public_url}
                      </p>
                      
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleDownload(site.id, site.name)}
                          className="btn-primary flex items-center gap-1 text-sm"
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </button>
                        
                        <a
                          href={siteQrData.public_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary flex items-center gap-1 text-sm"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Test
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">
                      <QrCode className="h-8 w-8 mx-auto" />
                    </div>
                    <p className="text-sm text-gray-500">Failed to generate QR code</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {sites.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <QrCode className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sites yet</h3>
          <p className="text-gray-600 mb-4">Create some sites first to generate QR codes.</p>
        </div>
      )}
    </div>
  )
}

export default QRCodeManagement 