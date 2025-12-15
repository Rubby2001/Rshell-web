<template>
  <div class="client-layout">
    <!-- 客户端信息头部 -->
    <div class="client-header">
      <h1 class="client-title">客户端管理</h1>
      <div class="client-info">
        <el-tag :type="currentStatus === '1' ? 'success' : 'danger'" size="small">
          <el-icon><CircleCheck /></el-icon>
          {{ currentStatus === '1' ? '在线' : '离线' }}
        </el-tag>
        <el-tag type="info" size="small">
          <el-icon><User /></el-icon>
          User: {{ currentUser }}
        </el-tag>
        <el-tag type="primary" size="small">
          <el-icon><Position /></el-icon>
          IP: {{ currentIp }}
        </el-tag>
        <el-tag type="warning" size="small">
          <el-icon><Monitor /></el-icon>
          PC: {{ currentComputer }}
        </el-tag>
      </div>
    </div>

    <div class="client-content-wrapper">
      <!-- 客户端专用侧边栏 -->
      <ClientSideBar
          :uid="currentUid"
          :user="currentUser"
          :ip="currentIp"
          :computer="currentComputer"
          :address="currentAddress"
          :status="currentStatus"
          class="client-sidebar"
      />

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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebar'
import { useTagsStore } from '@/stores/tags'
import ClientSideBar from '@/components/ClientSideBar.vue'
import { Position, User, Monitor } from '@element-plus/icons-vue'

const route = useRoute()
const sidebarStore = useSidebarStore()
const tags = useTagsStore()

// 从路由参数获取客户端信息 - 添加类型转换
// 在父组件中修改计算属性
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
</script>

<style scoped>
.client-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
}

.client-header {
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #ebeef5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.client-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.client-info {
  display: flex;
  gap: 12px;
}

.client-info .el-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
  font-size: 12px;
}

.client-content-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.client-sidebar {
  flex-shrink: 0;
  width: 260px;
  height: 100%;
  background: linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%);
  overflow-y: auto;
}

.client-main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: #f0f2f5;
}

.content-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 24px;
  min-height: calc(100vh - 160px);
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
@media (max-width: 768px) {
  .client-content-wrapper {
    flex-direction: column;
  }

  .client-sidebar {
    width: 100%;
    height: auto;
    max-height: 200px;
  }

  .client-main-content {
    padding: 16px;
  }

  .content-container {
    padding: 16px;
    min-height: auto;
  }
}

@media (max-width: 480px) {
  .client-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .client-info {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
}
</style>