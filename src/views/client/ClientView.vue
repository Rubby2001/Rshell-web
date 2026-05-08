<template>
  <div class="client-layout">
    <!-- 客户端信息头部 -->
    <div class="client-header">
      <div class="header-left">
        <div class="header-actions">
          <el-button
              @click="goBack"
              size="default"
              class="back-button"
          >
            <el-icon><Back /></el-icon>
            返回列表
          </el-button>
        </div>
        <h1 class="client-title">客户端管理</h1>
      </div>
      <div class="client-info">
        <el-tag :type="currentStatus === '1' ? 'success' : 'danger'" size="default" class="info-tag">
          <el-icon><CircleCheck /></el-icon>
          {{ currentStatus === '1' ? '在线' : '离线' }}
        </el-tag>
        <el-tag type="info" size="default" class="info-tag">
          <el-icon><User /></el-icon>
          User: {{ currentUser }}
        </el-tag>
        <el-tag type="primary" size="default" class="info-tag">
          <el-icon><Position /></el-icon>
          IP: {{ currentIp }}
        </el-tag>
        <el-tag type="warning" size="default" class="info-tag">
          <el-icon><Monitor /></el-icon>
          PC: {{ currentComputer }}
        </el-tag>
      </div>
    </div>

    <!-- 顶部导航栏 -->
    <div class="top-navigation">
      <div
          v-for="item in menuItems"
          :key="item.index"
          class="nav-item"
          :class="{ 'nav-item-active': activeMenu === item.index }"
          @click="handleItemClick(item.index)"
      >
        <el-icon
            class="nav-icon"
            :style="{ color: activeMenu === item.index ? 'var(--theme-primary)' : '#909399' }"
        >
          <component :is="item.icon" />
        </el-icon>
        <span class="nav-label">{{ item.title }}</span>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="client-main-content">
      <div class="content-container">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <keep-alive :include="tags.nameList">
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebar'
import { useTagsStore } from '@/stores/tags'
import { useTaskStore } from '@/stores/taskinfo'
import { cancelRequest } from '@/utils/request'
import {
  Position,
  User,
  Monitor,
  CircleCheck,
  Back,
  Monitor as Terminal,
  Document as File,
  Cpu as Process,
  Connection as Network,
  Download,
  Document,
  Picture
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const sidebarStore = useSidebarStore()
const tags = useTagsStore()
const TaskStore = useTaskStore()

// 从路由参数获取客户端信息
const currentUid = computed(() => {
  const uid = route.query.uid
  return Array.isArray(uid) ? uid[0] || 'Unknown' : uid || 'Unknown'
})

const currentUser = computed(() => {
  const user = route.query.user
  return Array.isArray(user) ? user[0] || 'Unknown' : user || 'Unknown'
})

const currentIp = computed(() => {
  const ip = route.query.ip
  return Array.isArray(ip) ? ip[0] || '0.0.0.0' : ip || '0.0.0.0'
})

const currentComputer = computed(() => {
  const computer = route.query.computer
  return Array.isArray(computer) ? computer[0] || 'Unknown' : computer || 'Unknown'
})

const currentStatus = computed(() => {
  const status = route.query.status
  return Array.isArray(status) ? status[0] || '0' : status || '0'
})

const currentAddress = computed(() => {
  const address = route.query.address
  return Array.isArray(address) ? address[0] || 'Unknown' : address || 'Unknown'
})

// 菜单项配置
const menuItems = [
  {
    icon: Terminal,
    index: '/client/shell',
    title: "交互式终端"
  },
  {
    icon: File,
    index: '/client/files',
    title: "文件管理"
  },
  {
    icon: Process,
    index: '/client/pid',
    title: "进程管理"
  },
  {
    icon: Network,
    index: '/client/socks5',
    title: "网络代理"
  },
  {
    icon: Download,
    index: '/client/downloads',
    title: "下载管理"
  },
  {
    icon: Document,
    index: '/client/notes',
    title: "备注信息"
  },
  {
    icon: Picture,
    index: '/client/screenshots',
    title: "屏幕截图"
  }
]

// 当前活跃的菜单项
const activeMenu = computed(() => route.path)

// 处理菜单项点击
const handleItemClick = (path: string) => {
  const currentQuery = { ...route.query }
  router.push({ path, query: currentQuery })
}

// 返回列表
const goBack = () => {
  cancelRequest()
  router.push({ path: '/Clients' })
}
</script>

<style scoped>
.client-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--theme-gradient);
}

.client-header {
  padding: 20px 32px;
  background: white;
  border-bottom: 2px solid var(--theme-primary);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.back-button {
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-dark) 100%);
  border: none;
  color: white;
  font-weight: 600;
  transition: all 0.3s;
}

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.client-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--theme-primary);
}

.client-info {
  display: flex;
  gap: 16px;
}

.info-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s;
}

.info-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 顶部导航栏 */
.top-navigation {
  background: white;
  border-bottom: 1px solid #f0f0f0;
  padding: 0 32px;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  flex-shrink: 0;
}

.top-navigation::-webkit-scrollbar {
  height: 4px;
}

.top-navigation::-webkit-scrollbar-track {
  background: #f5f5f5;
}

.top-navigation::-webkit-scrollbar-thumb {
  background: var(--theme-primary);
  border-radius: 2px;
}

.nav-item {
  padding: 14px 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s;
  color: #606266;
  font-weight: 500;
  font-size: 15px;
  border: 1px solid transparent;
  white-space: nowrap;
}

.nav-item:hover {
  background: #fff0f6;
  border-color: var(--theme-primary);
  color: var(--theme-primary);
}

.nav-item-active {
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-dark) 100%);
  color: white;
  border-color: var(--theme-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.nav-item-active:hover {
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-dark) 100%);
  color: white;
}

.nav-icon {
  font-size: 18px;
  transition: all 0.3s;
}

.nav-label {
  font-size: 15px;
  font-weight: 600;
}

/* 主内容区域 */
.client-main-content {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
}

.content-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  padding: 32px;
  min-height: calc(100vh - 200px);
  border: 1px solid #f0f0f0;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .client-header {
    padding: 16px 24px;
  }

  .client-title {
    font-size: 24px;
  }

  .top-navigation {
    padding: 0 24px;
  }
}

@media (max-width: 768px) {
  .client-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 16px 20px;
  }

  .header-left {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .client-info {
    flex-wrap: wrap;
    width: 100%;
    justify-content: flex-start;
  }

  .top-navigation {
    padding: 0 20px;
    gap: 4px;
  }

  .nav-item {
    padding: 10px 16px;
    font-size: 14px;
  }

  .client-main-content {
    padding: 16px 20px;
  }

  .content-container {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .client-title {
    font-size: 20px;
  }

  .info-tag {
    padding: 6px 12px;
    font-size: 12px;
  }

  .nav-item {
    padding: 8px 12px;
    font-size: 13px;
  }

  .nav-icon {
    font-size: 16px;
  }
}
</style>
