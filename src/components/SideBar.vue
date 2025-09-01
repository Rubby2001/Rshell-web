<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebar'

interface MenuItem {
  icon?: string
  index: string
  title: string
  permiss: string
  subs?: MenuItem[]
}

const items: MenuItem[] = [
  // {
  //   icon: 'Odometer',
  //   index: '/dashboard',
  //   title: '系统首页',
  //   permiss: '1'
  // },
  {
    icon: 'Monitor',
    index: '1',
    title: '客户端管理',
    permiss: '2',
    subs: [
      {
        index: '/Clients',
        title: '客户端列表',
        permiss: '2'
      },
    ]
  },
  {
    icon: 'Service',
    index: '2',
    title: 'Listener管理',
    permiss: '2',
    subs: [
      {
        index: '/Listeners',
        title: 'Listener列表',
        permiss: '2'
      },
    ]
  },


  {icon: 'Connection',
    index: '3',
    title: '客户端生成',
    permiss: '4',
    subs: [
      {
        index: '/Server',
        title: '客户端生成',
        permiss: '5'
      },
      {
        index: '/WebDelivery',
        title: 'WebDelivery',
        permiss: '5'
      },
    ]},{
    icon: 'Setting',
    title: '设置',
    index: "/Settings",
    permiss: '2',
  },
  // {
  //   icon: 'User',
  //   index: '4',
  //   title: '用户管理',
  //   permiss: '4',
  //   subs: [
  //     {
  //       index: '/user/',
  //       title: '用户列表',
  //       permiss: '5'
  //     },
  //   ]
  // },
]

const route = useRoute()
// const onRoutes = computed(() => {
//   return route.path
// })

// 递归函数来查找与当前路由匹配的最佳菜单项
const findMatchingIndex = (items: Array<any>, path: string): string | null => {
  for (const item of items) {
    if (path.startsWith(item.index)) {
      return item.index
    }
    if (item.subs) {
      let subMatch: any
      subMatch = findMatchingIndex(item.subs, path)
      if (subMatch) {
        return subMatch
      }
    }
  }
  // 如果没有找到匹配项，尝试去掉路径的最后一部分再次查找
  const pathSegments = path.split('/').filter(Boolean)
  if (pathSegments.length > 1) {
    pathSegments.pop()
    return findMatchingIndex(items, '/' + pathSegments.join('/'))
  }
  return null // 如果没有任何匹配，返回null
}

const activeIndex = computed(() => findMatchingIndex(items, route.path) || route.path)

const sidebar = useSidebarStore()
</script>

<template>
  <div class="sidebar">
    <el-menu
      class="sidebar-el-menu"
      :default-active="activeIndex"
      :collapse="sidebar.collapse"
      text-color="#181818"
      active-text-color="#20a0ff"
      unique-opened
      router
    >
      <template v-for="item in items">
        <template v-if="item.subs">
          <el-sub-menu :index="item.index" :key="item.index" v-permiss="item.permiss">
            <template #title>
              <el-icon v-if="item.icon">
                <component :is="item.icon"></component>
              </el-icon>
              <span>{{ item.title }}</span>
            </template>
            <template v-for="subItem in item.subs" :key="subItem.index">
              <el-sub-menu
                v-if="subItem.subs"
                :index="subItem.index"
                :key="subItem.index"
                v-permiss="item.permiss"
              >
                <template #title>{{ subItem.title }}</template>
                <el-menu-item
                  v-for="(threeItem, i) in subItem.subs"
                  :key="i"
                  :index="threeItem.index"
                >
                  {{ threeItem.title }}
                </el-menu-item>
              </el-sub-menu>
              <el-menu-item v-permiss="item.permiss" :index="subItem.index">
                {{ subItem.title }}
              </el-menu-item>
            </template>
          </el-sub-menu>
        </template>
        <template v-else>
          <el-menu-item :index="item.index" :key="item.index" v-permiss="item.permiss">
            <el-icon v-if="item.icon">
              <component :is="item.icon"></component>
            </el-icon>
            <template #title>{{ item.title }}</template>
          </el-menu-item>
        </template>
      </template>
    </el-menu>
  </div>
</template>

<style scoped>
.sidebar {
  display: block;
  position: absolute;
  left: 20px;
  top: 70px;
  min-width: 180px;
  height: 95%;
  bottom: 0;
  overflow-y: scroll;
}

.sidebar::-webkit-scrollbar {
  width: 0;
}

.sidebar > ul {
  height: 100%;
}
</style>
