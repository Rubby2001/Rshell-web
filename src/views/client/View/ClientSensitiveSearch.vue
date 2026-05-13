<template>
  <div class="sensitive-container">
    <el-card shadow="never" class="toolbar-card">
      <div class="toolbar-content">
        <h2 class="toolbar-title">敏感信息搜索结果</h2>
        <el-button type="primary" @click="loadResults" :loading="loading">
          {{ loading ? '刷新中...' : '刷新' }}
        </el-button>
      </div>
    </el-card>

    <div v-if="results.length === 0 && !loading" class="empty-state">
      <el-empty description="暂无搜索结果" />
    </div>

    <div v-loading="loading" class="results-list" v-else>
      <div v-for="item in results" :key="item.id" class="result-item">
        <el-card shadow="hover" class="result-card">
          <div class="result-header">
            <div class="result-time">
              <el-icon><Clock /></el-icon>
              <span>{{ formatTime(item.createdAt) }}</span>
            </div>
            <div class="result-actions">
              <el-button size="small" type="primary" @click="viewContent(item)">
                <el-icon><View /></el-icon>
                查看
              </el-button>
              <el-button size="small" type="danger" @click="deleteResult(item.id)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </div>
          <div class="result-preview" v-if="item.searchPath">
            <el-tag size="small" type="info">路径</el-tag>
            <code>{{ item.searchPath }}</code>
          </div>
          <div class="result-preview">
            <el-tag size="small" type="success">条数</el-tag>
            <code>{{ countLines(item.content) }} 行</code>
          </div>
          <div class="result-preview">
            <el-tag size="small" type="warning">内容预览</el-tag>
            <pre class="preview-text">{{ previewText(item.content) }}</pre>
          </div>
        </el-card>
      </div>
    </div>

    <el-dialog v-model="detailVisible" title="搜索结果详情" width="90%" top="5vh" class="detail-dialog">
      <div class="detail-content">
        <div class="detail-meta" v-if="currentItem">
          <el-tag>搜索时间: {{ formatTime(currentItem.createdAt) }}</el-tag>
          <el-tag v-if="currentItem.searchPath" type="info">路径: {{ currentItem.searchPath }}</el-tag>
        </div>
        <pre class="detail-text">{{ currentContent }}</pre>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ClientAPI from '@/api/clients'
import { useRoute } from "vue-router"

const route = useRoute()
const uid = route.query.uid

const results = ref([])
const loading = ref(false)
const detailVisible = ref(false)
const currentItem = ref(null)
const currentContent = ref('')

const formatTime = (ts) => {
  if (!ts) return ''
  const d = new Date(ts * 1000)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const countLines = (content) => {
  if (!content) return 0
  return content.split('\n').filter(l => l.trim()).length
}

const previewText = (content) => {
  if (!content) return ''
  const lines = content.split('\n').filter(l => l.trim())
  if (lines.length <= 10) return content
  return lines.slice(0, 10).join('\n') + '\n...'
}

const loadResults = async () => {
  loading.value = true
  try {
    const res = await ClientAPI.listSensitiveResults({ uid })
    if (res.data.status === 200) {
      results.value = res.data.data || []
    }
  } catch {
    ElMessage.error('加载搜索结果失败')
  } finally {
    loading.value = false
  }
}

const viewContent = async (item) => {
  currentItem.value = item
  currentContent.value = '加载中...'
  detailVisible.value = true
  try {
    const res = await ClientAPI.getSensitiveResultContent(item.id)
    if (res.data.status === 200) {
      currentContent.value = res.data.data || '(空)'
    } else {
      currentContent.value = '加载失败'
    }
  } catch {
    currentContent.value = '加载失败'
  }
}

const deleteResult = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该搜索结果吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const res = await ClientAPI.deleteSensitiveResult(id)
    if (res.data.status === 200) {
      ElMessage.success('已删除')
      loadResults()
    }
  } catch {
    // cancelled
  }
}

onMounted(() => {
  loadResults()
})
</script>

<style scoped>
.sensitive-container {
  padding: 20px;
}

.toolbar-card {
  margin-bottom: 20px;
}

.toolbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-title {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.empty-state {
  margin-top: 60px;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-card {
  border-radius: 12px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.result-time {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #909399;
  font-size: 13px;
}

.result-actions {
  display: flex;
  gap: 8px;
}

.result-preview {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 8px;
  font-size: 13px;
}

.result-preview code {
  color: #606266;
  word-break: break-all;
}

.preview-text {
  margin: 0;
  font-size: 12px;
  color: #606266;
  background: #f5f7fa;
  padding: 8px;
  border-radius: 4px;
  max-height: 100px;
  overflow: hidden;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.5;
  flex: 1;
}

.detail-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.detail-content {
  max-height: 70vh;
  overflow-y: auto;
}

.detail-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.detail-text {
  margin: 0;
  font-size: 13px;
  color: #333;
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.6;
}
</style>
