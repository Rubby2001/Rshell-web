<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePermissStore } from '@/stores/userpermiss'
import { useThemeStore, type ThemeType } from '@/stores/theme'
import {
  ArrowDown,
  User,
  Key,
  SwitchButton,
  Bell,
  QuestionFilled,
  Setting,
  Menu,
  Close,
  HomeFilled,
  Monitor,
  Service,
  Connection,
  Brush
} from '@element-plus/icons-vue'
import UserApi from '@/api/user'
import { ElMessage, ElNotification } from 'element-plus'
import { cancelRequest } from "@/utils/request"

const router = useRouter()
const userinfo = useUserStore()
const permiss = usePermissStore()
const themeStore = useThemeStore()

// 移动端导航展开状态
const isMobileNavOpen = ref(false)

const username = computed(() => userinfo.getUserName() || '用户')
const userInitial = computed(() => username.value[0]?.toUpperCase() || 'U')

// 生成用户头像颜色
const extractColorByName = (name: string) => {
  if (!name) return '#409eff'

  const colors = [
    '#ff6b9d', '#ff9a9e', '#ff8fab', '#ffecd2',
    '#fcb69f', '#fecfef', '#ff9a9e', '#ff6b9d'
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

// 切换移动端导航
const toggleMobileNav = () => {
  isMobileNavOpen.value = !isMobileNavOpen.value
}

// 主题切换相关
const showThemeSelector = ref(false)
const availableThemes: { label: string; value: ThemeType; icon: string }[] = [
  { label: '粉色', value: 'pink', icon: '🌸' },
  { label: '蓝色', value: 'blue', icon: '🔵' },
  { label: '绿色', value: 'green', icon: '💚' },
  { label: '紫色', value: 'purple', icon: '💜' },
  { label: '橙色', value: 'orange', icon: '🧡' },
  { label: '青色', value: 'teal', icon: '💎' }
]

const switchTheme = (theme: ThemeType) => {
  themeStore.switchTheme(theme)
  ElMessage.success(`已切换至${availableThemes.find(t => t.value === theme)?.label}主题`)
  showThemeSelector.value = false
}

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
</script>

<template>
  <header class="header-container">
    <!-- 左侧区域 -->
    <div class="header-left">
      <!-- 移动端导航切换按钮 -->
      <div
          class="mobile-nav-toggle"
          @click="toggleMobileNav"
          :title="isMobileNavOpen ? '收起导航' : '展开导航'"
      >
        <el-icon class="toggle-icon">
          <component :is="isMobileNavOpen ? Close : Menu" />
        </el-icon>
      </div>

      <!-- 应用标题 -->
      <div class="app-title" @click="router.push('/home')" style="cursor: pointer;">
        <span class="app-name">Rshell</span>
        <span class="app-subtitle">远程管理控制台</span>
      </div>
    </div>

    <!-- 中间区域：导航栏 -->
    <div class="header-center">
      <nav class="nav-menu" :class="{ 'open': isMobileNavOpen }">
        <div class="nav-items">
          <router-link
              to="/home"
              class="nav-item"
              :class="{ 'nav-item-active': $route.path === '/home' }"
          >
            <el-icon class="nav-icon"><HomeFilled /></el-icon>
            <span class="nav-text">首页</span>
          </router-link>
          <router-link
              to="/Clients"
              class="nav-item"
              :class="{ 'nav-item-active': $route.path === '/Clients' }"
          >
            <el-icon class="nav-icon"><Monitor /></el-icon>
            <span class="nav-text">客户端管理</span>
          </router-link>
          <router-link
              to="/Listeners"
              class="nav-item"
              :class="{ 'nav-item-active': $route.path === '/Listeners' }"
          >
            <el-icon class="nav-icon"><Service /></el-icon>
            <span class="nav-text">监听器管理</span>
          </router-link>
          <router-link
              to="/Server"
              class="nav-item"
              :class="{ 'nav-item-active': $route.path === '/Server' || $route.path === '/WebDelivery' }"
          >
            <el-icon class="nav-icon"><Connection /></el-icon>
            <span class="nav-text">客户端生成</span>
          </router-link>
          <router-link
              to="/Settings"
              class="nav-item"
              :class="{ 'nav-item-active': $route.path === '/Settings' }"
          >
            <el-icon class="nav-icon"><Setting /></el-icon>
            <span class="nav-text">系统设置</span>
          </router-link>
        </div>
      </nav>
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

      <!-- 主题切换按钮 -->
      <el-popover
          v-model:visible="showThemeSelector"
          placement="bottom-end"
          :width="240"
          trigger="click"
      >
        <template #reference>
          <div class="header-action theme-action" title="切换主题">
            <span class="theme-emoji">🎨</span>
          </div>
        </template>

        <div class="theme-selector">
          <div class="theme-title">选择主题颜色</div>
          <div class="theme-grid">
            <div
                v-for="theme in availableThemes"
                :key="theme.value"
                class="theme-item"
                :class="{ 'theme-item-active': themeStore.currentTheme === theme.value }"
                @click="switchTheme(theme.value)"
                :title="theme.label"
            >
              <div
                  class="theme-color-dot"
                  :style="{ backgroundColor: themeStore.themeConfigs[theme.value].primary }"
              ></div>
              <span class="theme-label">{{ theme.label }}</span>
            </div>
          </div>
        </div>
      </el-popover>

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
  background: var(--header-bg);
  backdrop-filter: var(--glass-backdrop);
  box-shadow: 0 4px 20px color-mix(in srgb, var(--theme-primary) 15%, rgba(0,0,0,0));
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 1000;
  /**border-bottom: 2px solid rgba(255, 192, 203, 0.6);**/
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
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(0, 0, 0, 0.05);
  border: 2px solid rgba(0, 0, 0, 0.1);
}

.sidebar-toggle:hover {
  background: rgba(0, 0, 0, 0.1);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.toggle-icon {
  color: var(--theme-primary);
  font-size: 18px;
}

.app-title {
  display: flex;
  flex-direction: column;
}

.app-name {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 1px;
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-dark) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-subtitle {
  font-size: 12px;
  color: var(--theme-primary);
  margin-top: 2px;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
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
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  color: var(--theme-primary);
  position: relative;
  background: rgba(255, 255, 255, 0.5);
  border: 2px solid rgba(0, 0, 0, 0.1);
}

.header-action:hover {
  background: rgba(0, 0, 0, 0.1);
  color: var(--theme-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-icon {
  font-size: 18px;
}

.notification-action {
  position: relative;
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-dark) 100%);
  color: white;
  font-size: 10px;
  font-weight: bold;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
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
  padding: 6px 12px;
  border-radius: 12px;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.5);
  border: 2px solid rgba(0, 0, 0, 0.1);
}

.user-info:hover {
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-avatar-wrapper {
  position: relative;
}

.user-avatar {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 3px solid white;
  transition: all 0.3s;
}

.user-avatar:hover {
  transform: scale(1.05) rotate(5deg);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
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
  color: var(--theme-primary);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-dropdown-icon {
  color: #999;
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
  background: linear-gradient(135deg, var(--theme-light) 0%, var(--theme-light) 100%);
  color: var(--theme-primary);
}

.user-dropdown-menu :deep(.el-dropdown-menu__item:hover .el-icon) {
  color: var(--theme-primary);
}

.logout-item {
  color: var(--theme-primary) !important;
}

.logout-item:hover {
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-dark) 100%) !important;
  color: white !important;
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
  color: #ffffff;
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

/* 移动端导航切换按钮 */
.mobile-nav-toggle {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(0, 0, 0, 0.05);
  border: 2px solid rgba(0, 0, 0, 0.1);
}

.mobile-nav-toggle:hover {
  background: rgba(0, 0, 0, 0.1);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 导航栏样式 */
.nav-menu {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-items {
  display: flex;
  gap: 8px;
  align-items: center;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.8);
  text-decoration: none;
  min-width: 120px;
  justify-content: center;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.nav-item-active {
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-dark) 100%) !important;
  color: white !important;
  border-color: var(--theme-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.nav-icon {
  font-size: 16px;
  color: var(--theme-primary);
  transition: color 0.3s;
}

.nav-item-active .nav-icon {
  color: white !important;
}

.nav-text {
  font-size: 14px;
  font-weight: 600;
  color: #5a4a5a;
  white-space: nowrap;
}

.nav-item-active .nav-text {
  color: white !important;
}

/* 下拉菜单样式 */
.nav-item-dropdown {
  position: relative;
}

.nav-arrow {
  font-size: 12px;
  color: var(--theme-primary);
  transition: transform 0.3s;
  margin-left: 4px;
}

.nav-item:hover .nav-arrow {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  min-width: 200px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(0, 0, 0, 0.05);
  animation: slideDown 0.3s ease;
  z-index: 1001;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.dropdown-item {
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: block;
  color: #5a4a5a;
  text-decoration: none;
  margin-bottom: 4px;
  text-align: center;
}

.dropdown-item:hover {
  background: linear-gradient(135deg, var(--theme-light) 0%, var(--theme-light) 100%);
  transform: translateX(4px);
  color: var(--theme-primary);
}

.dropdown-item.router-link-active {
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-dark) 100%) !important;
  color: white;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .nav-item {
    padding: 6px 12px;
    min-width: 100px;
  }

  .nav-text {
    font-size: 13px;
  }

  .nav-icon {
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 16px;
  }

  .mobile-nav-toggle {
    display: flex !important;
  }

  .nav-menu {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    height: 0;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    transition: height 0.3s ease;
    flex-direction: column;
    justify-content: flex-start;
    padding: 0;
    z-index: 999;
    max-height: calc(100vh - 60px);
    overflow-y: auto;
  }

  .nav-menu.open {
    height: auto;
    min-height: 200px;
    padding: 20px 0;
    box-shadow: 0 8px 24px color-mix(in srgb, var(--theme-primary) 20%, rgba(0,0,0,0));
    border-bottom: 2px solid;
    border-bottom-color: color-mix(in srgb, var(--theme-primary) 15%, transparent);
  }

  .nav-items {
    flex-direction: column;
    width: 100%;
    align-items: stretch;
    padding: 0 16px;
  }

  .nav-item {
    width: 100%;
    margin-bottom: 12px;
    justify-content: flex-start;
    min-width: auto;
    padding: 12px 16px;
  }

  .nav-item-dropdown {
    flex-direction: column;
    width: 100%;
  }

  .dropdown-menu {
    position: static;
    transform: none;
    margin-top: 8px;
    box-shadow: none;
    border: 2px solid;
    border-color: color-mix(in srgb, var(--theme-primary) 15%, transparent);
    background: rgba(255, 255, 255, 0.9);
  }

  .dropdown-item {
    text-align: left;
  }

  .app-subtitle {
    display: none;
  }

  .user-name {
    max-width: 80px;
  }
}

@media (max-width: 480px) {
  .header-container {
    padding: 0 12px;
  }

  .nav-item {
    padding: 8px 10px;
  }

  .nav-text {
    font-size: 12px;
  }

  .nav-icon {
    font-size: 13px;
  }

  .nav-arrow {
    display: none;
  }

  .user-name {
    display: none;
  }
}

/* 主题选择器样式 */
.theme-action {
  position: relative;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.03) 100%);
  border-color: rgba(0, 0, 0, 0.1);
}

.theme-action:hover {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.05) 100%);
}

.theme-emoji {
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.theme-selector {
  padding: 12px 0;
}

.theme-title {
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.theme-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.theme-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f5f7fa;
  border: 2px solid transparent;
  min-height: 80px;
}

.theme-item:hover {
  background: #f0f2f5;
  transform: translateY(-2px);
}

.theme-item-active {
  background: #f5f7fa;
  border-color: var(--theme-primary);
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.15);
}

.theme-color-dot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease;
  border: 3px solid white;
}

.theme-item:hover .theme-color-dot {
  transform: scale(1.1);
}

.theme-item-active .theme-color-dot {
  transform: scale(1.15);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.theme-label {
  font-size: 12px;
  font-weight: 600;
  color: #606266;
  text-align: center;
}

.theme-item-active .theme-label {
  color: var(--theme-primary);
  font-weight: 700;
}

/* 桌面端隐藏移动端导航按钮 */
@media (min-width: 769px) {
  .mobile-nav-toggle {
    display: none;
  }
}
</style>
