<template>
  <div class="file-manager-container">
    <!-- 操作工具栏 -->
    <div class="toolbar">
      <el-input
          v-model="searchKeyword"
          placeholder="搜索文件或文件夹..."
          clearable
          @clear="clearSearch"
          class="search-input"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-button-group>
        <el-button type="primary" :icon="Refresh" @click="refreshCurrentFolder">刷新</el-button>
        <el-button type="success" :icon="Upload" @click="triggerUpload">上传文件</el-button>
        <el-button type="warning" :icon="FolderAdd" @click="handleMkDir(currentFolder?.path || './')">新建文件夹</el-button>
        <el-button :icon="HomeFilled" @click="goToRoot">根目录</el-button>
        <el-button :icon="Platform" @click="handleDrives">驱动器</el-button>
      </el-button-group>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧文件树 -->
      <div class="file-tree-panel">
        <div class="panel-header">
          <el-icon><FolderOpened /></el-icon>
          <span>文件树</span>
        </div>
        <div class="tree-container">
          <el-tree
              ref="fileTreeRef"
              :data="filteredFileTree"
              :props="defaultProps"
              node-key="path"
              :highlight-current="true"
              :expand-on-click-node="false"
              :default-expand-all="false"
              @node-click="handleNodeClick"
              @node-expand="handleNodeExpand"
              @node-collapse="handleNodeCollapse"
              v-loading="treeLoading"
          >
            <template #default="{ node, data }">
              <div class="tree-node">
                <span
                    class="node-content"
                    @dblclick="handleNodeDoubleClick(data)"
                    :class="{ 'is-current': currentFolder?.path === data.path }"
                >
                  <el-icon v-if="data.type === 'D'" class="folder-icon">
                    <FolderOpened v-if="node.expanded" />
                    <Folder v-else />
                  </el-icon>
                  <el-icon v-else class="file-icon">
                    <Document />
                  </el-icon>
                  <span class="node-name">{{ data.name }}</span>
                </span>

                <!-- 文件大小显示 -->
                <span v-if="data.type === 'F'" class="file-size">
                  {{ data.size }}
                </span>
              </div>
            </template>

            <template #empty>
              <div class="empty-tree">
                <el-icon><FolderOpened /></el-icon>
                <p>空文件夹</p>
              </div>
            </template>
          </el-tree>
        </div>
      </div>

      <!-- 右侧文件详情 -->
      <div class="file-details-panel">
        <!-- 当前路径导航 -->
        <div class="path-navigation">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item
                v-for="(item, index) in breadcrumbItems"
                :key="index"
                @click="navigateToPath(item.path)"
            >
              <el-icon v-if="index === 0"><HomeFilled /></el-icon>
              <span>{{ item.name }}</span>
            </el-breadcrumb-item>
          </el-breadcrumb>

          <el-input
              v-model="currentPathInput"
              @keyup.enter="navigateToPath(currentPathInput)"
              @blur="updatePathInput"
              placeholder="输入路径或按Enter跳转"
              class="path-input"
          >
            <template #append>
              <el-button :icon="Search" @click="navigateToPath(currentPathInput)" />
            </template>
          </el-input>
        </div>

        <!-- 文件列表 -->
        <div class="file-list-container">
          <div v-if="currentFolder" class="file-list-header">
            <div class="header-info">
              <h3>{{ currentFolder.name }}</h3>
              <span class="file-count">
                共 {{ currentFolderContent.length }} 个项目
                <span v-if="selectedItems.length > 0"> (已选择 {{ selectedItems.length }} 个)</span>
              </span>
            </div>

            <div class="header-actions">
              <el-button
                  v-if="selectedItems.length > 0"
                  type="danger"
                  size="small"
                  @click="batchDelete"
                  :disabled="batchDeleting"
              >
                <el-icon><Delete /></el-icon>
                批量删除
              </el-button>

              <el-dropdown @command="handleSortCommand">
                <el-button size="small">
                  <el-icon><Sort /></el-icon>
                  排序方式
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="name">按名称</el-dropdown-item>
                    <el-dropdown-item command="size">按大小</el-dropdown-item>
                    <el-dropdown-item command="time">按修改时间</el-dropdown-item>
                    <el-dropdown-item command="type">按类型</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>

          <!-- 文件列表表格 -->
          <el-table
              :data="sortedContent"
              style="width: 100%"
              @selection-change="handleSelectionChange"
              @row-dblclick="handleRowDblClick"
              v-loading="contentLoading"
              empty-text="该文件夹为空"
          >
            <el-table-column type="selection" width="55" />

            <el-table-column prop="name" label="名称" min-width="200">
              <template #default="{ row }">
                <div class="file-item" @click="handleFileClick(row)">
                  <el-icon class="file-icon" :class="row.type">
                    <FolderOpened v-if="row.type === 'D' && row.expanded" />
                    <Folder v-else-if="row.type === 'D'" />
                    <Document v-else />
                  </el-icon>
                  <span class="file-name">{{ row.name }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                <el-tag :type="row.type === 'D' ? 'warning' : 'info'" size="small">
                  {{ row.type === 'D' ? '文件夹' : getFileType(row.name) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="size" label="大小" width="120" sortable>
              <template #default="{ row }">
                <span v-if="row.type === 'F'">{{ row.size }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>

            <el-table-column prop="modifiedTime" label="修改时间" width="180" sortable>
              <template #default="{ row }">
                {{ formatDateTime(row.modifiedTime) }}
              </template>
            </el-table-column>

            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button
                      v-if="row.type === 'F'"
                      type="primary"
                      size="small"
                      @click="handleDownload(row)"
                      :loading="downloadingFile === row.path"
                  >
                    <el-icon><Download /></el-icon>
                  </el-button>

                  <el-button
                      v-if="row.type === 'D'"
                      type="success"
                      size="small"
                      @click="navigateToFolder(row.path)"
                  >
                    <el-icon><FolderOpened /></el-icon>
                  </el-button>

                  <el-dropdown @command="(command) => handleFileCommand(command, row)">
                    <el-button size="small">
                      <el-icon><More /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
<!--                        <el-dropdown-item command="rename">-->
<!--                          <el-icon><Edit /></el-icon> 重命名-->
<!--                        </el-dropdown-item>-->
                        <el-dropdown-item command="copy">
                          <el-icon><CopyDocument /></el-icon> 复制路径
                        </el-dropdown-item>
                        <el-dropdown-item command="info">
                          <el-icon><InfoFilled /></el-icon> 详细信息
                        </el-dropdown-item>
                        <el-dropdown-item command="delete" divided>
                          <el-icon><Delete /></el-icon> 删除
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 文件预览面板 -->
        <div v-if="selectedFileContent" class="file-preview-panel">
          <div class="preview-header">
            <h4>{{ selectedFile.name }}</h4>
            <div class="preview-actions">
              <el-button
                  type="primary"
                  size="small"
                  @click="handleDownload(selectedFile)"
                  :loading="downloadingFile === selectedFile.path"
              >
                下载
              </el-button>
              <el-button size="small" @click="closePreview">关闭</el-button>
            </div>
          </div>
          <div class="preview-content">
            <pre>{{ selectedFileContent }}</pre>
          </div>
        </div>
      </div>
    </div>

    <!-- 上传对话框 -->
    <el-upload
        v-show="false"
        ref="uploadRef"
        :action="''"
        :limit="5"
        :multiple="true"
        :file-list="fileList"
        :on-change="handleFileChange"
        :before-upload="beforeUpload"
        :auto-upload="false"
    >
    </el-upload>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useGlobalFileTreeStore } from "@/stores/fileTree"
import { useCurrentFileNode } from '@/stores/currentFileNode'
import ClientAPI from "@/api/clients"
import {
  Search,
  Refresh,
  Upload,
  FolderAdd,
  HomeFilled,
  Platform,
  FolderOpened,
  Folder,
  Document,
  Delete,
  Sort,
  Download,
  More,
  Edit,
  CopyDocument,
  InfoFilled,
  Loading
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'

const route = useRoute()
const uid = String(route.query.uid)
const loading = ref(false)
const treeLoading = ref(false)
const contentLoading = ref(false)
const batchDeleting = ref(false)
const downloadingFile = ref(null)

// 数据引用
const fileTree = ref([])
const currentFolder = ref(null)
const currentFolderContent = ref([])
const selectedFile = ref(null)
const selectedFileContent = ref('')
const fileTreeRef = ref(null)
const uploadRef = ref(null)
const searchKeyword = ref('')
const currentPathInput = ref('')
const selectedItems = ref([])
const sortOrder = ref({ key: 'name', direction: 'asc' })

const globalFileTree = useGlobalFileTreeStore()
const currentFileNode = useCurrentFileNode()

const defaultProps = {
  children: 'children',
  label: 'name'
}

// 计算属性
const filteredFileTree = computed(() => {
  const filterDots = (nodes) => nodes
      .filter(node => node.name !== '.' && node.name !== '..')
      .map(node => ({
        ...node,
        children: node.children ? filterDots(node.children) : []
      }))
  return filterDots(fileTree.value)
})

const breadcrumbItems = computed(() => {
  if (!currentFolder.value?.path) return []

  const path = currentFolder.value.path
  const parts = path.split('/').filter(p => p)

  const items = []
  let currentPath = ''

  // 添加根目录
  items.push({
    name: '根目录',
    path: '/'
  })

  // 添加各级路径
  parts.forEach((part, index) => {
    currentPath = index === 0 ? `/${part}` : `${currentPath}/${part}`
    items.push({
      name: part,
      path: currentPath
    })
  })

  return items
})

const sortedContent = computed(() => {
  const items = [...currentFolderContent.value]

  // 搜索过滤
  const filtered = searchKeyword.value
      ? items.filter(item =>
          item.name.toLowerCase().includes(searchKeyword.value.toLowerCase()))
      : items

  // 排序
  return filtered.sort((a, b) => {
    let aValue, bValue

    switch (sortOrder.value.key) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'size':
        aValue = a.type === 'D' ? -1 : parseInt(a.size) || 0
        bValue = b.type === 'D' ? -1 : parseInt(b.size) || 0
        break
      case 'time':
        aValue = new Date(a.modifiedTime).getTime()
        bValue = new Date(b.modifiedTime).getTime()
        break
      case 'type':
        aValue = a.type + a.name.split('.').pop()
        bValue = b.type + b.name.split('.').pop()
        break
      default:
        return 0
    }

    const direction = sortOrder.value.direction === 'asc' ? 1 : -1
    return (aValue > bValue ? 1 : -1) * direction
  })
})

// 方法
// const formatFileSize = (bytes) => {
//   if (!bytes || bytes === 0) return '0 B'
//
//   const k = 1024
//   const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
//   const i = Math.floor(Math.log(bytes) / Math.log(k))
//
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
// }

const formatDateTime = (dateString) => {
  if (!dateString) return '-'

  // 检查是否是 18/04/2025 15:13:13 这种格式
  const match = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/)

  if (match) {
    // 日/月/年 时:分:秒
    const [_, day, month, year, hours, minutes, seconds] = match
    // 注意：月份从0开始，所以要减1
    const date = new Date(year, month - 1, day, hours, minutes, seconds)
    return date.toLocaleString('zh-CN')
  }

  // 尝试其他格式
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return dateString // 返回原字符串
    }
    return date.toLocaleString('zh-CN')
  } catch {
    return dateString // 返回原字符串
  }
}

const getFileType = (filename) => {
  const ext = filename.split('.').pop().toLowerCase()
  const extensions = {
    txt: '文本文件',
    pdf: 'PDF文档',
    doc: 'Word文档',
    docx: 'Word文档',
    xls: 'Excel表格',
    xlsx: 'Excel表格',
    ppt: 'PPT演示',
    pptx: 'PPT演示',
    jpg: 'JPEG图片',
    jpeg: 'JPEG图片',
    png: 'PNG图片',
    gif: 'GIF图片',
    mp4: 'MP4视频',
    avi: 'AVI视频',
    mp3: 'MP3音频',
    zip: '压缩文件',
    rar: '压缩文件'
  }
  return extensions[ext] || '文件'
}

const fetchFileTree = async (dirPath) => {
  treeLoading.value = true
  try {
    const res = await ClientAPI.get_file_tree({ uid: uid, dirPath: dirPath })
    if (res.data) {
      fileTree.value = res.data.data
      globalFileTree.updateEntry(uid, fileTree.value)
    }
  } catch (error) {
    console.error('Error fetching file tree:', error)
    ElNotification.error({
      title: '加载失败',
      message: '无法获取文件树数据'
    })
  } finally {
    treeLoading.value = false
  }
}

const handleDrives = async () => {
  try {
    const res = await ClientAPI.get_drives({ uid: uid })
    fileTree.value = res.data.data
    globalFileTree.updateEntry(uid, fileTree.value)
    ElMessage.success('已切换到驱动器视图')
  } catch (error) {
    console.error("Error fetching file tree:", error)
  }
}

const navigateToPath = async (path) => {
  if (!path || path.trim() === '') return

  contentLoading.value = true
  try {
    await fetchFileTree(path)

    const updatedItem = findTreeNodeByPath(path, fileTree.value)
    if (updatedItem) {
      currentFolder.value = updatedItem
      currentFolderContent.value = updatedItem.children || []
      currentFileNode.setFileNode(uid, updatedItem.path)
      currentPathInput.value = updatedItem.path

      if (updatedItem && fileTreeRef.value) {
        await nextTick()
        fileTreeRef.value.setCurrentKey(updatedItem.path)
        const node = fileTreeRef.value.store.nodesMap[updatedItem.path]
        if (node) {
          node.expanded = true
        }
      }
    }
  } catch (error) {
    ElMessage.error('路径不存在或无法访问')
  } finally {
    contentLoading.value = false
  }
}

const handleNodeClick = async (node) => {
  if (node.type === 'D') {
    await navigateToPath(node.path)
  } else if (node.type === 'F') {
    await fetchFileContent(node)
  }
}

const handleNodeDoubleClick = async (node) => {
  if (node.type === 'D') {
    await navigateToPath(node.path)
  } else {
    await fetchFileContent(node)
  }
}

const handleRowDblClick = (row) => {
  if (row.type === 'D') {
    navigateToPath(row.path)
  } else {
    fetchFileContent(row)
  }
}

const handleNodeExpand = (node) => {
  node.expanded = true
}

const handleNodeCollapse = (node) => {
  node.expanded = false
}

const findTreeNodeByPath = (path, root) => {
  if (!path) return null

  const search = (node) => {
    if (node.path === path) return node
    if (node.children) {
      for (const child of node.children) {
        const result = search(child)
        if (result) return result
      }
    }
    return null
  }

  if (Array.isArray(root)) {
    for (const node of root) {
      const result = search(node)
      if (result) return result
    }
  } else if (root) {
    return search(root)
  }

  return null
}

const fetchFileContent = async (file) => {
  if (file.type !== 'F') return

  selectedFile.value = file
  contentLoading.value = true
  try {
    const res = await ClientAPI.fetch_file_content({ uid: uid, path: file.path })
    selectedFileContent.value = res.data.content
  } catch (error) {
    console.error("Error fetching file content:", error)
    selectedFileContent.value = "无法加载文件内容"
    ElMessage.error('文件读取失败')
  } finally {
    contentLoading.value = false
  }
}

const closePreview = () => {
  selectedFile.value = null
  selectedFileContent.value = ''
}

const handleFileChange = async (file) => {
  const formData = new FormData()
  formData.append('file', file.raw)
  formData.append('uploadPath', `${currentFolder.value?.path || './'}/${file.name}`)

  try {
    const res = await ClientAPI.upload_file({
      uid: uid,
      file: file.raw,
      uploadPath: `${currentFolder.value?.path || './'}/${file.name}`
    })

    if (res.data.status === 200) {
      ElMessage.success(`${file.name} 开始上传`)
      await refreshCurrentFolder()
    }
  } catch (error) {
    ElMessage.error('上传失败')
  }
}

const beforeUpload = () => {
  return false
}

const triggerUpload = () => {
  if (uploadRef.value) {
    uploadRef.value.$el.querySelector('input').click()
  }
}

const handleMkDir = async (path) => {
  if (!path) {
    ElMessage.warning('请先选择文件夹位置')
    return
  }

  try {
    const { value: folderName } = await ElMessageBox.prompt(
        '请输入新文件夹的名称',
        '新建文件夹',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPlaceholder: '文件夹名称',
          inputValidator: (value) => {
            if (!value) return '文件夹名称不能为空'
            if (/[<>:"/\\|?*]/.test(value)) return '文件夹名称包含非法字符'
            return true
          }
        }
    )

    if (!folderName) return

    await ClientAPI.make_dir({ uid: uid, dirPath: `${path}/${folderName}` })
    ElMessage.success('创建成功')
    await refreshCurrentFolder()

  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('创建失败')
    }
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
        `确定删除 ${row.type === 'F' ? '文件' : '文件夹'} "${row.name}" 吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )

    await ClientAPI.delete_file({ uid: uid, filePath: row.path })
    ElMessage.success('删除成功')
    await refreshCurrentFolder()

  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const batchDelete = async () => {
  if (selectedItems.value.length === 0) return

  try {
    batchDeleting.value = true

    const confirmMessage = `确定删除选中的 ${selectedItems.value.length} 个项目吗？`
    await ElMessageBox.confirm(confirmMessage, '批量删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 这里需要后端支持批量删除接口
    for (const item of selectedItems.value) {
      await ClientAPI.delete_file({ uid: uid, filePath: item.path })
    }

    ElMessage.success(`成功删除 ${selectedItems.value.length} 个项目`)
    selectedItems.value = []
    await refreshCurrentFolder()

  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  } finally {
    batchDeleting.value = false
  }
}

const handleDownload = async (row) => {
  downloadingFile.value = row.path

  try {
    await ElMessageBox.confirm(
        `确定下载文件 "${row.name}" 吗？`,
        '下载确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }
    )

    const res = await ClientAPI.download_file({ uid: uid, filePath: row.path })

    if (res.data.status === 200) {
      ElMessage.success(`文件 "${row.name}" 开始后台下载`)
    } else {
      ElMessage.error('下载失败')
    }

  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('下载失败')
    }
  } finally {
    downloadingFile.value = null
  }
}

const handleFileCommand = (command, row) => {
  switch (command) {
    // case 'rename':
    //   renameFile(row)
    //   break
    case 'copy':
      copyToClipboard(row.path)
      break
    case 'info':
      showFileInfo(row)
      break
    case 'delete':
      handleDelete(row)
      break
  }
}

const renameFile = async (row) => {
  try {
    const { value: newName } = await ElMessageBox.prompt(
        '请输入新的名称',
        `重命名 "${row.name}"`,
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValue: row.name,
          inputValidator: (value) => {
            if (!value) return '名称不能为空'
            if (value === row.name) return '名称未改变'
            return true
          }
        }
    )

    // 这里需要调用重命名接口
    // await ClientAPI.rename_file({ uid, oldPath: row.path, newName })
    ElMessage.success('重命名成功')
    await refreshCurrentFolder()

  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('重命名失败')
    }
  }
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
      .then(() => {
        ElMessage.success('已复制到剪贴板')
      })
      .catch(() => {
        ElMessage.error('复制失败')
      })
}

const showFileInfo = (row) => {
  const info = `
    <div style="text-align: left;">
      <p><strong>名称：</strong>${row.name}</p>
      <p><strong>类型：</strong>${row.type === 'D' ? '文件夹' : '文件'}</p>
      <p><strong>路径：</strong>${row.path}</p>
      <p><strong>大小：</strong>${row.type === 'F' ? row.size : '-'}</p>
      <p><strong>修改时间：</strong>${row.modifiedTime}</p>
    </div>
  `

  ElMessageBox.alert(info, '文件信息', {
    dangerouslyUseHTMLString: true,
    confirmButtonText: '确定'
  })
}

const handleSelectionChange = (selection) => {
  selectedItems.value = selection
}

const handleSortCommand = (command) => {
  if (sortOrder.value.key === command) {
    sortOrder.value.direction = sortOrder.value.direction === 'asc' ? 'desc' : 'asc'
  } else {
    sortOrder.value.key = command
    sortOrder.value.direction = 'asc'
  }
}

const refreshCurrentFolder = async () => {
  if (currentFolder.value) {
    await navigateToPath(currentFolder.value.path)
  } else {
    await fetchFileTree('./')
  }
}

const goToRoot = () => {
  navigateToPath('/')
}

const clearSearch = () => {
  searchKeyword.value = ''
}

const updatePathInput = () => {
  if (currentFolder.value) {
    currentPathInput.value = currentFolder.value.path
  }
}

// 生命周期
onMounted(async () => {
  const savedTree = globalFileTree.getEntry(uid)

  if (!savedTree || savedTree.length === 0) {
    await fetchFileTree('./')
  } else {
    fileTree.value = savedTree
    const currentNodePath = currentFileNode.getFileNode(uid) || './'

    const currentItem = findTreeNodeByPath(currentNodePath, fileTree.value) ||
        findTreeNodeByPath('./', fileTree.value)

    if (currentItem) {
      currentFolder.value = currentItem
      currentFolderContent.value = currentItem.children || []
      currentPathInput.value = currentItem.path

      await nextTick()
      if (fileTreeRef.value) {
        fileTreeRef.value.setCurrentKey(currentItem.path)
        const node = fileTreeRef.value.store.nodesMap[currentItem.path]
        if (node) {
          node.expanded = true
        }
      }
    }
  }
})

onBeforeUnmount(() => {
  // 清理操作
  fileTree.value = []
  currentFolder.value = null
  currentFolderContent.value = []
  selectedFile.value = null
  selectedFileContent.value = ''
  selectedItems.value = []
})

// 监听当前文件夹变化
watch(() => currentFolder.value?.path, (newPath) => {
  if (newPath) {
    currentPathInput.value = newPath
  }
})
</script>

<style scoped>
.file-manager-container {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.toolbar {
  padding: 16px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  width: 300px;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding: 16px;
  gap: 16px;
}

.file-tree-panel {
  width: 300px;
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #303133;
}

.tree-container {
  flex: 1;
  overflow: auto;
  padding: 8px;
}

.tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 4px 0;
}

.node-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.node-content:hover {
  background: #f5f7fa;
}

.node-content.is-current {
  background: #ecf5ff;
  color: #409eff;
}

.folder-icon {
  color: #e6a23c;
}

.file-icon {
  color: #909399;
}

.node-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 12px;
  color: #909399;
  min-width: 60px;
  text-align: right;
}

.empty-tree {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #c0c4cc;
}

.empty-tree .el-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.file-details-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.path-navigation {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  gap: 16px;
}

.path-navigation .el-breadcrumb {
  flex: 1;
}

.path-navigation .el-breadcrumb-item {
  cursor: pointer;
}

.path-navigation .el-breadcrumb-item:hover {
  color: #409eff;
}

.path-input {
  width: 400px;
}

.file-list-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.file-list-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.file-count {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  gap: 4px;
  align-items: center;
}

.file-preview-panel {
  border-top: 1px solid #e4e7ed;
  max-height: 300px;
  display: flex;
  flex-direction: column;
}

.preview-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafafa;
}

.preview-header h4 {
  margin: 0;
  font-size: 14px;
  color: #303133;
}

.preview-content {
  flex: 1;
  overflow: auto;
  padding: 16px;
  background: #fafafa;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.preview-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

:deep(.el-table) {
  flex: 1;
}

:deep(.el-table__empty-block) {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-tree-node__content) {
  height: 36px;
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: #ecf5ff;
  font-weight: 500;
}

@media (max-width: 1200px) {
  .file-tree-panel {
    width: 250px;
  }

  .path-input {
    width: 300px;
  }
}

@media (max-width: 992px) {
  .main-content {
    flex-direction: column;
  }

  .file-tree-panel {
    width: 100%;
    height: 200px;
  }

  .path-navigation {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .path-input {
    width: 100%;
  }
}
</style>