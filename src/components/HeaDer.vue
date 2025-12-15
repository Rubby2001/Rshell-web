<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePermissStore } from '@/stores/userpermiss'
import { useSidebarStore } from '@/stores/sidebar'
import {
  ArrowDown,
  User,
  Key,
  SwitchButton,
  Expand,
  Fold,
  Bell,
  QuestionFilled,
  Setting
} from '@element-plus/icons-vue'
import UserApi from '@/api/user'
import { ElMessage, ElNotification } from 'element-plus'
import { cancelRequest } from "@/utils/request"

const router = useRouter()
const userinfo = useUserStore()
const permiss = usePermissStore()
const sidebar = useSidebarStore()

const username = computed(() => userinfo.getUserName() || '用户')
const userInitial = computed(() => username.value[0]?.toUpperCase() || 'U')

// 生成用户头像颜色
const extractColorByName = (name: string) => {
  if (!name) return '#409eff'

  const colors = [
    '#409eff', '#67c23a', '#e6a23c', '#f56c6c',
    '#909399', '#11d1d1', '#9254de', '#f759ab'
  ]

  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }

  return colors[Math.abs(hash) % colors.length]
}

// 用户头像颜色
const avatarColor = computed(() => extractColorByName(username.value))

// 通知相关
const notificationCount = ref(3)
const showNotifications = ref(false)
const notifications = ref([
  { id: 1, title: '系统更新', content: '系统已更新至v2.0版本', time: '10分钟前', read: false },
  { id: 2, title: '安全提醒', content: '检测到异常登录尝试', time: '1小时前', read: false },
  { id: 3, title: '任务完成', content: '客户端生成任务已完成', time: '2小时前', read: true },
])

// 标记所有通知为已读
const markAllAsRead = () => {
  notifications.value.forEach(notif => notif.read = true)
  notificationCount.value = 0
  ElMessage.success('已标记所有通知为已读')
}

// 切换侧边栏
const toggleSidebar = () => {
  sidebar.collapse = !sidebar.collapse
}

onMounted(() => {
  // 响应式侧边栏
  if (document.body.clientWidth < 1500) {
    sidebar.collapse = true
  }

  // 添加窗口resize监听
  const handleResize = () => {
    if (document.body.clientWidth < 1200) {
      sidebar.collapse = true
    }
  }

  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
})

// 处理下拉菜单命令
const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      await router.push('/user/info')
      break

    case 'resetpassword':
      await router.push('/user/resetpassword')
      break

    case 'settings':
      await router.push('/settings')
      break

    case 'help':
      ElNotification({
        title: '帮助中心',
        message: '如需帮助，请联系系统管理员',
        type: 'info',
        duration: 3000
      })
      break

    case 'logout':
      await handleLogout()
      break
  }
}

// 处理登出
const handleLogout = async () => {
  try {
    ElMessage.info('正在退出登录...')

    // 取消所有请求
    cancelRequest()

    // 调用登出API（如果有）
    // await UserApi.logout({ refresh: userinfo.getRefresh() })

    // 清除用户信息
    userinfo.logout()
    permiss.clear()

    // 清除存储
    localStorage.clear()
    sessionStorage.clear()

    ElMessage.success('退出成功，即将跳转到登录页面')

    // 延迟跳转
    setTimeout(() => {
      router.replace('/login').then(() => {
        window.location.reload()
      })
    }, 1000)

  } catch (error) {
    console.error('登出失败:', error)
    ElMessage.error('登出失败，请重试')
  }
}

// 显示时间
const currentTime = ref('')
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 初始化时间
onMounted(() => {
  updateTime()
  setInterval(updateTime, 60000) // 每分钟更新一次
})
</script>

<template>
  <header class="header-container">
    <!-- 左侧区域 -->
    <div class="header-left">
      <!-- 侧边栏切换按钮 -->
      <div
          class="sidebar-toggle"
          @click="toggleSidebar"
          :title="sidebar.collapse ? '展开侧边栏' : '折叠侧边栏'"
      >
        <el-icon class="toggle-icon">
          <component :is="sidebar.collapse ? Expand : Fold" />
        </el-icon>
      </div>

      <!-- 应用标题 -->
      <div class="app-title">
        <span class="app-name">Rshell</span>
        <span class="app-subtitle">远程管理控制台</span>
      </div>
    </div>

    <!-- 中间区域：当前时间 -->
    <div class="header-center">
      <div class="current-time">
        <el-icon class="time-icon"><Clock /></el-icon>
        <span class="time-text">{{ currentTime }}</span>
      </div>
    </div>

    <!-- 右侧区域 -->
    <div class="header-right">
      <!-- 帮助按钮 -->
<!--      <el-tooltip content="帮助中心" placement="bottom">-->
<!--        <div class="header-action" @click="handleCommand('help')">-->
<!--          <el-icon class="action-icon"><QuestionFilled /></el-icon>-->
<!--        </div>-->
<!--      </el-tooltip>-->

      <!-- 通知按钮 -->
<!--      <el-popover-->
<!--          v-model:visible="showNotifications"-->
<!--          placement="bottom-end"-->
<!--          :width="300"-->
<!--          trigger="click"-->
<!--          class="notification-popover"-->
<!--      >-->
<!--        <template #reference>-->
<!--          <div class="header-action notification-action" :class="{ 'has-notification': notificationCount > 0 }">-->
<!--            <el-icon class="action-icon"><Bell /></el-icon>-->
<!--            <div v-if="notificationCount > 0" class="notification-badge">-->
<!--              {{ notificationCount > 9 ? '9+' : notificationCount }}-->
<!--            </div>-->
<!--          </div>-->
<!--        </template>-->

<!--        <div class="notifications-container">-->
<!--          <div class="notifications-header">-->
<!--            <h4>通知中心</h4>-->
<!--            <el-button-->
<!--                v-if="notificationCount > 0"-->
<!--                type="text"-->
<!--                size="small"-->
<!--                @click="markAllAsRead"-->
<!--            >-->
<!--              全部已读-->
<!--            </el-button>-->
<!--          </div>-->

<!--          <div class="notifications-list">-->
<!--            <div-->
<!--                v-for="notif in notifications"-->
<!--                :key="notif.id"-->
<!--                class="notification-item"-->
<!--                :class="{ 'notification-unread': !notif.read }"-->
<!--            >-->
<!--              <div class="notification-dot" v-if="!notif.read"></div>-->
<!--              <div class="notification-content">-->
<!--                <div class="notification-title">{{ notif.title }}</div>-->
<!--                <div class="notification-desc">{{ notif.content }}</div>-->
<!--                <div class="notification-time">{{ notif.time }}</div>-->
<!--              </div>-->
<!--            </div>-->

<!--            <div v-if="notifications.length === 0" class="empty-notifications">-->
<!--              暂无新通知-->
<!--            </div>-->
<!--          </div>-->

<!--          <div class="notifications-footer">-->
<!--            <el-button type="text" size="small" @click="showNotifications = false">-->
<!--              关闭-->
<!--            </el-button>-->
<!--            <el-button type="primary" text size="small" @click="router.push('/notifications')">-->
<!--              查看全部-->
<!--            </el-button>-->
<!--          </div>-->
<!--        </div>-->
<!--      </el-popover>-->

      <!-- 用户信息 -->
      <div class="user-info">
        <div class="user-avatar-wrapper">
          <el-avatar
              class="user-avatar"
              :size="40"
              :style="{ backgroundColor: avatarColor }"
          >
            <span class="avatar-initial">{{ userInitial }}</span>
          </el-avatar>
        </div>

        <el-dropdown
            class="user-dropdown"
            trigger="click"
            @command="handleCommand"
            placement="bottom-end"
        >
          <div class="user-profile">
            <div class="user-name">{{ username }}</div>
            <el-icon class="user-dropdown-icon"><ArrowDown /></el-icon>
          </div>

          <template #dropdown>
            <el-dropdown-menu class="user-dropdown-menu">
<!--              <el-dropdown-item command="profile">-->
<!--                <el-icon><User /></el-icon>-->
<!--                <span>个人资料</span>-->
<!--              </el-dropdown-item>-->

<!--              <el-dropdown-item command="settings">-->
<!--                <el-icon><Setting /></el-icon>-->
<!--                <span>系统设置</span>-->
<!--              </el-dropdown-item>-->

              <el-dropdown-item command="resetpassword">
                <el-icon><Key /></el-icon>
                <span>修改密码</span>
              </el-dropdown-item>

<!--              <el-dropdown-item divided command="help">-->
<!--                <el-icon><QuestionFilled /></el-icon>-->
<!--                <span>帮助中心</span>-->
<!--              </el-dropdown-item>-->

              <el-dropdown-item command="logout" class="logout-item">
                <el-icon><SwitchButton /></el-icon>
                <span>退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(90deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 1000;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.sidebar-toggle {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(64, 158, 255, 0.1);
  border: 1px solid rgba(64, 158, 255, 0.2);
}

.sidebar-toggle:hover {
  background: rgba(64, 158, 255, 0.2);
  transform: scale(1.05);
}

.toggle-icon {
  color: #409eff;
  font-size: 18px;
}

.app-title {
  display: flex;
  flex-direction: column;
}

.app-name {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-subtitle {
  font-size: 12px;
  color: #7f8c8d;
  margin-top: 2px;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.current-time {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: rgba(64, 158, 255, 0.05);
  border-radius: 20px;
  border: 1px solid rgba(64, 158, 255, 0.1);
}

.time-icon {
  color: #409eff;
  font-size: 14px;
}

.time-text {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 14px;
  color: #409eff;
  font-weight: 600;
}

.header-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
}

.header-action {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  color: #5a5e66;
  position: relative;
}

.header-action:hover {
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
  transform: translateY(-1px);
}

.action-icon {
  font-size: 18px;
}

.notification-action {
  position: relative;
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  font-size: 10px;
  font-weight: bold;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

.has-notification .action-icon {
  animation: ring 2s infinite;
}

@keyframes ring {
  0%, 100% { transform: rotate(0); }
  10%, 30%, 50%, 70%, 90% { transform: rotate(10deg); }
  20%, 40%, 60%, 80% { transform: rotate(-10deg); }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.3s;
}

.user-info:hover {
  background: rgba(64, 158, 255, 0.05);
}

.user-avatar-wrapper {
  position: relative;
}

.user-avatar {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 2px solid white;
  transition: all 0.3s;
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.avatar-initial {
  font-size: 18px;
  font-weight: bold;
  color: white;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 6px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-dropdown-icon {
  color: #909399;
  font-size: 12px;
  transition: transform 0.3s;
}

.user-dropdown:hover .user-dropdown-icon {
  transform: rotate(180deg);
}

/* 下拉菜单样式 */
.user-dropdown-menu :deep(.el-dropdown-menu__item) {
  padding: 8px 20px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 150px;
}

.user-dropdown-menu :deep(.el-dropdown-menu__item .el-icon) {
  font-size: 14px;
  color: #606266;
}

.user-dropdown-menu :deep(.el-dropdown-menu__item:hover) {
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
}

.user-dropdown-menu :deep(.el-dropdown-menu__item:hover .el-icon) {
  color: #409eff;
}

.logout-item {
  color: #f56c6c !important;
}

.logout-item:hover {
  background: rgba(245, 108, 108, 0.1) !important;
}

/* 通知样式 */
.notifications-container {
  padding: 0;
}

.notifications-header {
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.notifications-header h4 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.notifications-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px 0;
}

.notification-item {
  padding: 12px 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid #f5f5f5;
}

.notification-item:hover {
  background: #f5f7fa;
}

.notification-unread {
  background: rgba(64, 158, 255, 0.03);
}

.notification-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #409eff;
  margin-top: 6px;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.notification-desc {
  font-size: 12px;
  color: #606266;
  margin-bottom: 4px;
  line-height: 1.4;
}

.notification-time {
  font-size: 11px;
  color: #909399;
}

.empty-notifications {
  padding: 40px 20px;
  text-align: center;
  color: #909399;
  font-size: 13px;
}

.notifications-footer {
  padding: 12px 16px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-container {
    padding: 0 16px;
  }

  .app-subtitle {
    display: none;
  }

  .current-time {
    display: none;
  }

  .user-name {
    max-width: 80px;
  }
}

@media (max-width: 480px) {
  .header-action:not(.notification-action) {
    display: none;
  }

  .user-name {
    display: none;
  }
}
</style>