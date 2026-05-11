import {createRouter, createWebHistory} from 'vue-router'
import {cancelRequest} from "@/utils/request";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: '/login'
        },
        {
            path: '/',
            name: 'Main',
            component: () => import('@/views/HomeView.vue'),
            children: [
                {
                    path: '/home',
                    name: 'Home',
                    meta: {title: '首页', permiss: '1'},
                    component: () => import('@/views/home/index.vue')
                },
                {
                    path: '/Clients',
                    name: 'Clients',
                    meta: {title: '客户端列表', permiss: '2'},
                    component: () => import('@/views/clients/ClientsView.vue')
                },
                {
                    path: '/Listeners',
                    name: 'Listeners',
                    meta: {title: 'Listener列表', permiss: '2'},
                    component: () => import('@/views/listener/listener.vue')
                },
                {
                    path: '/Server',
                    name: 'Server',
                    meta: {title: '客户端生成', permiss: '5'},
                    component: () => import('@/views/server/ServerGen.vue')
                },
                {
                    path: '/WebDelivery',
                    name: 'WebDelivery',
                    meta: {title: 'WebDelivery', permiss: '5'},
                    component: () => import('@/views/server/WebDelivery.vue')
                },
                {
                    path: '/Settings',
                    name: 'Settings',
                    meta: {title: 'Settings', permiss: '5'},
                    component: () => import('@/views/settings/Settings.vue')
                },
                {
                    path: '/Plugins',
                    name: 'Plugins',
                    meta: {title: '插件管理', permiss: '5'},
                    component: () => import('@/views/plugin/PluginView.vue')
                },
            ]
        },
        {
            path: '/client',
            name: '客户端详情',
            meta: {title: '客户端详情', permiss: '2'},
            component: () => import('@/views/client/ClientView.vue'),
            children: [
                {
                    path: '/client/shell',
                    name: 'Shell',
                    meta: {title: 'Shell'},
                    component: () => import('@/views/client/View/ClientShell.vue')
                },
                {
                    path: '/client/socks5',
                    name: 'Socks5',
                    meta: {title: 'Socks5'},
                    component: () => import('@/views/client/View/ClientSocks5.vue')
                },
                {
                    path: '/client/files',
                    name: 'Files',
                    meta: {title: 'Files'},
                    component: () => import('@/views/client/View/ClientFiles.vue')
                },
                {
                    path: '/client/pid',
                    name: 'PID',
                    meta: {title: 'PID'},
                    component: () => import('@/views/client/View/ClientPid.vue')
                },
                {
                    path: '/client/downloads',
                    name: 'Downloads',
                    meta: {title: 'Downloads'},
                    component: () => import('@/views/client/View/ClientDownloads.vue')
                },
                {
                    path: '/client/notes',
                    name: 'Notes',
                    meta: {title: 'Notes'},
                    component: () => import('@/views/client/View/ClientNotes.vue')
                },
                {
                    path: '/client/screenshots',
                    name: 'Screenshots',
                    meta: {title: 'Screenshots'},
                    component: () => import('@/views/client/View/ClientScreenshots.vue')
                },
                {
                    path: '/client/credentials',
                    name: 'Credentials',
                    meta: {title: 'Credentials'},
                    component: () => import('@/views/client/View/ClientCredentials.vue')
                },
            ]
        },
        {
            path: '/login',
            name: '登陆',
            meta: {title: '登陆'},
            component: () => import('@/views/login/LoginView.vue')
        },
        {
            path: '/404',
            name: '404',
            meta: {title: '404'},
            component: () => import('@/views/error/404View.vue')
        },
        {
            path: '/401',
            name: '401',
            meta: {title: '401'},
            component: () => import('@/views/error/401View.vue')
        },
    ]
})

export default router
