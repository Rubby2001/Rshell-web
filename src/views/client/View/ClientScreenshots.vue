<template>
  <div class="screenshot-container">
    <el-card shadow="never" class="toolbar-card">
      <div class="toolbar-content">
        <h2 class="toolbar-title">屏幕截图</h2>
        <el-button type="primary" @click="captureScreenshot" :loading="capturing" :disabled="capturing">
          {{ capturing ? '截图中...' : '截取屏幕' }}
        </el-button>
      </div>
    </el-card>

    <div v-if="screenshots.length === 0 && !loading" class="empty-state">
      <el-empty description="暂无截图，点击上方按钮截取" />
    </div>

    <div v-loading="loading" class="screenshot-grid" v-else>
      <div v-for="shot in screenshots" :key="shot.id" class="screenshot-item">
        <el-card shadow="hover" class="screenshot-card" @click="previewId = shot.id">
          <img :src="getImageUrl(shot.id)" class="screenshot-thumb" alt="screenshot" />
          <div class="screenshot-info">
            <span class="screenshot-time">{{ formatTime(shot.createdAt) }}</span>
            <span class="screenshot-name">{{ shot.fileName }}</span>
          </div>
        </el-card>
      </div>
    </div>

    <el-dialog v-model="previewVisible" title="截图预览" width="90%" top="5vh">
      <img v-if="previewId" :src="getImageUrl(previewId)" class="preview-image" alt="screenshot preview" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import ClientAPI from '@/api/clients'
import { useRoute } from "vue-router"
import { useUserStore } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()
const uid = route.query.uid

const screenshots = ref([])
const loading = ref(false)
const capturing = ref(false)
const previewId = ref(null)

const previewVisible = computed({
  get: () => previewId.value !== null,
  set: (val) => { if (!val) previewId.value = null }
})

const fetchScreenshots = async () => {
  loading.value = true
  try {
    const res = await ClientAPI.getScreenshots({ uid })
    if (res?.data?.data) {
      screenshots.value = res.data.data
    }
  } catch {
    ElMessage.error('获取截图列表失败')
  } finally {
    loading.value = false
  }
}

const captureScreenshot = async () => {
  capturing.value = true
  try {
    await ClientAPI.captureScreenshot({ uid: route.query.uid })
    ElMessage.success('截图指令已发送')
    setTimeout(fetchScreenshots, 3000)
  } catch {
    ElMessage.error('发送截图指令失败')
  } finally {
    capturing.value = false
  }
}

const getImageUrl = (id) => {
  return `/api/client/screenshot/image?id=${id}&token=${userStore.getToken()}`
}

const formatTime = (ts) => {
  if (!ts) return ''
  const d = new Date(ts * 1000)
  return d.toLocaleString()
}

onMounted(fetchScreenshots)
</script>

<style scoped>
.screenshot-container {
  padding: 20px;
}
.toolbar-card {
  margin-bottom: 20px;
  border: none;
  border-radius: 8px;
}
.toolbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.toolbar-title {
  margin: 0;
  font-size: 20px;
  color: #303133;
}
.empty-state {
  margin-top: 60px;
}
.screenshot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
.screenshot-card {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
}
.screenshot-card:hover {
  transform: translateY(-4px);
}
.screenshot-thumb {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}
.screenshot-info {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.screenshot-time {
  font-size: 13px;
  color: #909399;
}
.screenshot-name {
  font-size: 12px;
  color: #c0c4cc;
  word-break: break-all;
}
.preview-image {
  max-width: 100%;
  max-height: 80vh;
  display: block;
  margin: 0 auto;
}
</style>
