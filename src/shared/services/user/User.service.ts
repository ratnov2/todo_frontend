import { $authConfig } from '@/shared/api/axios.config'
import type {
    IReqGETUserAll,
    IResGETUserAll,
    IResGETUserMe,
    IResConnectTelegram,
    IReqDisconnectTelegram,
    IReqChangeTelegramNotify
} from './User.types'

const prefix = '/users'
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
    async connectTelegram() {
        const url = '/telegram/telegram/link'
        return $authConfig.post(url) as unknown as IResConnectTelegram
    },
    async disconnectTelegram() {
        const url = '/telegram/disconnect'
        return $authConfig.post(url) as unknown as { success: boolean }
    },
    async changeTelegramNotify(data: IReqChangeTelegramNotify) {
        const url = '/telegram/notify_change'
        return $authConfig.patch(url, data) as unknown as { success: boolean }
    },
}
