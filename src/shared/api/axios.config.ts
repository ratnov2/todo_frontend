import axios, { type AxiosResponse, type CreateAxiosDefaults } from 'axios'

const defaultConfig: CreateAxiosDefaults = {
    baseURL: 'http://localhost:3000',
}
export const $authConfig = axios.create({
    ...defaultConfig,
    withCredentials: true,
})

export const $defaultConfig = axios.create(defaultConfig)

const interceptorResponse = () => {
    return (response: AxiosResponse<any, any, {}>) => {
        return response.data
    }
}



$authConfig.interceptors.response.use(interceptorResponse())
$defaultConfig.interceptors.response.use(interceptorResponse())

let isRefreshing = false
let failedQueue: Array<{
  resolve: () => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown) {
  failedQueue.forEach(p =>
    error ? p.reject(error) : p.resolve()
  )
  failedQueue = []
}


$authConfig.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config
  
      if (
        error.response?.status === 401 &&
        !originalRequest._retry
      ) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: () => resolve($authConfig(originalRequest)),
              reject,
            })
          })
        }
  
        originalRequest._retry = true
        isRefreshing = true
  
        try {
          await $authConfig.get('/auth/refresh')
          processQueue(null)
          return $authConfig(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError)
  
          // например:
          // store.logout()
          // router.push('/login')
  
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }
  
      return Promise.reject(error)
    }
  )
  
  