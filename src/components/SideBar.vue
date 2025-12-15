<script setup lang="ts">
import { computed, ref,watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebar'
import {
  Monitor,
  Service,
  Connection,
  Setting,
  Expand,
  Fold,
  ArrowRight,
  ArrowDown
} from '@element-plus/icons-vue'

interface MenuItem {
  icon?: any
  index: string
  title: string
  permiss: string
  subs?: MenuItem[]
  description?: string
  badge?: string | number
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
const sidebar = useSidebarStore()

// 当前激活的菜单项
const activeIndex = computed(() => route.path)

// 展开的菜单项
const expandedMenus = ref<string[]>(['/Clients'])

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
  if (sidebar.collapse) return

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

// 获取菜单项图标颜色
const getIconColor = (item: MenuItem) => {
  if (isActive(item.index)) {
    return '#409eff'
  }
  if (item.subs && expandedMenus.value.includes(item.index)) {
    return '#409eff'
  }
  return '#909399'
}

// 处理菜单点击
const handleMenuClick = (item: MenuItem) => {
  if (item.subs) {
    if (!sidebar.collapse) {
      toggleMenu(item.index)
    }
  } else {
    router.push(item.index)
  }
}

// 获取展开箭头图标
const getExpandIcon = (item: MenuItem) => {
  if (!item.subs) return Expand  // 如果没有子菜单，返回默认图标
  if (sidebar.collapse) return ArrowRight
  return expandedMenus.value.includes(item.index) ? ArrowDown : ArrowRight
}

// 侧边栏宽度
const sidebarWidth = computed(() => sidebar.collapse ? '64px' : '250px')
</script>

<template>
  <div class="sidebar-wrapper">
    <!-- 侧边栏背景遮罩 -->
    <div
        v-if="!sidebar.collapse"
        class="sidebar-backdrop"
        @click="sidebar.collapse = true"
    ></div>

    <!-- 主侧边栏 -->
    <div
        class="sidebar"
        :class="{ 'sidebar-collapsed': sidebar.collapse }"
        :style="{ width: sidebarWidth }"
    >
      <!-- 折叠按钮 -->
      <div class="sidebar-header">
        <div class="logo-area" v-if="!sidebar.collapse">
          <div class="logo-icon">
            <el-icon><Connection /></el-icon>
          </div>
          <h3 class="logo-title">Rshell</h3>
          <span class="logo-subtitle">管理控制台</span>
        </div>

        <div class="collapse-btn" @click="sidebar.collapse = !sidebar.collapse">
          <el-icon>
            <component :is="sidebar.collapse ? Expand : Fold" />
          </el-icon>
        </div>
      </div>

      <!-- 菜单列表 -->
      <div class="menu-list">
        <div
            v-for="item in items"
            :key="item.index"
            class="menu-item-wrapper"
        >
          <!-- 菜单项 -->
          <div
              class="menu-item"
              :class="{
              'menu-item-active': isActive(item.index),
              'menu-item-expanded': expandedMenus.includes(item.index) && !sidebar.collapse,
              'menu-item-collapsed': sidebar.collapse
            }"
              @click="handleMenuClick(item)"
          >
            <!-- 左侧图标区域 -->
            <div class="menu-icon-wrapper">
              <div
                  class="menu-icon-bg"
                  :style="{
                  backgroundColor: isActive(item.index) ? 'rgba(64, 158, 255, 0.1)' : 'transparent',
                  borderColor: getIconColor(item)
                }"
              >
                <el-icon class="menu-icon">
                  <component :is="item.icon" />
                </el-icon>
              </div>

              <!-- 徽标 -->
              <div
                  v-if="item.badge && !sidebar.collapse"
                  class="menu-badge"
                  :class="{ 'menu-badge-new': item.badge === 'new', 'menu-badge-hot': item.badge === 'hot' }"
              >
                {{ item.badge }}
              </div>
            </div>

            <!-- 内容区域 -->
            <div v-if="!sidebar.collapse" class="menu-content">
              <div class="menu-title-wrapper">
                <span class="menu-title">{{ item.title }}</span>

                <!-- 展开箭头 -->
                <el-icon
                    v-if="item.subs"
                    class="menu-expand-icon"
                    :class="{ 'menu-expand-icon-expanded': expandedMenus.includes(item.index) }"
                >
                  <component :is="getExpandIcon(item)" />
                </el-icon>
              </div>

              <div v-if="item.description" class="menu-description">
                {{ item.description }}
              </div>
            </div>

            <!-- 折叠时的提示 -->
            <div v-if="sidebar.collapse" class="menu-popover">
              <div class="popover-content">
                <div class="popover-title">{{ item.title }}</div>
                <div v-if="item.description" class="popover-desc">{{ item.description }}</div>
                <div v-if="item.subs" class="popover-subs">
                  <div
                      v-for="sub in item.subs"
                      :key="sub.index"
                      class="popover-sub-item"
                      @click.stop="router.push(sub.index)"
                  >
                    {{ sub.title }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 子菜单项 -->
          <div
              v-if="item.subs && expandedMenus.includes(item.index) && !sidebar.collapse"
              class="submenu-list"
          >
            <div
                v-for="subItem in item.subs"
                :key="subItem.index"
                class="submenu-item"
                :class="{ 'submenu-item-active': activeIndex === subItem.index }"
                @click.stop="router.push(subItem.index)"
            >
              <div class="submenu-dot"></div>
              <div class="submenu-content">
                <span class="submenu-title">{{ subItem.title }}</span>
                <div v-if="subItem.description" class="submenu-description">
                  {{ subItem.description }}
                </div>
              </div>
              <div
                  v-if="subItem.badge"
                  class="submenu-badge"
                  :class="{ 'submenu-badge-hot': subItem.badge === 'hot' }"
              >
                {{ subItem.badge }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 侧边栏底部 -->
      <div v-if="!sidebar.collapse" class="sidebar-footer">
        <div class="status-indicator">
          <div class="status-dot status-online"></div>
          <span class="status-text">系统运行中</span>
        </div>
<!--        <div class="version-info">v2.0.0</div>-->
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar-wrapper {
  position: relative;
  height: 100%;
}

.sidebar-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1998;
  display: none;
}

@media (max-width: 768px) {
  .sidebar-backdrop {
    display: block;
  }
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  background: linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%);
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  z-index: 1999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-collapsed {
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon .el-icon {
  color: white;
  font-size: 18px;
}

.logo-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 1px;
}

.logo-subtitle {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-left: 8px;
}

.collapse-btn {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: rotate(180deg);
}

.collapse-btn .el-icon {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
}

.menu-list {
  flex: 1;
  padding: 16px 12px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

.menu-list::-webkit-scrollbar {
  width: 4px;
}

.menu-list::-webkit-scrollbar-track {
  background: transparent;
}

.menu-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.menu-item-wrapper {
  margin-bottom: 4px;
}

.menu-item {
  position: relative;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.menu-item:hover .menu-popover {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
}

.menu-item-active {
  background: rgba(64, 158, 255, 0.1) !important;
  color: #409eff !important;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.menu-item-expanded {
  background: rgba(255, 255, 255, 0.05);
}

.menu-icon-wrapper {
  position: relative;
  flex-shrink: 0;
}

.menu-icon-bg {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid;
  transition: all 0.3s;
}

.menu-icon {
  font-size: 16px;
  transition: all 0.3s;
}

.menu-item-active .menu-icon {
  color: #409eff;
}

.menu-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.menu-badge-new {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.menu-badge-hot {
  background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
  color: white;
}

.menu-content {
  flex: 1;
  min-width: 0;
}

.menu-title-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
}

.menu-title {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-expand-icon {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  transition: transform 0.3s;
}

.menu-expand-icon-expanded {
  transform: rotate(180deg);
}

.menu-description {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-popover {
  position: absolute;
  left: calc(100% + 10px);
  top: 50%;
  transform: translateY(-50%) translateX(-10px);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s;
  z-index: 2000;
  pointer-events: none;
}

.menu-item:hover .menu-popover {
  pointer-events: auto;
}

.popover-content {
  background: #2d2d2d;
  border-radius: 8px;
  padding: 12px;
  min-width: 200px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.popover-title {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
}

.popover-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
}

.popover-subs {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 8px;
}

.popover-sub-item {
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s;
}

.popover-sub-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #409eff;
}

.submenu-list {
  margin-left: 36px;
  margin-top: 4px;
  margin-bottom: 8px;
  animation: slideDown 0.3s ease;
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
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
  color: rgba(255, 255, 255, 0.6);
}

.submenu-item:hover {
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.8);
}

.submenu-item-active {
  background: rgba(64, 158, 255, 0.08) !important;
  color: #409eff !important;
}

.submenu-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transition: all 0.3s;
}

.submenu-item-active .submenu-dot {
  background: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

.submenu-content {
  flex: 1;
  min-width: 0;
}

.submenu-title {
  font-size: 13px;
  font-weight: 500;
  display: block;
}

.submenu-description {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 2px;
}

.submenu-badge {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}

.submenu-badge-hot {
  background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
  color: white;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-online {
  background: #67c23a;
  box-shadow: 0 0 0 2px rgba(103, 194, 58, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 2px rgba(103, 194, 58, 0.3);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(103, 194, 58, 0.1);
  }
}

.status-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.version-info {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar:not(.sidebar-collapsed) {
    transform: translateX(0);
  }

  .sidebar-collapsed {
    transform: translateX(-100%);
  }
}

/* 过渡动画 */
.sidebar-enter-active,
.sidebar-leave-active {
  transition: transform 0.3s ease;
}

.sidebar-enter-from,
.sidebar-leave-to {
  transform: translateX(-100%);
}
</style>