import request from '@/utils/request'

// 获取插件列表
export function getPluginList() {
    return request({
        url: '/plugin/list',
        method: 'GET'
    })
}

// 添加插件
export function addPlugin(data: any) {
    const formData = new FormData()
    formData.append('file', data.file)
    formData.append('name', data.name)
    formData.append('os', data.os)
    formData.append('type', data.type)

    return request({
        url: '/plugin/add',
        method: 'post',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data: formData
    })
}

// 删除插件
export function deletePlugin(data: { id: number }) {
    return request({
        url: '/plugin/delete',
        method: 'POST',
        data
    })
}

// 执行插件
export function executePlugin(data: { id: number, uid: string, args: string }) {
    return request({
        url: '/plugin/execute',
        method: 'POST',
        data
    })
}
