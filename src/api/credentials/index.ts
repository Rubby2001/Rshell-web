import request from '@/utils/request'

export default {
    list(data?: { page?: number; page_size?: number }) {
        return request({
            url: "/credentials/list",
            method: 'get',
            params: data,
        })
    },
    add(data: { uid: string; target: string; username: string; secret: string; cred_type: string; source: string; notes: string }) {
        return request({
            url: "/credentials/add",
            method: 'post',
            data,
        })
    },
    delete(id: number) {
        return request({
            url: "/credentials/delete",
            method: 'post',
            params: { id },
        })
    },
}
