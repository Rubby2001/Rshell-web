<template>
  <div class="downloads-container">
    <!-- 头部卡片 -->
    <el-card shadow="never" class="header-card">
      <div class="header-content">
        <div class="header-left">
          <h2 class="header-title">
            <i class="el-icon-download"></i>
            下载文件管理
          </h2>
          <p class="header-description">
            管理从目标主机下载的文件
          </p>
        </div>
        <div class="header-right">
          <el-button
              type="primary"
              @click="refreshList"
              :loading="loading"
              class="refresh-btn"
          >
            <i class="el-icon-refresh"></i>
            刷新列表
          </el-button>
<!--          <el-button-->
<!--              v-if="selectedFiles.length > 0"-->
<!--              type="success"-->
<!--              @click="handleBatchDownload"-->
<!--              class="batch-btn"-->
<!--          >-->
<!--            <i class="el-icon-download"></i>-->
<!--            批量下载 ({{ selectedFiles.length }})-->
<!--          </el-button>-->
        </div>
      </div>
    </el-card>

    <!-- 文件列表 -->
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="table-header">
          <div class="table-title">
            <i class="el-icon-files"></i>
            <span>下载文件列表</span>
            <el-tag size="small" type="info" class="count-tag">
              {{ DownloadsTableData.length }} 个文件
            </el-tag>
          </div>
          <div class="table-actions">
            <el-input
                v-model="searchKeyword"
                placeholder="搜索文件名或路径..."
                clearable
                size="small"
                style="width: 200px; margin-right: 10px;"
                @keyup.enter="filterTableData"
            >
              <template #prefix>
                <i class="el-icon-search"></i>
              </template>
            </el-input>
            <el-dropdown @command="handleSortCommand">
              <el-button size="small">
                <i class="el-icon-sort"></i>
                排序
                <i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="name_asc">文件名 A-Z</el-dropdown-item>
                  <el-dropdown-item command="name_desc">文件名 Z-A</el-dropdown-item>
                  <el-dropdown-item command="size_asc">文件大小 ↑</el-dropdown-item>
                  <el-dropdown-item command="size_desc">文件大小 ↓</el-dropdown-item>
                  <el-dropdown-item command="progress_asc">进度 ↑</el-dropdown-item>
                  <el-dropdown-item command="progress_desc">进度 ↓</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </template>

      <!-- 空状态 -->
      <el-empty
          v-if="filteredTableData.length === 0 && !loading"
          :description="searchKeyword ? '未找到相关文件' : '暂无下载文件'"
          :image-size="100"
      >
        <el-button v-if="searchKeyword" @click="searchKeyword = ''">清空搜索</el-button>
      </el-empty>

      <!-- 文件表格 -->
      <div v-else>
        <el-table
            ref="tableRef"
            :data="filteredTableData"
            :loading="loading"
            style="width: 100%"
            class="downloads-table"
            stripe
            @selection-change="handleSelectionChange"
            @sort-change="handleSortChange"
        >
<!--          <el-table-column type="selection" width="55" align="center" />-->

          <el-table-column
              prop="fileName"
              label="文件名"
              width="300"
              sortable="custom"
          >
            <template #default="{ row }">
              <div class="file-name-cell">
                <div class="file-icon">
                  <i :class="getFileIcon(row.fileName)"></i>
                </div>
                <div class="file-info">
                  <div class="file-name">
                    <span class="name-text">{{ row.fileName }}</span>
                    <el-tag
                        v-if="row.downloadPart === 100"
                        size="mini"
                        type="success"
                        effect="plain"
                        class="complete-tag"
                    >
                      已完成
                    </el-tag>
                  </div>
                  <div class="file-format" v-if="getFileFormat(row.fileName)">
                    {{ getFileFormat(row.fileName) }}
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column
              prop="filePath"
              label="文件路径"
              min-width="250"
              show-overflow-tooltip
          >
            <template #default="{ row }">
              <span class="file-path">
                <i class="el-icon-folder-opened"></i>
                {{ row.filePath }}
              </span>
            </template>
          </el-table-column>

          <el-table-column
              prop="fileSize"
              label="文件大小"
              width="120"
              sortable="custom"
          >
            <template #default="{ row }">
              <span class="file-size">{{ row.fileSize }}</span>
            </template>
          </el-table-column>

          <el-table-column
              prop="downloadPart"
              label="下载进度"
              width="200"
              sortable="custom"
          >
            <template #default="{ row }">
              <div class="progress-cell">
                <el-progress
                    :percentage="Number(row.downloadPart)"
                    :show-text="true"
                    :status="getProgressStatus(Number(row.downloadPart))"
                    :stroke-width="8"
                />
                <div class="progress-time" v-if="Number(row.downloadPart) < 100">
                  估计剩余：{{ estimateTime(row) }}
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column
              label="操作"
              width="180"
              fixed="right"
          >
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button
                    type="primary"
                    size="small"
                    @click="handleDownload(row)"
                    :disabled="Number(row.downloadPart) < 100"
                    :loading="row.downloading"
                    class="download-btn"
                >
                  <i class="el-icon-download"></i>
                  {{ Number(row.downloadPart) === 100 ? '下载' : '等待完成' }}
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 统计信息 -->
        <div class="stats-info">
          <el-space>
            <span class="stat-item">
              <span class="stat-label">文件总数：</span>
              <span class="stat-value">{{ DownloadsTableData.length }}</span>
            </span>
            <el-divider direction="vertical" />
            <span class="stat-item">
              <span class="stat-label">已完成：</span>
              <span class="stat-value success">{{ completedCount }}</span>
            </span>
            <el-divider direction="vertical" />
            <span class="stat-item">
              <span class="stat-label">进行中：</span>
              <span class="stat-value warning">{{ downloadingCount }}</span>
            </span>
<!--            <el-divider direction="vertical" />-->
<!--            <span class="stat-item">-->
<!--              <span class="stat-label">总大小：</span>-->
<!--              <span class="stat-value">{{ totalSize }}</span>-->
<!--            </span>-->
          </el-space>
        </div>
      </div>
    </el-card>

    <!-- 文件预览对话框 -->
    <el-dialog
        v-model="previewVisible"
        :title="`预览文件 - ${previewFile?.fileName}`"
        width="80%"
        top="5vh"
    >
      <div class="preview-content">
        <div v-if="previewLoading" class="preview-loading">
          <el-skeleton :rows="5" animated />
        </div>
        <div v-else-if="previewText" class="preview-text">
          <pre>{{ previewText }}</pre>
        </div>
        <div v-else-if="previewFile && previewFile.fileName.match(/\.(jpg|jpeg|png|gif|bmp)$/i)" class="preview-image">
          <el-image
              :src="previewImageUrl"
              fit="contain"
              :preview-src-list="[previewImageUrl]"
          />
        </div>
        <div v-else class="preview-not-supported">
          <i class="el-icon-document"></i>
          <p>暂不支持预览此文件类型</p>
          <p>请下载后查看</p>
        </div>
      </div>
    </el-dialog>

    <!-- 文件信息对话框 -->
    <el-dialog
        v-model="infoVisible"
        :title="`文件信息 - ${currentFile?.fileName}`"
        width="500px"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="文件名">
          {{ currentFile?.fileName }}
        </el-descriptions-item>
        <el-descriptions-item label="完整路径">
          {{ currentFile?.filePath }}
        </el-descriptions-item>
        <el-descriptions-item label="文件大小">
          {{ formatFileSize(currentFile?.fileSize) }}
        </el-descriptions-item>
        <el-descriptions-item label="下载进度">
          <el-progress :percentage="Number(currentFile?.downloadPart)" :show-text="false" />
          {{ Number(currentFile?.downloadPart) }}%
        </el-descriptions-item>
        <el-descriptions-item label="文件类型">
          {{ getFileFormat(currentFile?.fileName) || '未知' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" v-if="currentFile?.createTime">
          {{ formatTime(currentFile.createTime) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 批量下载确认 -->
    <el-dialog
        v-model="batchDialogVisible"
        title="批量下载确认"
        width="500px"
    >
      <div class="batch-dialog-content">
        <el-alert
            title="注意"
            type="info"
            :closable="false"
            show-icon
        >
          将批量下载 {{ selectedFiles.length }} 个文件，总计 {{ formatFileSize(selectedTotalSize) }}
        </el-alert>

        <div class="batch-file-list">
          <el-table :data="selectedFiles" height="200">
            <el-table-column property="fileName" label="文件名" />
            <el-table-column property="fileSize" label="大小" width="100">
              <template #default="{ row }">
                {{ formatFileSize(row.fileSize) }}
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="batch-actions">
          <el-checkbox v-model="compressFiles" label="压缩为ZIP文件下载" />
        </div>
      </div>
      <template #footer>
        <el-button @click="batchDialogVisible = false">取消</el-button>
        <el-button
            type="primary"
            @click="confirmBatchDownload"
            :loading="batchDownloading"
        >
          开始下载
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from "vue-router"
import ClientAPI from "@/api/clients"
import { ElMessage, ElMessageBox } from "element-plus"
import type { TableInstance } from 'element-plus'

const route = useRoute()
const DownloadsTableData = ref<any[]>([])
const loading = ref(false)
const tableRef = ref<TableInstance>()
const searchKeyword = ref('')
const sortType = ref('')
const selectedFiles = ref<any[]>([])
const previewVisible = ref(false)
const infoVisible = ref(false)
const previewLoading = ref(false)
const previewText = ref('')
const previewImageUrl = ref('')
const previewFile = ref<any>(null)
const currentFile = ref<any>(null)
const batchDialogVisible = ref(false)
const compressFiles = ref(true)
const batchDownloading = ref(false)

const uid = route.query.uid

// 计算属性
const filteredTableData = computed(() => {
  let data = DownloadsTableData.value

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    data = data.filter(item =>
        item.fileName.toLowerCase().includes(keyword) ||
        item.filePath.toLowerCase().includes(keyword)
    )
  }

  // 排序
  if (sortType.value) {
    data = [...data].sort((a, b) => {
      switch (sortType.value) {
        case 'name_asc':
          return a.fileName.localeCompare(b.fileName)
        case 'name_desc':
          return b.fileName.localeCompare(a.fileName)
        case 'size_asc':
          return (a.fileSize || 0) - (b.fileSize || 0)
        case 'size_desc':
          return (b.fileSize || 0) - (a.fileSize || 0)
        case 'progress_asc':
          return (Number(a.downloadPart) || 0) - (Number(b.downloadPart) || 0)
        case 'progress_desc':
          return (Number(b.downloadPart) || 0) - (Number(a.downloadPart) || 0)
        default:
          return 0
      }
    })
  }

  return data
})

const completedCount = computed(() => {
  return DownloadsTableData.value.filter(item => Number(item.downloadPart) === 100).length
})

const downloadingCount = computed(() => {
  return DownloadsTableData.value.filter(item => Number(item.downloadPart) < 100).length
})

const totalSize = computed(() => {
  return DownloadsTableData.value.reduce((sum, item) => sum + (item.fileSize || 0), 0)
})

const selectedTotalSize = computed(() => {
  return selectedFiles.value.reduce((sum, item) => sum + (item.fileSize || 0), 0)
})

// 文件类型相关函数
const getFileIcon = (fileName: string) => {
  if (!fileName) return 'el-icon-document'

  const extension = fileName.split('.').pop()?.toLowerCase()
  const iconMap: Record<string, string> = {
    // 文本文件
    'txt': 'el-icon-document',
    'md': 'el-icon-document',
    'log': 'el-icon-document',
    'ini': 'el-icon-document',
    'cfg': 'el-icon-document',
    'conf': 'el-icon-document',

    // 代码文件
    'js': 'el-icon-document',
    'ts': 'el-icon-document',
    'html': 'el-icon-document',
    'css': 'el-icon-document',
    'py': 'el-icon-document',
    'java': 'el-icon-document',
    'cpp': 'el-icon-document',
    'go': 'el-icon-document',
    'php': 'el-icon-document',
    'sql': 'el-icon-document',
    'xml': 'el-icon-document',
    'json': 'el-icon-document',

    // 图片文件
    'jpg': 'el-icon-picture',
    'jpeg': 'el-icon-picture',
    'png': 'el-icon-picture',
    'gif': 'el-icon-picture',
    'bmp': 'el-icon-picture',
    'svg': 'el-icon-picture',

    // 压缩文件
    'zip': 'el-icon-folder',
    'rar': 'el-icon-folder',
    '7z': 'el-icon-folder',
    'tar': 'el-icon-folder',
    'gz': 'el-icon-folder',

    // 可执行文件
    'exe': 'el-icon-cpu',
    'msi': 'el-icon-cpu',
    'bat': 'el-icon-cpu',
    'sh': 'el-icon-cpu',
    'bin': 'el-icon-cpu',

    // 文档文件
    'pdf': 'el-icon-document',
    'doc': 'el-icon-document',
    'docx': 'el-icon-document',
    'xls': 'el-icon-document',
    'xlsx': 'el-icon-document',
    'ppt': 'el-icon-document',
    'pptx': 'el-icon-document',
  }

  return iconMap[extension || ''] || 'el-icon-document'
}

const getFileFormat = (fileName: string) => {
  if (!fileName) return ''
  const extension = fileName.split('.').pop()?.toUpperCase()
  return extension || ''
}

const canPreview = (fileName: string) => {
  if (!fileName) return false
  const previewable = [
    'txt', 'md', 'log', 'ini', 'cfg', 'conf',
    'js', 'ts', 'html', 'css', 'py', 'java',
    'cpp', 'go', 'php', 'sql', 'xml', 'json',
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'
  ]
  const extension = fileName.split('.').pop()?.toLowerCase()
  return previewable.includes(extension || '')
}

// 格式化函数
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString()
}

const getProgressStatus = (percentage: number) => {
  if (percentage === 100) return 'success'
  if (percentage >= 75) return 'warning'
  if (percentage >= 50) return ''
  if (percentage >= 25) return 'exception'
  return 'exception'
}

const estimateTime = (file: any) => {
  if (Number(file.downloadPart) >= 100) return '已完成'
  if (!file.fileSize || !file.downloadSpeed) return '计算中...'

  const remainingBytes = file.fileSize * (1 - Number(file.downloadPart) / 100)
  const remainingSeconds = remainingBytes / file.downloadSpeed
  return remainingSeconds > 3600
      ? `${Math.ceil(remainingSeconds / 3600)}小时`
      : remainingSeconds > 60
          ? `${Math.ceil(remainingSeconds / 60)}分钟`
          : `${Math.ceil(remainingSeconds)}秒`
}

// 主要方法
const fetchDownloadsInfo = async () => {
  try {
    const res = await ClientAPI.get_downloads_info({ uid })
    if (res.data?.status === 200) {
      DownloadsTableData.value = (res.data.data || []).map((item: any) => ({
        ...item,
        downloading: false
      }))
    }
  } catch (error) {
    console.error('获取下载信息失败:', error)
    if (!loading.value) {
      ElMessage.error('获取下载信息失败')
    }
  }
}

const refreshList = async () => {
  loading.value = true
  await fetchDownloadsInfo()
  loading.value = false
  ElMessage.success('列表已刷新')
}

const handleDownload = async (row: any) => {
  if (Number(row.downloadPart) < 100) {
    ElMessage.warning('文件尚未下载完成，请等待')
    return
  }

  try {
    await ElMessageBox.confirm(
        `是否下载文件 "${row.fileName}"？`,
        '下载确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    )

    row.downloading = true
    ElMessage.info('开始下载文件...')

    const res = await ClientAPI.download_downloaded_file({ uid, filePath: row.filePath })

    if (res.status === 200) {
      // 提取文件名
      let fileName = row.fileName
      const contentDisposition = res.headers['content-disposition'] || ''
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition)
      if (matches && matches.length > 1) {
        fileName = decodeURIComponent(matches[1].replace(/['"]/g, ''))
      }

      // 创建 Blob 并下载
      const blob = new Blob([res.data], { type: res.headers['content-type'] || 'application/octet-stream' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      ElMessage.success('文件下载成功')
    } else {
      ElMessage.error('下载失败，请稍后重试')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('下载失败:', error)
      ElMessage.error(`下载失败: ${error.message || '未知错误'}`)
    } else {
      ElMessage.info('已取消下载')
    }
  } finally {
    row.downloading = false
  }
}

// 表格事件
const handleSelectionChange = (selection: any[]) => {
  selectedFiles.value = selection
}

const handleSortCommand = (command: string) => {
  sortType.value = command
}

const handleSortChange = ({ column, prop, order }: any) => {
  if (order === 'ascending') {
    sortType.value = `${prop}_asc`
  } else if (order === 'descending') {
    sortType.value = `${prop}_desc`
  } else {
    sortType.value = ''
  }
}

// 更多操作
// const handleCommand = async (command: string, row: any) => {
//   currentFile.value = row
//
//   switch (command) {
//     case 'preview':
//       await handlePreview(row)
//       break
//     case 'info':
//       infoVisible.value = true
//       break
//     case 'copy':
//       navigator.clipboard.writeText(row.filePath)
//       ElMessage.success('文件路径已复制到剪贴板')
//       break
//     case 'delete':
//       await handleDelete(row)
//       break
//   }
// }

// const handlePreview = async (row: any) => {
//   if (!canPreview(row.fileName)) {
//     ElMessage.warning('不支持预览此文件类型')
//     return
//   }
//
//   previewFile.value = row
//   previewVisible.value = true
//   previewLoading.value = true
//   previewText.value = ''
//   previewImageUrl.value = ''
//
//   try {
//     // 这里需要根据文件类型进行不同的预览处理
//     // 对于图片文件
//     if (row.fileName.match(/\.(jpg|jpeg|png|gif|bmp|svg)$/i)) {
//       // 在实际项目中，这里应该调用API获取图片的base64或URL
//       previewImageUrl.value = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' // 占位图片
//     } else {
//       // 对于文本文件
//       const res = await ClientAPI.preview_file({ uid, filePath: row.filePath })
//       if (res.data?.status === 200) {
//         previewText.value = res.data.data || '文件内容为空'
//       } else {
//         previewText.value = '无法获取文件内容'
//       }
//     }
//   } catch (error) {
//     console.error('预览失败:', error)
//     previewText.value = '预览失败，请下载后查看'
//   } finally {
//     previewLoading.value = false
//   }
// }

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
        `确定要删除文件记录 "${row.fileName}" 吗？此操作不会删除服务器上的文件。`,
        '确认删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    )

    // 调用删除API
    // await ClientAPI.delete_file_record({ uid, filePath: row.filePath })
    await fetchDownloadsInfo()
    ElMessage.success('文件记录已删除')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 批量下载
const handleBatchDownload = () => {
  if (selectedFiles.value.length === 0) {
    ElMessage.warning('请先选择要下载的文件')
    return
  }

  batchDialogVisible.value = true
}

const confirmBatchDownload = async () => {
  batchDownloading.value = true
  try {
    // 在实际项目中，这里应该调用批量下载API
    // const res = await ClientAPI.batch_download({
    //   uid,
    //   filePaths: selectedFiles.value.map(f => f.filePath),
    //   compress: compressFiles.value
    // })

    // 模拟批量下载
    for (const file of selectedFiles.value) {
      if (Number(file.downloadPart) === 100) {
        await handleDownload(file)
        await new Promise(resolve => setTimeout(resolve, 100)) // 稍微延迟一下
      }
    }

    batchDialogVisible.value = false
    ElMessage.success('批量下载完成')
  } catch (error) {
    console.error('批量下载失败:', error)
    ElMessage.error('批量下载失败')
  } finally {
    batchDownloading.value = false
  }
}

// 过滤表格数据
const filterTableData = () => {
  // 搜索功能已经在计算属性中实现
  ElMessage.info(`找到 ${filteredTableData.value.length} 个文件`)
}

// 初始化
onMounted(async () => {
  await refreshList()

  // 设置定时刷新
  const intervalId = setInterval(fetchDownloadsInfo, 2000)

  onUnmounted(() => {
    clearInterval(intervalId)
  })
})
</script>

<style scoped>
.downloads-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 头部卡片 */
.header-card {
  margin-bottom: 20px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header-card :deep(.el-card__body) {
  padding: 24px 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.header-left {
  flex: 1;
}

.header-title {
  display: flex;
  align-items: center;
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.header-title i {
  margin-right: 12px;
  font-size: 28px;
}

.header-description {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

.refresh-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  margin-right: 10px;
}

.refresh-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.batch-btn {
  background: rgba(46, 204, 113, 0.8);
  border: 1px solid rgba(46, 204, 113, 0.3);
}

.batch-btn:hover {
  background: rgba(46, 204, 113, 1);
}

/* 表格卡片 */
.table-card {
  border: none;
  border-radius: 8px;
  margin-bottom: 20px;
}

.table-card :deep(.el-card__header) {
  border-bottom: 1px solid #f0f0f0;
  padding: 20px 24px;
}

.table-card :deep(.el-card__body) {
  padding: 0;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
}

.table-title i {
  color: #409eff;
}

.count-tag {
  margin-left: 10px;
}

.table-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 文件表格 */
.downloads-table :deep(.el-table__header) {
  background-color: #fafafa;
}

.downloads-table :deep(.el-table__header th) {
  font-weight: 600;
  color: #303133;
}

/* 文件名单元格 */
.file-name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-icon {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  background: #f0f7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
  font-size: 18px;
}

.file-info {
  flex: 1;
  overflow: hidden;
}

.file-name {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.name-text {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.complete-tag {
  flex-shrink: 0;
}

.file-format {
  font-size: 12px;
  color: #909399;
  background: #f5f5f5;
  padding: 1px 6px;
  border-radius: 2px;
  display: inline-block;
}

/* 文件路径 */
.file-path {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #606266;
}

.file-path i {
  color: #909399;
}

/* 文件大小 */
.file-size {
  font-family: 'Monaco', 'Consolas', monospace;
  font-weight: 500;
  color: #409eff;
}

/* 进度单元格 */
.progress-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progress-time {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.download-btn {
  flex: 1;
}

.more-btn {
  padding: 7px;
  color: #909399;
}

.more-btn:hover {
  color: #409eff;
}

/* 统计信息 */
.stats-info {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  background-color: #fafafa;
}

.stat-item {
  display: inline-flex;
  align-items: center;
}

.stat-label {
  color: #606266;
  font-size: 14px;
}

.stat-value {
  font-weight: 600;
  font-size: 16px;
  margin-left: 4px;
}

.stat-value.success {
  color: #67c23a;
}

.stat-value.warning {
  color: #e6a23c;
}

/* 预览对话框 */
.preview-content {
  min-height: 400px;
  max-height: 70vh;
  overflow: auto;
}

.preview-loading {
  padding: 40px;
  text-align: center;
}

.preview-text pre {
  margin: 0;
  padding: 20px;
  background: #f6f8fa;
  border-radius: 4px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.6;
  overflow: auto;
  max-height: 60vh;
}

.preview-image {
  text-align: center;
  padding: 20px;
}

.preview-image :deep(.el-image) {
  max-height: 60vh;
  max-width: 100%;
}

.preview-not-supported {
  text-align: center;
  padding: 80px 20px;
  color: #909399;
}

.preview-not-supported i {
  font-size: 48px;
  margin-bottom: 20px;
  display: block;
}

/* 批量下载对话框 */
.batch-dialog-content {
  padding: 10px 0;
}

.batch-file-list {
  margin: 20px 0;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.batch-actions {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

/* 删除选项样式 */
.delete-item {
  color: #f56c6c;
}

.delete-item i {
  color: #f56c6c;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .table-header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .table-actions {
    flex-wrap: wrap;
  }

  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .download-btn {
    width: 100%;
  }
}
</style>