import {createApp} from "vue"
import ElementPlus from "element-plus"

import pinia from "@/stores/index";
import * as ElementPlusIconsVue from "@element-plus/icons-vue"
import App from "./App.vue"
import router from "./router"
import {usePermissStore} from "@/stores/userpermiss"
import {useUserStore} from "@/stores/user"
// import {useAxiosConfigStore} from '@/stores/server';
import piniaPluginPersistedstate from "pinia-plugin-persistedstate"
import "element-plus/dist/index.css"
import "./assets/main.css"

import plugins from '@/plugins'

import directives from "@/components/Common/WaterMark";


// 执行方法得到实例
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)
app.use(pinia)
app.use(ElementPlus)
app.use(directives)
plugins(app)

// 自定义权限指令
const permiss = usePermissStore()
app.directive("permiss", {
    mounted(el, binding) {
        if (!permiss.key.includes(String(binding.value))) {
            el["hidden"] = true
        }
    }
})

router.beforeEach((to, from, next) => {
    document.title = `${to.meta.title} | Rshell`
    // const axiosConfig = useAxiosConfigStore();
    const users = useUserStore()
    const permiss = usePermissStore()
    if (!router.hasRoute(to.name ?? '')) {
        next('/404')
    } else if (!users.username && to.path !== "/login") {
        next("/login")
    } else if (to.meta.permiss && !permiss.key.includes(String(to.meta.permiss))) {
        // 如果没有权限，则进入401
        next("/401")
    } else {
        next()
    }
})
// 导入element plus的icon库
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.use(router)

// 应用背景图片
const applyBackgroundImage = () => {
    const bg = localStorage.getItem('backgroundImage');
    if (bg) {
        // 使用 nextTick 确保 DOM 完全渲染后再应用背景
        setTimeout(() => {
            document.body.classList.add('has-background');
            // 使用 background 属性直接设置，覆盖所有默认背景
            // document.body.style.background = `url(${bg}) center center / cover no-repeat fixed`;
            document.body.style.setProperty(
                'background', 
                `url(${bg}) center center / cover no-repeat fixed`, 
                'important'
            );
        }, 100);
    }
};

app.mount("#app")

// 在挂载后应用背景图片
applyBackgroundImage();
