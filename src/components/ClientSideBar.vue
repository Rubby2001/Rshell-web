<script setup lang="ts">
import { computed, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useSidebarStore } from "@/stores/sidebar"
import { useTaskStore } from "@/stores/taskinfo"
import { cancelRequest } from "@/utils/request"
import {
  Monitor as Terminal,
  Document as File,
  Cpu as Process,
  Connection as Network,
  Download,
  Document,
  Back,
  Position,
  Clock,
  SwitchButton
} from '@element-plus/icons-vue'

// Props定义
interface Props {
  uid: string
  user: string
  ip: string
  computer: string
  address: string
  status: string  // 添加状态
}

const props = defineProps<Props>()

const TaskStore = useTaskStore()
const sidebarStore = useSidebarStore()
const router = useRouter()
const route = useRoute()

// 菜单项配置
const menuItems = [
  {
    icon: Terminal,
    index: '/client/shell',
    title: "交互式终端",
    description: "执行命令和交互式操作",
    color: "#409eff"
  },
  {
    icon: File,
    index: '/client/files',
    title: "文件管理",
    description: "浏览和操作文件系统",
    color: "#67c23a"
  },
  {
    icon: Process,
    index: '/client/pid',
    title: "进程管理",
    description: "查看和管理系统进程",
    color: "#e6a23c"
  },
  {
    icon: Network,
    index: '/client/socks5',
    title: "网络代理",
    description: "Socks5代理隧道",
    color: "#f56c6c"
  },
  {
    icon: Download,
    index: '/client/downloads',
    title: "下载管理",
    description: "文件传输和下载",
    color: "#9254de"
  },
  {
    icon: Document,
    index: '/client/notes',
    title: "备注信息",
    description: "客户端备注和标签",
    color: "#11d1d1"
  },
  {
    icon: Back,
    index: '/Clients',
    title: "返回列表",
    description: "返回客户端列表",
    color: "#909399"
  }
]

// 当前活跃的菜单项
const activeMenu = computed(() => route.path)

// 处理菜单项点击
const handleItemClick = (path: string) => {
  if (path !== "/Clients") {
    // 获取当前的query参数
    const currentQuery = { ...route.query }
    // 导航到新路径并传递query参数
    router.push({ path, query: currentQuery })
  } else {
    cancelRequest()
    router.push({ path })
  }
}

// 获取客户端头像颜色
const getClientColor = () => {
  const colors = [
    '#409eff', '#67c23a', '#e6a23c', '#f56c6c',
    '#9254de', '#11d1d1', '#f759ab', '#36cfc9'
  ]
  const hash = props.uid.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)
  return colors[Math.abs(hash) % colors.length]
}
</script>

<template>
  <div class="client-sidebar">
    <!-- 客户端信息卡片 -->
    <div class="client-info-card">
      <div class="client-avatar-wrapper">
        <div
            class="client-avatar"
            :style="{ backgroundColor: getClientColor() }"
        >
          {{ props.user.charAt(0).toUpperCase() }}
        </div>
      </div>

      <div class="client-details">
        <div class="client-name">
          {{ props.user }}
        </div>
        <div class="client-computer">
          <el-icon class="computer-icon"><Monitor /></el-icon>
          <span class="computer-text">{{ props.computer }}</span>
        </div>
        <div class="client-address">
          <el-icon class="address-icon"><Location /></el-icon>
          <span class="address-text">{{ props.address }}</span>
        </div>
        <div class="client-ip">
          <el-icon class="ip-icon"><Position /></el-icon>
          <span class="ip-text">{{ props.ip }}</span>
        </div>
      </div>

      <div class="client-status">
        <div class="status-indicator">
          <div
              class="status-dot"
              :class="props.status === '1' ? 'status-online' : 'status-offline'"
          ></div>
          <span class="status-text">
            {{ props.status === '1' ? '在线' : '离线' }}
          </span>
        </div>
      </div>
    </div>

    <!-- 菜单列表 -->
    <div class="menu-container">
      <div
          v-for="item in menuItems"
          :key="item.index"
          class="menu-item-wrapper"
      >
        <div
            class="menu-item"
            :class="{ 'menu-item-active': activeMenu === item.index }"
            @click="handleItemClick(item.index)"
        >
          <!-- 图标区域 -->
          <div class="menu-icon-wrapper">
            <el-icon
                class="menu-icon"
                :style="{ color: activeMenu === item.index ? item.color : '#909399' }"
            >
              <component :is="item.icon" />
            </el-icon>
          </div>

          <!-- 内容区域 -->
          <div class="menu-content">
            <div class="menu-title">{{ item.title }}</div>
            <div class="menu-description">{{ item.description }}</div>
          </div>

          <!-- 活动指示器 -->
          <div v-if="activeMenu === item.index" class="active-indicator"></div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.client-sidebar {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  color: rgba(255, 255, 255, 0.8);
}

/* 客户端信息卡片 */
.client-info-card {
  padding: 24px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(255, 255, 255, 0.03);
}

.client-avatar-wrapper {
  margin-bottom: 16px;
  text-align: center;
}

.client-avatar {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: 700;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.client-details {
  text-align: center;
  margin-bottom: 16px;
}

.client-name {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}

.client-uid {
  margin-bottom: 12px;
}

.uid-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-family: 'Monaco', 'Consolas', monospace;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  display: inline-block;
}

.client-ip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.ip-icon {
  color: #409eff;
  font-size: 14px;
}

.ip-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-family: 'Monaco', 'Consolas', monospace;
}

.client-status {
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
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
  color: rgba(255, 255, 255, 0.7);
}

/* 菜单容器 */
.menu-container {
  flex: 1;
  padding: 16px 12px;
  overflow-y: auto;
}

.menu-container::-webkit-scrollbar {
  width: 4px;
}

.menu-container::-webkit-scrollbar-track {
  background: transparent;
}

.menu-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.menu-item-wrapper {
  margin-bottom: 8px;
}

.menu-item {
  position: relative;
  padding: 14px 16px;
  border-radius: 10px;
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

.menu-item-active {
  background: rgba(255, 255, 255, 0.08) !important;
  color: white !important;
}

.menu-icon-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
}

.menu-icon {
  font-size: 18px;
}

.menu-content {
  flex: 1;
  min-width: 0;
}

.menu-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.menu-description {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.3;
}

.active-indicator {
  position: absolute;
  right: 16px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

/* 侧边栏底部 */
.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
}

.connection-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.connection-icon {
  color: #409eff;
  font-size: 14px;
}

.connection-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.disconnect-btn {
  width: 100%;
  background: rgba(245, 108, 108, 0.1);
  border-color: rgba(245, 108, 108, 0.3);
  color: #f56c6c;
  font-weight: 500;
  transition: all 0.3s;
}

.disconnect-btn:hover {
  background: rgba(245, 108, 108, 0.2);
  border-color: #f56c6c;
  transform: translateY(-1px);
}

.disconnect-btn .el-icon {
  margin-right: 6px;
  font-size: 14px;
}
.client-computer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 8px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.computer-icon {
  color: #e6a23c;
  font-size: 12px;
}

.computer-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.client-address {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 12px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.address-icon {
  color: #9254de;
  font-size: 12px;
}

.address-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-family: 'Monaco', 'Consolas', monospace;
}

.status-offline {
  background: #f56c6c;
  box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.3);
}
</style>