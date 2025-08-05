import React from 'react'

const Logo = ({ size = 'medium', showText = true, showIconOnly = false, showLogoOnly = false, className = '' }) => {
  const sizeClasses = {
    small: 'h-8',
    medium: 'h-12',
    large: 'h-16',
    xlarge: 'h-20',
    xxlarge: 'h-24'
  }

  const textSizes = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl',
    xlarge: 'text-3xl',
    xxlarge: 'text-4xl'
  }

  if (showIconOnly) {
    return (
      <div className={`${sizeClasses[size]} w-auto flex items-center justify-center ${className}`}>
        <img 
          src="https://hexaclimate.com/wp-content/uploads/2023/11/Hexa-Logo-with-black-text-1.svg" 
          alt="Hexa Climate" 
          className="w-full h-full object-contain"
        />
      </div>
    )
  }

  if (showLogoOnly) {
    return (
      <div className={`${sizeClasses[size]} w-auto flex items-center justify-center ${className}`}>
        <img 
          src="https://hexaclimate.com/wp-content/uploads/2023/11/Hexa-Logo-with-black-text-1.svg" 
          alt="Hexa Climate" 
          className="w-full h-full object-contain"
        />
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Icon */}
      <div className={`${sizeClasses[size]} w-auto flex items-center justify-center`}>
        <img 
          src="https://hexaclimate.com/wp-content/uploads/2023/11/Hexa-Logo-with-black-text-1.svg" 
          alt="Hexa Climate" 
          className="w-full h-full object-contain"
        />
      </div>
      
      {/* Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-gray-900 ${textSizes[size]}`}>
            Hexa Climate
          </span>
          <span className="text-xs text-gray-500 font-medium">
            Safety System
          </span>
        </div>
      )}
    </div>
  )
}

export default Logo 