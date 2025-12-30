import { $authConfig } from '@/shared/api/axios.config'
import type { IReqGETUserAll, IResGETUserAll, IResGETUserMe } from './User.types'

const prefix = '/user'
const getMeUrl = prefix + '/me'

export const UserService = {
    async getMe() {
        const res: IResGETUserMe = await $authConfig.get(getMeUrl)
        return res
    },
    async getAll(params: IReqGETUserAll) {
        const res: IResGETUserAll = await $authConfig.get(getMeUrl, { params })
        return res
    },
}
