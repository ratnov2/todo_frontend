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
    user: {
        email: string
        displayName: string
        roles: IRole[]
    }
}

type IRole = 'default' | 'admin'
