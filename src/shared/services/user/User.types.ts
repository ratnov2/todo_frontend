export interface IReqGETUserAll {
    limit?: number
    offset?: number
}

export interface IResGETUserAll {
    users: {
        email: string
        displayName: string
        roles: IRole[]
    }[]
}
export interface IResGETUserMe {
    email: string
    name: string
    role: IRole
    telegramChatId?: string | null
    telegramEnabled?: boolean
}

export interface IResConnectTelegram {
    link: string
}

export interface IReqDisconnectTelegram {
    // Empty - uses current user context
}

export interface IReqChangeTelegramNotify {
    isEnabled: boolean
}

type IRole = 'default' | 'admin' | 'DEFAULT' | 'ADMIN'
