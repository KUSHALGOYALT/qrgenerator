import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Sites API
export const sitesAPI = {
  getAll: () => api.get('/sites/'),
  getById: (id) => api.get(`/sites/${id}/`),
  create: (data) => api.post('/sites/', data),
  update: (id, data) => api.put(`/sites/${id}/`, data),
  delete: (id) => api.delete(`/sites/${id}/`),
  getContacts: (id) => api.get(`/sites/${id}/contacts/`),
  getIncidents: (id) => api.get(`/sites/${id}/incidents/`),
  getQRCode: (id) => api.get(`/sites/${id}/qr_code/`),
}

// Emergency Contacts API
export const contactsAPI = {
  getAll: (params) => api.get('/emergency-contacts/', { params }),
  getById: (id) => api.get(`/emergency-contacts/${id}/`),
  create: (data) => api.post('/emergency-contacts/', data),
  update: (id, data) => api.put(`/emergency-contacts/${id}/`, data),
  delete: (id) => api.delete(`/emergency-contacts/${id}/`),
}

// Incidents API
export const incidentsAPI = {
  getAll: (params) => api.get('/incidents/', { params }),
  getById: (id) => api.get(`/incidents/${id}/`),
  create: (data) => {
    const formData = new FormData()
    
    // Add all text fields
    Object.keys(data).forEach(key => {
      if (key !== 'image' && data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key])
      }
    })
    
    // Add image if present
    if (data.image) {
      formData.append('image', data.image)
    }
    
    return api.post('/incidents/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  update: (id, data) => api.put(`/incidents/${id}/`, data),
  delete: (id) => api.delete(`/incidents/${id}/`),
}

export default api 