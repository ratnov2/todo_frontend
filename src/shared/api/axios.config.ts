import axios, { type AxiosResponse, type CreateAxiosDefaults } from 'axios'

const defaultConfig: CreateAxiosDefaults = {
    baseURL: 'http://localhost:3002',
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
