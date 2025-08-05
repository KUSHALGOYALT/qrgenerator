// Check if the device supports camera functionality
export const isCameraSupported = () => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
}

// Check if the device is mobile
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// Get camera constraints based on device type
export const getCameraConstraints = () => {
  const constraints = {
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 }
    }
  }

  // On mobile devices, prefer the back camera
  if (isMobileDevice()) {
    constraints.video.facingMode = 'environment'
  }

  return constraints
}

// Request camera permissions
export const requestCameraPermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: getCameraConstraints()
    })
    // Stop the stream immediately after permission check
    stream.getTracks().forEach(track => track.stop())
    return true
  } catch (error) {
    console.error('Camera permission denied:', error)
    return false
  }
} 