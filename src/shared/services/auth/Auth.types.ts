import { $authConfig, $defaultConfig } from '@/shared/api/axios.config'
import type { IReqRegister } from './Auth.service'

const prefix = '/auth'

const registerUrl = prefix + '/register'
const loginUrl = prefix + '/login'

export const AuthService = {
    async register(data: IReqRegister) {
        console.log(data)

        const res: string = await $authConfig.post(registerUrl, data)
        return res
    },
    async login(data: IReqRegister) {
        const res = await $authConfig.post(loginUrl, data)
        return res
    },
}
