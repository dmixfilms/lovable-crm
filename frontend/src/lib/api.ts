import axios from "axios"

// Use Next.js API routes as proxy to avoid CORS issues
// All requests go through /api/proxy/[...path]
export const api = axios.create({
  baseURL: "/api/proxy",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add JWT token to all requests
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 responses - redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token")
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)
