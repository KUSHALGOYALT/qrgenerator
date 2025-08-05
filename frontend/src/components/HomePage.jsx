import { Shield, QrCode, Phone } from 'lucide-react'
import Logo from './Logo'

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="mb-12">
            {/* Centered Logo */}
            <div className="flex justify-center mb-8">
              <Logo size="xlarge" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Safety Feedback System
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              A comprehensive safety feedback system for managing incidents, 
              emergency contacts, and site-specific reporting across all Hexa Climate facilities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <QrCode className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">QR Code Access</h3>
              <p className="text-gray-600">
                Scan QR codes at sites to access safety feedback forms and report incidents.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Safety Reporting</h3>
              <p className="text-gray-600">
                Report unsafe conditions, actions, near misses, and provide general feedback.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <Phone className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Emergency Contacts</h3>
              <p className="text-gray-600">
                Access site-specific emergency contacts with one-click calling functionality.
              </p>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              For administrative access, please contact your system administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage 