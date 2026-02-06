<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Monitor,
  Service,
  Connection,
  Setting
} from '@element-plus/icons-vue'

interface MenuItem {
  icon?: any
  index: string
  title: string
  permiss: string
  subs?: MenuItem[]
  description?: string
}

const items: MenuItem[] = [
  {
    icon: Monitor,
    index: '/Clients',
    title: '客户端管理',
    description: '管理和监控所有客户端',
    permiss: '2',
  },
  {
    icon: Service,
    index: '/Listeners',
    title: '监听器管理',
    description: '配置和管理监听器',
    permiss: '2'
  },
  {
    icon: Connection,
    index: 'client-generation',
    title: '客户端生成',
    description: '生成和分发客户端',
    permiss: '4',
    subs: [
      {
        index: '/Server',
        title: '客户端生成',
        permiss: '5',
        description: '生成客户端程序'
      },
      {
        index: '/WebDelivery',
        title: 'Web投递',
        permiss: '5',
        description: '通过Web方式投递',
      },
    ]
  },
  {
    icon: Setting,
    index: '/Settings',
    title: '系统设置',
    description: '系统配置和参数调整',
    permiss: '2'
  },
]

const route = useRoute()
const router = useRouter()

// 当前激活的菜单项
const activeIndex = computed(() => route.path)

// 展开的菜单项
const expandedMenus = ref<string[]>([])

// 根据当前路由自动展开对应的菜单
watch(() => route.path, (newPath) => {
  // 找到当前路由对应的父菜单
  for (const item of items) {
    if (item.subs) {
      for (const subItem of item.subs) {
        if (newPath === subItem.index) {
          if (!expandedMenus.value.includes(item.index)) {
            expandedMenus.value.push(item.index)
          }
          break
        }
      }
    }
  }
}, { immediate: true })

// 切换菜单展开状态
const toggleMenu = (index: string) => {
  const idx = expandedMenus.value.indexOf(index)
  if (idx > -1) {
    expandedMenus.value.splice(idx, 1)
  } else {
    expandedMenus.value.push(index)
  }
}

// 检查是否激活
const isActive = (index: string) => {
  return activeIndex.value === index ||
      (items.find(item => item.index === index)?.subs?.some(sub => sub.index === activeIndex.value))
}

// 处理菜单点击
const handleMenuClick = (item: MenuItem) => {
  if (item.subs) {
    toggleMenu(item.index)
  } else {
    router.push(item.index)
  }
}
</script>

<template>
  <nav class="top-nav">
    <div class="nav-container">
      <div class="nav-items">
        <div
            v-for="item in items"
            :key="item.index"
            class="nav-item-wrapper"
        >
          <!-- 主菜单项 -->
          <div
              class="nav-item"
              :class="{
              'nav-item-active': isActive(item.index),
              'nav-item-expanded': expandedMenus.includes(item.index)
            }"
              @click="handleMenuClick(item)"
          >
            <el-icon class="nav-icon">
              <component :is="item.icon" />
            </el-icon>
            <span class="nav-title">{{ item.title }}</span>
            <el-icon
                v-if="item.subs"
                class="nav-arrow"
                :class="{ 'nav-arrow-up': expandedMenus.includes(item.index) }"
            >
              <ArrowDown />
            </el-icon>
          </div>

          <!-- 子菜单下拉 -->
          <div
              v-if="item.subs && expandedMenus.includes(item.index)"
              class="submenu-dropdown"
          >
            <div
                v-for="subItem in item.subs"
                :key="subItem.index"
                class="submenu-item"
                :class="{ 'submenu-item-active': activeIndex === subItem.index }"
                @click.stop="router.push(subItem.index)"
            >
              <span class="submenu-title">{{ subItem.title }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.top-nav {
  background: var(--theme-gradient);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  z-index: 999;
  border-bottom: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

.nav-items {
  display: flex;
  gap: 8px;
}

.nav-item-wrapper {
  position: relative;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.8);
  min-width: 140px;
  justify-content: center;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.nav-item-active {
  background: linear-gradient(135deg, var(--theme-dark) 0%, var(--theme-light) 100%) !important;
  color: white;
  border-color: var(--theme-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.nav-icon {
  font-size: 18px;
  color: var(--theme-primary);
  transition: color 0.3s;
}

.nav-item-active .nav-icon {
  color: white;
}

.nav-title {
  font-size: 14px;
  font-weight: 600;
  color: #404040;
  white-space: nowrap;
}

.nav-item-active .nav-title {
  color: white;
}

.nav-arrow {
  font-size: 12px;
  color: var(--theme-primary);
  transition: transform 0.3s;
  margin-left: auto;
}

.nav-arrow-up {
  transform: rotate(180deg);
}

.submenu-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 200px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(0, 0, 0, 0.05);
  animation: slideDown 0.3s ease;
  z-index: 1000;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.submenu-item {
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  color: #404040;
  margin-bottom: 4px;
}

.submenu-item:hover {
  background: var(--theme-light);
  color: var(--theme-primary);
  transform: translateX(4px);
}

.submenu-item-active {
  background: linear-gradient(135deg, var(--theme-dark) 0%, var(--theme-light) 100%) !important;
  color: white;
}

.submenu-title {
  font-size: 13px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .nav-container {
    padding: 0 16px;
  }

  .nav-item {
    padding: 10px 16px;
    min-width: 120px;
  }

  .nav-title {
    font-size: 13px;
  }

  .nav-icon {
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .top-nav {
    top: 60px;
  }

  .nav-container {
    padding: 0 12px;
  }

  .nav-items {
    gap: 6px;
    overflow-x: auto;
    padding: 4px 0;
    scrollbar-width: none;
  }

  .nav-items::-webkit-scrollbar {
    display: none;
  }

  .nav-item-wrapper {
    flex-shrink: 0;
  }

  .nav-item {
    padding: 8px 12px;
    min-width: 100px;
  }

  .nav-title {
    font-size: 12px;
  }

  .nav-icon {
    font-size: 14px;
  }

  .nav-arrow {
    font-size: 10px;
  }

  .submenu-dropdown {
    left: 0;
    right: 0;
    top: calc(100% + 8px);
    min-width: auto;
    border-radius: 12px;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 0 8px;
  }

  .nav-item {
    padding: 6px 10px;
    min-width: 85px;
  }

  .nav-title {
    font-size: 11px;
  }

  .nav-icon {
    font-size: 13px;
  }

  .nav-arrow {
    display: none;
  }

  .nav-item {
    justify-content: center;
  }
}
</style>