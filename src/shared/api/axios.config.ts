import axios, { type AxiosResponse, type CreateAxiosDefaults, type AxiosError } from 'axios'
import router from '@/router'

const defaultConfig: CreateAxiosDefaults = {
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
}

export const $authConfig = axios.create({
    ...defaultConfig,
    withCredentials: true,
})

export const $defaultConfig = axios.create(defaultConfig)

// Унифицированный interceptor, который всегда возвращает только data
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
    failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()))
    failedQueue = []
}

function isAuthRoute(url?: string) {
    if (!url) return false
    return (
        url.includes('/auth/login') ||
        url.includes('/auth/register') ||
        url.includes('/auth/refresh')
    )
}

function redirectToAuth() {
    // Очистка возможных локальных стораджей, если используются
    try {
        localStorage.removeItem('access_token')
    } catch {
        // ignore
    }

    if (router.currentRoute.value.name !== 'auth') {
        router.push({ name: 'auth' })
    }
}

// Отдельный перехватчик именно 401/refresh-логики
$authConfig.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const status = error.response?.status
        const originalRequest: any = error.config || {}

        // Если 401 при запросах /auth/login|/auth/register|/auth/refresh — просто редиректим на страницу авторизации
        if (status === 401 && isAuthRoute(originalRequest?.url)) {
            redirectToAuth()
            return Promise.reject(error)
        }

        // Обработка 401 для защищённых эндпоинтов
        if (status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Если refresh уже идёт — ставим запрос в очередь
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
                // Явно помечаем запрос как refresh, чтобы не зациклиться
                await $authConfig.get('/auth/refresh', {
                    headers: originalRequest.headers,
                    params: originalRequest.params,
                    // флаг, чтобы в interceptor не пытаться рефрешить рефреш
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    _isRefresh: true,
                } as any)

                processQueue(null)
                // Повторяем оригинальный запрос после успешного refresh
                return $authConfig(originalRequest)
            } catch (refreshError) {
                processQueue(refreshError)
                redirectToAuth()
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        // Любой другой 401 (который мы не смогли обработать) — редирект на авторизацию
        if (status === 401) {
            redirectToAuth()
        }

        return Promise.reject(error)
    }
)
