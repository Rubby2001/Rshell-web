<template>
  <div class="enhanced-terminal-container">
    <!-- 顶部标题栏 -->
<!--    <div class="terminal-header">-->
<!--      <div class="header-left">-->
<!--        <h2 class="terminal-title">-->
<!--          <el-icon class="terminal-icon"><Monitor /></el-icon>-->
<!--          终端控制台-->
<!--        </h2>-->
<!--        <div class="client-badge">-->
<!--          <el-tag type="info" size="small" effect="dark">-->
<!--            <el-icon><User /></el-icon>-->
<!--            UID: {{ uid }}-->
<!--          </el-tag>-->
<!--        </div>-->
<!--      </div>-->
<!--      <div class="header-right">-->
<!--        <el-tooltip content="清空终端输出" placement="bottom">-->
<!--          <el-button type="info" size="small" circle @click="clearOutput">-->
<!--            <el-icon><Delete /></el-icon>-->
<!--          </el-button>-->
<!--        </el-tooltip>-->
<!--        <el-tooltip content="内存执行高级功能" placement="bottom">-->
<!--          <el-button type="primary" @click="dialogVisible = true" plain>-->
<!--            <el-icon><MagicStick /></el-icon>-->
<!--            Windows内存执行-->
<!--          </el-button>-->
<!--        </el-tooltip>-->
<!--      </div>-->
<!--    </div>-->

    <!-- 主终端区域 -->
    <div class="main-terminal-area">
      <!-- 终端输出区域 -->
      <div class="terminal-output-container">
        <div class="output-header">
          <div class="output-title">
            <el-icon><Promotion /></el-icon>
            <span>命令输出</span>
          </div>
<!--          <div class="output-stats">-->
<!--            <el-tag size="small" type="info" effect="plain">-->
<!--              <el-icon><Clock /></el-icon>-->
<!--              自动刷新: 5s-->
<!--            </el-tag>-->
<!--          </div>-->
        </div>

        <div class="output-content" ref="outputRef">
          <div class="command-history" v-if="ShellStr">
<!--            <div class="command-item" v-if="lastCommand">-->
<!--              <span class="command-prompt">$</span>-->
<!--              <span class="command-text">{{ lastCommand }}</span>-->
<!--            </div>-->
            <pre class="terminal-output">{{ ShellStr }}</pre>
          </div>
          <div class="empty-output" v-else>
            <el-empty description="暂无输出，请输入命令开始操作" />
          </div>
        </div>
      </div>

      <!-- 命令输入区域 -->
      <div class="command-input-container">

        <div class="input-wrapper">
          <el-input
              v-model="command"
              class="enhanced-command-input"
              placeholder="输入命令，按 Enter 执行，↑↓ 键切换历史命令，clear清除历史命令"
              @keyup.enter="sendCommand"
              @keydown.up.prevent="prevCommand"
              @keydown.down.prevent="nextCommand"
              ref="inputRef"
              :spellcheck="false"
              size="large"
          >
            <template #prefix>
              <el-icon><Promotion /></el-icon>
            </template>
            <template #append>
              <el-button
                  type="primary"
                  @click="sendCommand"
                  :loading="isExecuting"
                  :disabled="!command.trim()"
              >
                执行
              </el-button>
            </template>
          </el-input>
        </div>

        <div class="input-hints">
          <span class="hint-text">快捷键: ↑ 上一条命令 | ↓ 下一条命令 | Enter 执行命令</span>
        </div>
        <!-- 添加的按钮区域 -->
        <div class="action-buttons">
          <el-tooltip content="Windows内存执行" placement="top">
            <el-button
                type="primary"
                @click="dialogVisible = true"
                size="default"
                class="action-button"
            >
              <el-icon><MagicStick /></el-icon>
              Windows内存执行
            </el-button>
          </el-tooltip>

          <!-- 这里可以继续添加其他小按钮 -->
          <!-- 示例：添加其他功能按钮 -->
          <!--
          <el-tooltip content="其他功能" placement="top">
            <el-button type="success" size="default" class="action-button">
              <el-icon><Folder /></el-icon>
              文件管理
            </el-button>
          </el-tooltip>
          -->

          <!--
          <el-tooltip content="其他功能" placement="top">
            <el-button type="warning" size="default" class="action-button">
              <el-icon><Tools /></el-icon>
              工具
            </el-button>
          </el-tooltip>
          -->
        </div>
      </div>

    </div>

    <!-- 美化后的内存执行对话框 -->
    <el-dialog
        v-model="dialogVisible"
        title="内存执行"
        width="520px"
        :before-close="handleClose"
        class="enhanced-memory-dialog"
        center
    >
      <template #header>
        <div class="dialog-title">
          <el-icon class="dialog-icon"><MagicStick /></el-icon>
          <span>Windows 内存执行</span>
        </div>
      </template>

      <div class="dialog-content">
        <!-- 执行模式选择 -->
        <div class="dialog-section">
          <div class="section-label">
            <el-icon><Setting /></el-icon>
            <span>执行模式</span>
          </div>
          <el-select
              v-model="executionMode"
              placeholder="请选择执行模式"
              class="mode-selector"
              size="large"
              filterable
          >
            <el-option-group
                v-for="group in groupedModeOptions"
                :key="group.title"
                :label="group.title"
            >
              <el-option
                  v-for="item in group.options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              >
                <div class="mode-option-item">
                  <el-icon :class="item.iconClass"><component :is="item.icon" /></el-icon>
                  <div class="option-details">
                    <div class="option-label">{{ item.label }}</div>
                    <div class="option-desc">{{ item.description }}</div>
                  </div>
                </div>
              </el-option>
            </el-option-group>
          </el-select>
        </div>

        <!-- 文件选择区域 -->
        <div class="dialog-section">
          <div class="section-label">
            <el-icon><Document /></el-icon>
            <span>执行文件</span>
          </div>
          <div
              class="file-upload-card"
              @click="triggerFileInput"
              @dragover.prevent
              @drop.prevent="handleDrop"
              :class="{ 'has-file': selectedFile }"
          >
            <div class="upload-placeholder" v-if="!selectedFile">
              <el-icon class="upload-icon"><Upload /></el-icon>
              <div class="upload-text">
                <p class="upload-title">点击选择或拖拽文件到此处</p>
                <p class="upload-subtitle">支持 .exe, .dll, .bin, .raw, .cna 等格式</p>
              </div>
            </div>
            <div class="file-selected" v-else>
              <el-icon class="file-icon"><Document /></el-icon>
              <div class="file-details">
                <div class="file-name">{{ selectedFile.name }}</div>
                <div class="file-info">
                  <el-tag size="small" type="info">
                    <el-icon><Document /></el-icon>
                    {{ formatFileSize(selectedFile.size) }}
                  </el-tag>
                  <el-tag size="small" type="success">
                    <el-icon><Timer /></el-icon>
                    {{ new Date(selectedFile.lastModified).toLocaleDateString() }}
                  </el-tag>
                </div>
              </div>
              <el-button
                  type="danger"
                  size="small"
                  circle
                  @click.stop="removeFile"
                  :icon="Delete"
              />
            </div>
            <input
                type="file"
                ref="fileInputRef"
                @change="handleFileChange"
                style="display: none;"
            />
          </div>
        </div>

        <!-- 参数输入 -->
        <div class="dialog-section">
          <div class="section-label">
            <el-icon><EditPen /></el-icon>
            <span>运行参数 (可选)</span>
          </div>
          <el-input
              v-model="inputParams"
              placeholder="请输入程序运行参数，多个参数用空格分隔"
              type="textarea"
              :rows="2"
              clearable
              class="params-input"
              :autosize="{ minRows: 2, maxRows: 4 }"
          >
            <template #prefix>
              <el-icon><Key /></el-icon>
            </template>
          </el-input>
        </div>

        <!-- 执行预览 -->
        <div class="dialog-section" v-if="selectedFile || inputParams || executionMode">
          <div class="section-label">
            <el-icon><View /></el-icon>
            <span>执行预览</span>
          </div>
          <div class="preview-card">
            <div class="preview-item" v-if="selectedFile">
              <el-icon class="preview-icon"><Document /></el-icon>
              <div class="preview-content">
                <div class="preview-label">文件</div>
                <div class="preview-value">{{ selectedFile.name }}</div>
              </div>
            </div>
            <div class="preview-item" v-if="executionMode">
              <el-icon class="preview-icon"><Setting /></el-icon>
              <div class="preview-content">
                <div class="preview-label">模式</div>
                <div class="preview-value">{{ getModeLabel(executionMode) }}</div>
              </div>
            </div>
            <div class="preview-item" v-if="inputParams">
              <el-icon class="preview-icon"><Key /></el-icon>
              <div class="preview-content">
                <div class="preview-label">参数</div>
                <div class="preview-value">{{ inputParams || '无' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose" :disabled="isExecuting">
            取消
          </el-button>
          <el-button
              type="primary"
              @click="handleExecute"
              :disabled="!selectedFile || isExecuting"
              :loading="isExecuting"
              class="execute-button"
          >
            <el-icon><MagicStick /></el-icon>
            确定执行
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ClientAPI from '@/api/clients'
import { useRoute } from "vue-router"
import { useCommandHistoryStore } from '@/stores/shellcommand'
import {
  Monitor,
  User,
  Delete,
  MagicStick,
  Clock,
  Promotion,
  Histogram,
  Setting,
  Document,
  Upload,
  EditPen,
  View,
  Timer,
  Key
} from '@element-plus/icons-vue'

// 保持您原来的所有代码逻辑不变
const commandHistory = useCommandHistoryStore();
const route = useRoute()

const command = ref('')
const ShellStr = ref('')
const ShellStrTmp = ref('')
const lastCommand = ref('')
const isExecuting = ref(false)
const uid = String(route.query.uid);
const outputRef = ref(null)
const inputRef = ref(null)

// Dialog 相关
const dialogVisible = ref(false)
const fileInputRef = ref(null)
const selectedFile = ref(null)
const inputParams = ref('')
const executionMode = ref('execute-assembly')

// 分组后的模式选项
const groupedModeOptions = computed(() => [
  {
    title: '.NET 程序执行',
    options: [
      {
        value: 'execute-assembly',
        label: 'Execute Assembly',
        description: '执行 .NET 程序集内存加载',
        icon: 'MagicStick',
        iconClass: 'net-icon'
      }
    ]
  },
  {
    title: '原生程序执行',
    options: [
      {
        value: 'inline-bin',
        label: 'Inline Binary',
        description: '执行原生二进制程序内存加载',
        icon: 'Cpu',
        iconClass: 'native-icon'
      }
    ]
  },
  {
    title: 'Shellcode注入',
    options: [
      {
        value: 'shellcode-inject',
        label: 'Shellcode Inject',
        description: '注入并执行 Shellcode',
        icon: 'Connection',
        iconClass: 'inject-icon'
      }
    ]
  },
  {
    title: 'BOF 执行',
    options: [
      {
        value: 'inline-execute',
        label: 'Inline Execute',
        description: '执行 BOF (Beacon Object File)',
        icon: 'Tools',
        iconClass: 'bof-icon'
      }
    ]
  }
])

// 清屏函数
const clearOutput = () => {
  ShellStr.value = ''
  lastCommand.value = ''
  ElMessage.success('终端输出已清空')
}

// 保持您原来的所有函数不变
const sendCommand = async () => {
  if (command.value.trim() === '') return

  const currentCommand = command.value.trim()
  lastCommand.value = currentCommand
  command.value = ''
  commandHistory.addCommand(uid, currentCommand)
  commandHistory.clearCurrentIndex(uid)
  isExecuting.value = true

  try {
    const res = await ClientAPI.send_commands({ uid: uid, command: currentCommand })
    ShellStrTmp.value = res.data.data
    if (ShellStr.value !== ShellStrTmp.value) {
      ShellStr.value = ShellStrTmp.value
      await nextTick()
      if (outputRef.value) {
        outputRef.value.scrollTop = outputRef.value.scrollHeight
      }
    }
    // ElMessage.warning('命令执行中')
  } catch (error) {
    ElMessage.error('命令执行失败')
  } finally {
    isExecuting.value = false
  }
}

const prevCommand = () => {
  const prevCmd = commandHistory.getPrevCommand(uid);
  if (prevCmd !== undefined) {
    command.value = prevCmd;
  }
}

const nextCommand = () => {
  const nextCmd = commandHistory.getNextCommand(uid);
  if (nextCmd !== undefined) {
    command.value = nextCmd;
  }
};

function GetShellContent() {
  ClientAPI.get_shellcontent({ uid: uid }).then((res) => {
    ShellStrTmp.value = res.data.data
    if (ShellStr.value !== ShellStrTmp.value) {
      ShellStr.value = ShellStrTmp.value
      nextTick(() => {
        if (outputRef.value) {
          outputRef.value.scrollTop = outputRef.value.scrollHeight
        }
      })
    }
  })
}

const getModeLabel = (value) => {
  for (const group of groupedModeOptions.value) {
    const mode = group.options.find(m => m.value === value)
    if (mode) return mode.label
  }
  return value
}

const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

const handleFileChange = (event) => {
  const files = event.target.files
  if (files && files.length > 0) {
    selectedFile.value = files[0]
  }
}

const handleDrop = (event) => {
  const files = event.dataTransfer.files
  if (files && files.length > 0) {
    selectedFile.value = files[0]
  }
}

const removeFile = () => {
  selectedFile.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleExecute = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择一个文件！')
    return
  }

  isExecuting.value = true
  try {
    const params = inputParams.value.trim()
    const mode = executionMode.value

    const res = await ClientAPI.ExecuteBin({ uid: uid, mode: mode, file: selectedFile.value, args: params })
    if (res.data.status === 200) {
      ElMessage.success("后台执行成功")
      dialogVisible.value = false
      resetDialog()
    } else {
      ElMessage.error(res.data.data)
    }
  } catch (error) {
    console.error('执行过程中出错:', error)
    ElMessage.error(`执行失败: ${error.message || '未知错误'}`)
  } finally {
    isExecuting.value = false
  }
}

const handleClose = () => {
  if (isExecuting.value) {
    ElMessage.warning('请等待当前执行完成')
    return
  }

  if (selectedFile.value || inputParams.value) {
    ElMessageBox.confirm(
        '关闭将清除已选择的文件和输入的参数，确定要关闭吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    ).then(() => {
      dialogVisible.value = false
      resetDialog()
    })
  } else {
    dialogVisible.value = false
  }
}

const resetDialog = () => {
  selectedFile.value = null
  inputParams.value = ''
  executionMode.value = 'execute-assembly'
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

onMounted(() => {
  GetShellContent();
  const intervalId = setInterval(GetShellContent, 2000);

  onUnmounted(() => {
    clearInterval(intervalId);
  });
});
</script>

<style scoped>
.enhanced-terminal-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* 头部样式 */
.terminal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  border: 1px solid #ebeef5;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.terminal-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;
}

.terminal-icon {
  color: #409eff;
  font-size: 24px;
}

.client-badge .el-tag {
  font-weight: 600;
}

.header-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 主终端区域 */
.main-terminal-area {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 输出区域 */
.terminal-output-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #ebeef5;
}

.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(90deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #dee2e6;
}

.output-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.output-content {
  height: 500px;
  padding: 20px;
  overflow-y: auto;
  background: #1e1e1e;
}

.output-content::-webkit-scrollbar {
  width: 8px;
}

.output-content::-webkit-scrollbar-track {
  background: #2d2d2d;
}

.output-content::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 4px;
}

.output-content::-webkit-scrollbar-thumb:hover {
  background: #777;
}

.command-history {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.command-item {
  padding: 10px 14px;
  background: rgba(64, 158, 255, 0.1);
  border-radius: 6px;
  border-left: 4px solid #409eff;
  margin-bottom: 10px;
}

.command-prompt {
  color: #409eff;
  font-weight: bold;
  margin-right: 8px;
  font-family: 'Consolas', monospace;
}

.command-text {
  color: #67c23a;
  font-weight: 500;
  font-family: 'Consolas', monospace;
}

.terminal-output {
  margin: 0;
  color: #e6e6e6;
  font-size: 14px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.empty-output {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

/* 输入区域 */
.command-input-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 24px;
  border: 1px solid #ebeef5;
}

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.prompt-display {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: 'Consolas', monospace;
  font-size: 14px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.prompt-user {
  color: #409eff;
  font-weight: bold;
}

.prompt-separator {
  color: #909399;
}

.prompt-path {
  color: #67c23a;
  font-weight: bold;
}

.prompt-symbol {
  color: #e6a23c;
  font-weight: bold;
}

.enhanced-command-input {
  width: 100%;
}

.enhanced-command-input :deep(.el-input-group__append) {
  padding: 0;
}

.enhanced-command-input :deep(.el-input-group__append .el-button) {
  height: 100%;
  border-radius: 0 8px 8px 0;
  padding: 0 24px;
}

.input-hints {
  margin-top: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 12px;
  color: #909399;
  border: 1px dashed #dcdfe6;
}

.hint-text {
  font-family: 'Consolas', monospace;
}

/* 对话框样式 */
.enhanced-memory-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

.dialog-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
}

.dialog-icon {
  color: #409eff;
  font-size: 24px;
}

.dialog-content {
  padding: 20px 0;
}

.dialog-section {
  margin-bottom: 24px;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 600;
  color: #409eff;
  font-size: 15px;
}

.mode-selector {
  width: 100%;
}

.mode-option-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.mode-option-item .el-icon {
  font-size: 20px;
}

.net-icon {
  color: #9254de;
}

.native-icon {
  color: #409eff;
}

.inject-icon {
  color: #f56c6c;
}

.bof-icon {
  color: #36cfc9;
}

.option-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.option-label {
  font-weight: 600;
  color: #2c3e50;
}

.option-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.file-upload-card {
  border: 2px dashed #dcdfe6;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.file-upload-card:hover {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.05);
  transform: translateY(-2px);
}

.file-upload-card.has-file {
  border-style: solid;
  border-color: #67c23a;
  background: rgba(103, 194, 58, 0.05);
  padding: 20px;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-icon {
  font-size: 56px;
  color: #409eff;
  opacity: 0.7;
}

.upload-text {
  color: #909399;
}

.upload-title {
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 16px;
}

.upload-subtitle {
  font-size: 12px;
  opacity: 0.7;
}

.file-selected {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.file-icon {
  font-size: 36px;
  color: #67c23a;
  flex-shrink: 0;
}

.file-details {
  flex: 1;
  text-align: left;
}

.file-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  word-break: break-all;
}

.file-info {
  display: flex;
  gap: 8px;
}

.params-input :deep(.el-textarea__inner) {
  font-family: 'Consolas', monospace;
  line-height: 1.5;
}

.preview-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e9ecef;
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #dee2e6;
}

.preview-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.preview-item:first-child {
  padding-top: 0;
}

.preview-icon {
  font-size: 20px;
  color: #409eff;
  flex-shrink: 0;
}

.preview-content {
  flex: 1;
}

.preview-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.preview-value {
  font-weight: 600;
  color: #2c3e50;
  word-break: break-word;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.execute-button {
  min-width: 140px;
  padding: 10px 24px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .enhanced-terminal-container {
    padding: 12px;
  }

  .terminal-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .header-left, .header-right {
    justify-content: center;
  }

  .output-content {
    height: 400px;
  }

  .file-selected {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .file-info {
    flex-wrap: wrap;
  }

  .dialog-footer {
    flex-direction: column;
  }

  .execute-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .terminal-title {
    font-size: 18px;
  }

  .output-content {
    height: 300px;
    padding: 12px;
  }

  .command-input-container {
    padding: 16px;
  }

  .prompt-display {
    font-size: 12px;
  }
}
.action-buttons {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed #dcdfe6;
}

.button-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-buttons {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: flex-start;
}

.action-button {
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.action-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.action-button .el-icon {
  margin-right: 4px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .action-buttons {
    flex-wrap: wrap;
    justify-content: center;
  }

  .action-button {
    flex: 0 0 auto;
  }
}

@media (max-width: 480px) {
  .action-buttons {
    margin-top: 16px;
    gap: 8px;
  }

  .action-button {
    padding: 6px 12px;
    font-size: 13px;
  }
}
</style>