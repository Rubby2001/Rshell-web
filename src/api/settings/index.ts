import request from '@/utils/request'

export default {
    // 获取配置列表
    getSettingsList() {
        return request({
            url: '/settings/list',
            method: 'GET'
        })
    },

    // 编辑配置（支持单个或多个）
    editSettings(data: { Name: string; Value: string }[]) {
        return request({
            url: '/settings/edit',
            method: 'POST',
            data
        })
    }
}
