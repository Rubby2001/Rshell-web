<template>
  <div class="note-container">
    <!-- 顶部工具栏 -->
    <el-card shadow="never" class="toolbar-card">
      <div class="toolbar-content">
        <div class="toolbar-left">
          <h2 class="toolbar-title">
            <i class="el-icon-notebook-2"></i>
            笔记管理
          </h2>
          <div class="toolbar-info">
            <span class="char-count">
              <i class="el-icon-document"></i>
              字数：{{ charCount }}
            </span>
            <span class="line-count">
              <i class="el-icon-s-order"></i>
              行数：{{ lineCount }}
            </span>
            <span class="last-saved" v-if="lastSavedTime">
              <i class="el-icon-time"></i>
              上次保存：{{ lastSavedTime }}
            </span>
          </div>
        </div>
        <div class="toolbar-right">
          <el-button-group class="action-buttons">
            <el-tooltip content="保存 (Ctrl+S)" placement="top">
              <el-button
                  type="primary"
                  @click="saveNote"
                  :loading="loading"
                  :disabled="!isDirty"
              >
                <i class="el-icon-check"></i>
                保存
              </el-button>
            </el-tooltip>
            <el-tooltip content="重置" placement="top">
              <el-button
                  @click="resetNote"
                  :disabled="!isDirty"
              >
                <i class="el-icon-refresh"></i>
                重置
              </el-button>
            </el-tooltip>
            <el-dropdown @command="handleExport">
              <el-button>
                <i class="el-icon-download"></i>
                导出
                <i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="txt">
                    <i class="el-icon-document"></i>
                    TXT格式
                  </el-dropdown-item>
                  <el-dropdown-item command="md">
                    <i class="el-icon-edit"></i>
                    Markdown格式
                  </el-dropdown-item>
                  <el-dropdown-item command="html">
                    <i class="el-icon-link"></i>
                    HTML格式
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-button-group>

          <el-dropdown trigger="click" @command="handleTemplate">
            <el-button type="info">
              <i class="el-icon-collection-tag"></i>
              模板
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="pentest">
                  <i class="el-icon-s-flag"></i>
                  渗透测试模板
                </el-dropdown-item>
                <el-dropdown-item command="vuln">
                  <i class="el-icon-warning"></i>
                  漏洞报告模板
                </el-dropdown-item>
                <el-dropdown-item command="report">
                  <i class="el-icon-finished"></i>
                  测试报告模板
                </el-dropdown-item>
                <el-dropdown-item command="custom" divided>
                  <i class="el-icon-setting"></i>
                  自定义模板
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-card>

    <!-- 编辑区域 -->
    <el-card shadow="never" class="editor-card">
      <template #header>
        <div class="editor-header">
          <span class="editor-title">
            <i class="el-icon-edit"></i>
            笔记内容
          </span>
          <div class="editor-tools">
            <el-tooltip content="自动保存" placement="top">
              <el-switch
                  v-model="autoSave"
                  active-text="自动保存"
                  inactive-text="手动保存"
                  size="small"
              />
            </el-tooltip>
            <el-tooltip content="全屏编辑" placement="top">
              <el-button
                  type="text"
                  size="small"
                  @click="toggleFullscreen"
                  class="fullscreen-btn"
              >
                <i :class="isFullscreen ? 'el-icon-close' : 'el-icon-full-screen'"></i>
              </el-button>
            </el-tooltip>
          </div>
        </div>
      </template>

      <!-- 全屏模式 -->
      <div v-if="isFullscreen" class="fullscreen-editor">
        <el-input
            ref="editorRef"
            v-model="noteContent"
            type="textarea"
            :autosize="{ minRows: 20 }"
            placeholder="在这里输入笔记..."
            class="fullscreen-textarea"
            @input="handleInput"
            @keydown="handleKeydown"
        />
        <div class="fullscreen-tools">
          <el-button type="primary" @click="saveNote" :loading="loading">
            保存并退出
          </el-button>
          <el-button @click="isFullscreen = false">
            退出全屏
          </el-button>
        </div>
      </div>

      <!-- 正常模式 -->
      <div v-else>
        <div class="editor-wrapper">
          <el-input
              ref="editorRef"
              v-model="noteContent"
              type="textarea"
              :autosize="{ minRows: 25, maxRows: 25 }"
              placeholder="在这里输入笔记内容..."
              class="note-textarea"
              @input="handleInput"
              @keydown="handleKeydown"
          />

          <!-- 快捷工具栏 -->
          <div class="quick-tools" v-if="showQuickTools">
            <el-space>
              <el-button-group size="small">
                <el-button @click="insertText('**粗体文字**')">
                  <strong>B</strong>
                </el-button>
                <el-button @click="insertText('*斜体文字*')">
                  <em>I</em>
                </el-button>
                <el-button @click="insertText('`代码片段`')">
                  <code>`</code>
                </el-button>
              </el-button-group>

              <el-divider direction="vertical" />

              <el-button-group size="small">
                <el-button @click="insertText('# 标题')">
                  H1
                </el-button>
                <el-button @click="insertText('## 标题')">
                  H2
                </el-button>
                <el-button @click="insertText('### 标题')">
                  H3
                </el-button>
              </el-button-group>

              <el-divider direction="vertical" />

              <el-button-group size="small">
                <el-button @click="insertText('- 列表项')">
                  <span class="custom-icon">•</span>
                </el-button>
                <el-button @click="insertText('1. 有序项')">
                  <span class="custom-icon">1.</span>
                </el-button>
                <el-button @click="insertText('> 引用内容')">
                  <span class="custom-icon">></span>
                </el-button>
              </el-button-group>

              <el-divider direction="vertical" />

              <el-button-group size="small">
                <el-button @click="insertText('---')">
                  <span class="custom-icon">—</span>
                </el-button>
                <el-button @click="insertText('[链接](https://)')">
                  <span class="custom-icon">🔗</span>
                </el-button>
                <el-button @click="insertText('![图片](url)')">
                  <span class="custom-icon">🖼️</span>
                </el-button>
              </el-button-group>
            </el-space>
          </div>
        </div>

        <!-- 预览区域 -->
        <div v-if="showPreview" class="preview-area">
          <div class="preview-header">
            <span>预览</span>
            <el-button type="text" size="small" @click="showPreview = false">
              <i class="el-icon-close"></i>
            </el-button>
          </div>
          <div class="preview-content" v-html="renderedContent"></div>
        </div>
      </div>
    </el-card>

    <!-- 底部状态栏 -->
    <div class="status-bar">
      <div class="status-left">
        <el-tag
            v-if="isDirty"
            type="warning"
            size="small"
            class="dirty-tag"
        >
          <i class="el-icon-warning"></i>
          未保存
        </el-tag>
        <el-tag
            v-else
            type="success"
            size="small"
            class="saved-tag"
        >
          <i class="el-icon-success"></i>
          已保存
        </el-tag>

        <span class="cursor-position">
          第 {{ cursorRow }} 行, 第 {{ cursorCol }} 列
        </span>
      </div>
      <div class="status-right">
        <el-button
            type="text"
            size="small"
            @click="showPreview = !showPreview"
        >
          <i class="el-icon-view"></i>
          {{ showPreview ? '隐藏预览' : '预览' }}
        </el-button>
        <el-button
            type="text"
            size="small"
            @click="showQuickTools = !showQuickTools"
        >
          <i class="el-icon-menu"></i>
          {{ showQuickTools ? '隐藏工具栏' : '显示工具栏' }}
        </el-button>
        <el-button
            type="text"
            size="small"
            @click="showHistory"
        >
          <i class="el-icon-time"></i>
          历史记录
        </el-button>
      </div>
    </div>

    <!-- 历史记录对话框 -->
    <el-dialog
        v-model="historyVisible"
        title="笔记历史记录"
        width="800px"
    >
      <el-timeline>
        <el-timeline-item
            v-for="(item, index) in historyList"
            :key="index"
            :timestamp="item.time"
            :type="index === 0 ? 'primary' : ''"
            placement="top"
        >
          <el-card shadow="never">
            <template #header>
              <div class="history-header">
                <span>{{ item.time }}</span>
                <el-button
                    size="small"
                    type="text"
                    @click="restoreHistory(item.content)"
                >
                  <i class="el-icon-refresh-left"></i>
                  恢复此版本
                </el-button>
              </div>
            </template>
            <div class="history-content">
              {{ item.preview }}
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      <template #footer>
        <el-button @click="historyVisible = false">关闭</el-button>
        <el-button type="primary" @click="clearHistory">清空历史记录</el-button>
      </template>
    </el-dialog>

    <!-- 自定义模板对话框 -->
    <el-dialog
        v-model="templateVisible"
        title="自定义模板"
        width="600px"
    >
      <el-form :model="templateForm" label-width="100px">
        <el-form-item label="模板名称">
          <el-input v-model="templateForm.name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="模板内容">
          <el-input
              v-model="templateForm.content"
              type="textarea"
              :rows="10"
              placeholder="请输入模板内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="templateVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTemplate">保存模板</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ClientAPI from '@/api/clients'
import { useRoute } from "vue-router"
import dayjs from 'dayjs'

const route = useRoute()
const uid = route.query.uid

// 响应式数据
const noteContent = ref('')
const loading = ref(false)
const isFullscreen = ref(false)
const showPreview = ref(false)
const showQuickTools = ref(true)
const autoSave = ref(false)
const historyVisible = ref(false)
const templateVisible = ref(false)
const editorRef = ref(null)
const cursorRow = ref(1)
const cursorCol = ref(1)
const lastSavedTime = ref('')

// 历史记录
const historyList = ref([])
const originalContent = ref('')

// 模板表单
const templateForm = ref({
  name: '',
  content: ''
})

// 计算属性
const charCount = computed(() => {
  return noteContent.value.length
})

const lineCount = computed(() => {
  return noteContent.value.split('\n').length
})

const isDirty = computed(() => {
  return noteContent.value !== originalContent.value
})

// 渲染预览内容（简单实现，实际项目中可以使用marked等库）
const renderedContent = computed(() => {
  let content = noteContent.value
  // 简单替换Markdown语法
  content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  content = content.replace(/\*(.*?)\*/g, '<em>$1</em>')
  content = content.replace(/`(.*?)`/g, '<code>$1</code>')
  content = content.replace(/^# (.*$)/gm, '<h1>$1</h1>')
  content = content.replace(/^## (.*$)/gm, '<h2>$1</h2>')
  content = content.replace(/^### (.*$)/gm, '<h3>$1</h3>')
  content = content.replace(/^- (.*$)/gm, '<li>$1</li>')
  content = content.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
  content = content.replace(/---/g, '<hr>')
  content = content.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
  content = content.replace(/\!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">')
  content = content.replace(/\n/g, '<br>')
  return content
})

// 初始化
const fetchNote = async () => {
  try {
    const response = await ClientAPI.get_note({ uid: uid })
    if (response?.data?.data != null) {
      noteContent.value = response.data.data
      originalContent.value = response.data.data
      addToHistory('初始加载')
    } else {
      noteContent.value = ''
      originalContent.value = ''
    }
  } catch (error) {
    console.log(error)
    ElMessage.error('加载笔记失败')
  }
}

// 保存笔记
const saveNote = async () => {
  if (!isDirty.value) {
    ElMessage.info('内容未修改，无需保存')
    return
  }

  loading.value = true
  try {
    const res = await ClientAPI.save_note({ uid: uid, noteContent: noteContent.value })
    if (res.data.status === 200) {
      originalContent.value = noteContent.value
      lastSavedTime.value = dayjs().format('HH:mm:ss')
      addToHistory('手动保存')
      ElMessage.success('笔记已保存')
    } else {
      ElMessage.error('保存失败')
    }
  } catch (error) {
    console.log(error)
    ElMessage.error('保存笔记失败')
  } finally {
    loading.value = false
  }
}

// 重置笔记
const resetNote = async () => {
  try {
    await ElMessageBox.confirm(
        '确定要重置笔记吗？未保存的修改将丢失。',
        '确认重置',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )
    noteContent.value = originalContent.value
    ElMessage.success('已重置')
  } catch (error) {
    // 用户取消操作
  }
}

// 处理输入
const handleInput = () => {
  // 如果开启自动保存且内容有变化
  if (autoSave.value && isDirty.value) {
    debounceAutoSave()
  }
}

// 处理键盘事件
const handleKeydown = (event) => {
  // Ctrl+S 保存
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault()
    saveNote()
  }

  // Ctrl+E 导出
  if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
    event.preventDefault()
    handleExport('txt')
  }

  // Ctrl+F 全屏
  if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
    event.preventDefault()
    toggleFullscreen()
  }

  // 计算光标位置
  if (editorRef.value) {
    const textarea = editorRef.value.$el.querySelector('textarea')
    if (textarea) {
      const cursorIndex = textarea.selectionStart
      const textBeforeCursor = noteContent.value.substring(0, cursorIndex)
      cursorRow.value = textBeforeCursor.split('\n').length
      cursorCol.value = textBeforeCursor.length - textBeforeCursor.lastIndexOf('\n')
    }
  }
}

// 插入文本
const insertText = (text) => {
  if (editorRef.value) {
    const textarea = editorRef.value.$el.querySelector('textarea')
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = noteContent.value.substring(start, end)

      if (selectedText) {
        // 如果有选中的文本，替换它
        noteContent.value = noteContent.value.substring(0, start) +
            text.replace('文字', selectedText) +
            noteContent.value.substring(end)
      } else {
        // 如果没有选中文本，插入文本
        noteContent.value = noteContent.value.substring(0, start) +
            text +
            noteContent.value.substring(start)
      }

      // 设置光标位置
      nextTick(() => {
        textarea.focus()
        const newPos = start + text.length
        textarea.setSelectionRange(newPos, newPos)
      })
    }
  }
}

// 切换全屏
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    nextTick(() => {
      if (editorRef.value) {
        editorRef.value.focus()
      }
    })
  }
}

// 导出笔记
const handleExport = async (format) => {
  const formats = {
    txt: 'text/plain',
    md: 'text/markdown',
    html: 'text/html'
  }

  let content = noteContent.value
  let filename = `note_${dayjs().format('YYYYMMDD_HHmmss')}`

  if (format === 'html') {
    content = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>笔记导出</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #333; }
        code { background: #f5f5f5; padding: 2px 4px; }
    </style>
</head>
<body>
    <div>${renderedContent.value}</div>
</body>
</html>`
    filename += '.html'
  } else if (format === 'md') {
    filename += '.md'
  } else {
    filename += '.txt'
  }

  const blob = new Blob([content], { type: formats[format] || 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  ElMessage.success(`已导出为${format.toUpperCase()}格式`)
}

// 处理模板
const handleTemplate = async (command) => {
  const templates = {
    pentest: `# 渗透测试笔记

## 目标信息
- 目标名称：
- IP地址：
- 端口信息：

## 信息收集
- 开放端口：
- 服务版本：
- 目录扫描：

## 漏洞发现

## 利用过程

## 权限提升

## 痕迹清理

## 总结建议`,

    vuln: `# 漏洞报告

## 漏洞信息
- 漏洞名称：
- 风险等级：
- CVSS评分：

## 漏洞描述

## 影响范围

## 复现步骤
1.
2.
3.

## 修复建议

## 参考链接`,

    report: `# 渗透测试报告

## 执行摘要

## 测试范围

## 测试方法

## 发现漏洞
### 高风险
### 中风险
### 低风险

## 修复建议

## 附录
- 测试工具
- 测试时间
- 测试人员`
  }

  if (command === 'custom') {
    templateVisible.value = true
  } else if (templates[command]) {
    try {
      await ElMessageBox.confirm(
          '使用模板将替换当前内容，确定要继续吗？',
          '确认使用模板',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
      )
      noteContent.value = templates[command]
      ElMessage.success('模板已应用')
    } catch (error) {
      // 用户取消操作
    }
  }
}

// 保存模板
const saveTemplate = () => {
  if (!templateForm.value.name) {
    ElMessage.error('请输入模板名称')
    return
  }
  if (!templateForm.value.content) {
    ElMessage.error('请输入模板内容')
    return
  }

  // 这里可以保存到本地存储或后端
  localStorage.setItem(`note_template_${templateForm.value.name}`, templateForm.value.content)
  templateVisible.value = false
  templateForm.value = { name: '', content: '' }
  ElMessage.success('模板已保存')
}

// 历史记录功能
const addToHistory = (action) => {
  historyList.value.unshift({
    time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    content: noteContent.value,
    preview: noteContent.value.substring(0, 100) + (noteContent.value.length > 100 ? '...' : ''),
    action: action
  })

  // 只保留最近10条记录
  if (historyList.value.length > 10) {
    historyList.value.pop()
  }
}

const showHistory = () => {
  historyVisible.value = true
}

const restoreHistory = (content) => {
  noteContent.value = content
  ElMessage.success('已恢复历史版本')
  historyVisible.value = false
}

const clearHistory = () => {
  historyList.value = []
  ElMessage.success('历史记录已清空')
}

// 防抖自动保存
let autoSaveTimer = null
const debounceAutoSave = () => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }
  autoSaveTimer = setTimeout(async () => {
    await saveNote()
    ElMessage.success('已自动保存')
  }, 2000) // 2秒后自动保存
}

// 键盘事件监听
const handleGlobalKeydown = (event) => {
  if (isFullscreen.value && event.key === 'Escape') {
    isFullscreen.value = false
  }
}

// 生命周期
onMounted(() => {
  fetchNote()
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }
})
</script>

<style scoped>
.note-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 工具栏样式 */
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

.toolbar-left {
  flex: 1;
}

.toolbar-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #303133;
}

.toolbar-title i {
  color: #409eff;
}

.toolbar-info {
  display: flex;
  gap: 20px;
  color: #909399;
  font-size: 14px;
}

.toolbar-info span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.action-buttons {
  margin-right: 10px;
}

/* 编辑器样式 */
.editor-card {
  border: none;
  border-radius: 8px;
  margin-bottom: 20px;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.editor-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #303133;
}

.editor-title i {
  color: #409eff;
}

.editor-tools {
  display: flex;
  align-items: center;
  gap: 10px;
}

.fullscreen-btn {
  color: #909399;
}

.fullscreen-btn:hover {
  color: #409eff;
}

/* 全屏编辑器 */
.fullscreen-editor {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 9999;
  display: flex;
  flex-direction: column;
}

.fullscreen-textarea {
  flex: 1;
  border: none;
  outline: none;
  padding: 20px;
  font-size: 16px;
  line-height: 1.6;
}

.fullscreen-textarea :deep(.el-textarea__inner) {
  border: none;
  height: calc(100vh - 100px);
  font-size: 16px;
  line-height: 1.6;
}

.fullscreen-tools {
  padding: 20px;
  background: #fafafa;
  border-top: 1px solid #ebeef5;
  text-align: center;
}

/* 正常编辑器 */
.editor-wrapper {
  position: relative;
}

.note-textarea :deep(.el-textarea__inner) {
  font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
}

.quick-tools {
  margin-top: 15px;
  padding: 10px;
  background: #fafafa;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

/* 预览区域 */
.preview-area {
  margin-top: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.preview-header {
  padding: 10px 15px;
  background: #fafafa;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
}

.preview-content {
  padding: 20px;
  max-height: 300px;
  overflow-y: auto;
  line-height: 1.6;
}

.preview-content h1,
.preview-content h2,
.preview-content h3 {
  margin: 20px 0 10px 0;
  color: #303133;
}

.preview-content strong {
  color: #f56c6c;
}

.preview-content code {
  background: #f5f5f5;
  padding: 2px 4px;
  border-radius: 2px;
  font-family: 'Monaco', 'Consolas', monospace;
}

.preview-content blockquote {
  border-left: 4px solid #409eff;
  padding-left: 15px;
  margin: 10px 0;
  color: #606266;
  background: #f0f7ff;
}

/* 状态栏 */
.status-bar {
  padding: 10px 20px;
  background: #fafafa;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.status-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.dirty-tag {
  animation: pulse 2s infinite;
}

.saved-tag {
  opacity: 0.8;
}

.cursor-position {
  color: #909399;
  font-family: 'Monaco', 'Consolas', monospace;
}

.status-right {
  display: flex;
  gap: 15px;
}

/* 历史记录 */
.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-content {
  max-height: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #909399;
}

/* 动画 */
@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbar-content {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .toolbar-right {
    flex-wrap: wrap;
    justify-content: center;
  }

  .status-bar {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .status-left,
  .status-right {
    justify-content: center;
  }
}
</style>