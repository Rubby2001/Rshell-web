// 绑定路由和vue
import {createRouter, createWebHistory} from 'vue-router'
import Home from '../views/HomeView.vue'
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
            name: 'Home',
            component: Home,
            children: [

                {
                    path: '/Clients',
                    name: 'Clients',
                    meta: {
                        title: '客户端列表',
                        permiss: '2'
                    },
                    component: () => import('@/views/clients/ClientsView.vue')
                },
                {
                    path: '/Listeners',
                    name: 'Listeners',
                    meta: {
                        title: 'Listener列表',
                        permiss: '2'
                    },
                    component: () => import('@/views/listener/listener.vue')
                },
                {
                    path: '/Server',
                    name: 'Server',
                    meta: {
                        title: '客户端生成',
                        permiss: '5'
                    },
                    component: () => import('@/views/server/ServerGen.vue')
                },
                {
                    path: '/WebDelivery',
                    name: 'WebDelivery',
                    meta: {
                        title: 'WebDelivery',
                        permiss: '5'
                    },
                    component: () => import('@/views/server/WebDelivery.vue')
                },
                {
                    path: '/Settings',
                    name: 'Settings',
                    meta: {
                        title: 'Settings',
                        permiss: '5'
                    },
                    component: () => import('@/views/settings/Settings.vue')
                },

// {
//   path: '/user_list',
//   name: 'user_list',
//   meta: {
//     title: '用户列表',
//     permiss: '2'
//   },
//   component: () => import('@/views/user/UserView.vue')
// },
// {
//   path: '/user',
//   name: 'user_list',
//   meta: {
//     title: '用户列表',
//     permiss: '2'
//   },
//   component: () => import('@/views/user/UserView.vue')
// },
                {
                    path: '/user/resetpassword',
                    name:
                        'resetpassword',
                    meta:
                        {
                            title: '重置密码',
                            permiss:
                                '1'
                        }
                    ,
                    component: () => import('@/views/user/ResetPassword.vue')
                }
                ,
// {
//   path: '/user/info',
//   name: 'userinfo',
//   meta: {
//     title: '个人中心',
//     permiss: '1'
//   },
//   component: () => import('@/views/user/UserInfo.vue')
// }
            ]
        },
        {
            path: '/client',
            name:
                '客户端详情',
            meta:
                {
                    title: '客户端详情',
                    permiss:
                        '2'
                }
            ,
            component: () => import('@/views/client/ClientView.vue'),
            children:
                [
                    {
                        path: '/client/shell',
                        name: 'Shell',
                        meta: {
                            title: 'Shell',
                            permiss: 2
                        },
                        component: () => import('@/views/client/View/ClientShell.vue')
                    },
                    {
                        path: '/client/socks5',
                        name: 'Socks5',
                        meta: {
                            title: 'Socks5',
                            permiss: 2
                        },
                        component: () => import('@/views/client/View/ClientSocks5.vue')
                    },
                    {
                        path: '/client/files',
                        name: 'Files',
                        meta: {
                            title: 'Files',
                            permiss: 2
                        },
                        component: () => import('@/views/client/View/ClientFiles.vue')
                    },
                    {
                        path: '/client/pid',
                        name: 'PID',
                        meta: {
                            title: 'PID',
                            permiss: 2
                        },
                        component: () => import('@/views/client/View/ClientPid.vue')
                    },
                    {
                        path: '/client/downloads',
                        name: 'Downloads',
                        meta: {
                            title: 'Downloads',
                            permiss: 2
                        },
                        component: () => import('@/views/client/View/ClientDownloads.vue')
                    },
                    {
                        path: '/client/notes',
                        name: 'Notes',
                        meta: {
                            title: 'Notes',
                            permiss: 2
                        },
                        component: () => import('@/views/client/View/ClientNotes.vue')
                    }
                ]
        }
        ,
        {
            path: '/login',
            name:
                '登陆',
            meta:
                {
                    title: '登陆'
                }
            ,
            component: () => import('@/views/login/LoginView.vue')
        }
        ,
        {
            path: '/404',
            name:
                '404',
            meta:
                {
                    title: '404'
                }
            ,
            component: () => import('@/views/error/404View.vue')
        }
        ,
        {
            path: '/401',
            name:
                '401',
            meta:
                {
                    title: '401'
                }
            ,
            component: () => import('@/views/error/401View.vue')
        }
        ,
// {
//   path: '/test',
//   name: 'test',
//   meta: {
//     title: '测试页面'
//   },
//   component: () => import('@/components/Common/TestVIew.vue')
// }
    ]
})

export default router
