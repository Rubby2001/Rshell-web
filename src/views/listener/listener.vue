<template>
  <div class="listener-management">
    <!-- 头部区域 -->
    <div class="header-section">
      <div class="header-content">
        <h1 class="page-title">监听器管理</h1>
        <p class="page-subtitle">配置和管理远程连接的监听器</p>
      </div>
      <el-button
          type="primary"
          size="large"
          class="add-listener-btn"
          @click="addListenerDialogVisible = true"
      >
        <el-icon><Plus /></el-icon>
        添加监听器
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
            <div class="stat-value">{{ activeListeners }}</div>
            <div class="stat-label">活跃</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-content">
          <el-icon class="stat-icon inactive-icon"><CircleClose /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ inactiveListeners }}</div>
            <div class="stat-label">未启动</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 监听器表格 -->
    <el-card class="listener-table-card">
      <template #header>
        <div class="table-header">
          <h3 class="table-title">监听器列表</h3>
          <div class="table-actions">
            <el-tooltip content="刷新列表" placement="top">
              <el-button
                  type="info"
                  size="small"
                  @click="getListenerList"
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
          empty-text="暂无监听器数据"
      >
        <el-table-column prop="Type" label="协议类型" width="120">
          <template #default="{ row }">
            <div class="protocol-cell">
              <el-tag
                  :type="getProtocolTagType(row.Type)"
                  class="protocol-tag"
                  effect="light"
                  round
              >
                {{ row.Type.toUpperCase() }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="ListenAddress" label="监听地址" min-width="180">
          <template #default="{ row }">
            <div class="address-cell">
              <el-icon class="address-icon"><Position /></el-icon>
              <div class="address-content">
                <div class="address-text">{{ row.ListenAddress }}</div>
                <div class="address-label">监听地址</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="ConnectAddress" label="连接地址" min-width="180">
          <template #default="{ row }">
            <div class="address-cell">
              <el-icon class="address-icon"><Connection /></el-icon>
              <div class="address-content">
                <div class="address-text">{{ row.ConnectAddress }}</div>
                <div class="address-label">连接地址</div>
              </div>
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

        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-tooltip
                  :content="row.Status === 2 ? '启动监听器' : '停止监听器'"
                  placement="top"
              >
                <el-button
                    size="small"
                    :type="row.Status === 2 ? 'success' : 'primary'"
                    @click="row.Status === 2 ? handleOpen(row) : handleClose(row)"
                    :icon="row.Status === 2 ? VideoPlay : VideoPause"
                    circle
                />
              </el-tooltip>

              <el-tooltip content="删除监听器" placement="top">
                <el-button
                    size="small"
                    type="danger"
                    @click="handleDelete(row)"
                    :icon="Delete"
                    circle
                />
              </el-tooltip>

              <el-tooltip content="查看详情" placement="top">
                <el-button
                    size="small"
                    type="info"
                    @click="handleViewDetails(row)"
                    :icon="View"
                    circle
                />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加监听器对话框 -->
    <el-dialog
        v-model="addListenerDialogVisible"
        title="添加监听器"
        width="560px"
        class="add-listener-dialog"
        :close-on-click-modal="false"
    >
      <div class="dialog-content">
        <el-steps :active="currentStep" finish-status="success" simple class="form-steps">
          <el-step title="协议选择" />
          <el-step title="参数配置" />
        </el-steps>

        <el-form
            :model="formData"
            label-width="auto"
            label-position="top"
            class="listener-form"
            @submit.prevent="addListener"
        >
          <!-- 协议选择 -->
          <div v-show="currentStep === 0" class="step-content">
            <div class="step-title">选择监听协议</div>
            <div class="protocol-grid">
              <div
                  v-for="protocol in protocols"
                  :key="protocol.value"
                  class="protocol-card"
                  :class="{ 'protocol-selected': formData.protocol === protocol.value }"
                  @click="selectProtocol(protocol.value)"
              >
                <div class="protocol-icon">
                  <el-icon :class="protocol.iconClass">
                    <component :is="protocol.icon" />
                  </el-icon>
                </div>
                <div class="protocol-info">
                  <div class="protocol-name">{{ protocol.label }}</div>
                  <div class="protocol-desc">{{ protocol.description }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 参数配置 -->
          <div v-show="currentStep === 1" class="step-content">
            <div class="step-title">配置监听参数</div>

            <!-- OSS 特殊配置 -->
            <template v-if="formData.protocol === 'oss'">
              <el-form-item label="EndPoint" required>
                <el-input
                    v-model="ossData.endpoint"
                    placeholder="oss-cn-hangzhou.aliyuncs.com"
                    clearable
                    size="large"
                >
                  <template #prepend>
                    <el-icon><Link /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item label="AccessKeyId" required>
                <el-input
                    v-model="formData.listenAddress"
                    placeholder="请输入AccessKeyId"
                    clearable
                    size="large"
                >
                  <template #prepend>
                    <el-icon><Key /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item label="AccessKeySecret" required>
                <el-input
                    v-model="formData.connectAddress"
                    type="password"
                    placeholder="请输入AccessKeySecret"
                    show-password
                    clearable
                    size="large"
                >
                  <template #prepend>
                    <el-icon><Lock /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item label="BucketName" required>
                <el-input
                    v-model="ossData.bucketName"
                    placeholder="alisso"
                    clearable
                    size="large"
                >
                  <template #prepend>
                    <el-icon><Folder /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
            </template>

            <!-- 其他协议配置 -->
            <template v-else>
              <el-form-item :label="formData.protocol === 'oss' ? 'AccessKeyId' : '监听地址'" required>
                <el-input
                    v-model="formData.listenAddress"
                    :placeholder="getListenAddressPlaceholder()"
                    clearable
                    size="large"
                >
                  <template #prepend>
                    <el-icon><Monitor /></el-icon>
                  </template>
                </el-input>
                <div class="form-hint">监听地址格式：IP:端口</div>
              </el-form-item>

              <el-form-item :label="formData.protocol === 'oss' ? 'AccessKeySecret' : '连接地址'" required>
                <el-input
                    v-model="formData.connectAddress"
                    :placeholder="getConnectAddressPlaceholder()"
                    clearable
                    size="large"
                >
                  <template #prepend>
                    <el-icon><Promotion /></el-icon>
                  </template>
                </el-input>
                <div class="form-hint">客户端连接地址格式：IP:端口</div>
              </el-form-item>
            </template>
          </div>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancel" :disabled="loading">
            取消
          </el-button>
          <el-button
              v-if="currentStep > 0"
              @click="currentStep--"
              :disabled="loading"
          >
            上一步
          </el-button>
          <el-button
              v-if="currentStep < 1"
              type="primary"
              @click="currentStep++"
              :disabled="!formData.protocol"
          >
            下一步
          </el-button>
          <el-button
              v-if="currentStep === 1"
              type="primary"
              @click="addListener"
              :loading="loading"
              :disabled="!isFormValid"
          >
            确认添加
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import ListenerAPI from '@/api/listener'
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Plus,
  Refresh,
  Position,
  Connection,
  VideoPlay,
  VideoPause,
  Delete,
  View,
  DataLine,
  CircleCheck,
  CircleClose,
  Monitor,
  Promotion,
  Link,
  Key,
  Lock,
  Folder,
  Connection as ConnectionIcon,
  Lightning,
  Cloudy
} from '@element-plus/icons-vue'

const tableData = ref([]);
const loading = ref(false);
const addListenerDialogVisible = ref(false);
const currentStep = ref(0);

const formData = ref({
  protocol: 'websocket',
  listenAddress: '',
  connectAddress: '',
});

const ossData = ref({
  endpoint: 'oss-cn-hangzhou.aliyuncs.com',
  bucketName: 'alisso'
});

// 协议选项
const protocols = [
  { value: 'websocket', label: 'Websocket', icon: ConnectionIcon, iconClass: 'protocol-ws', description: '基于WebSocket的实时通信' },
  { value: 'tcp', label: 'TCP', icon: ConnectionIcon, iconClass: 'protocol-tcp', description: '标准的TCP协议连接' },
  { value: 'kcp', label: 'KCP', icon: Lightning, iconClass: 'protocol-kcp', description: '快速可靠的KCP协议' },
  { value: 'http', label: 'HTTP', icon: Link, iconClass: 'protocol-http', description: 'HTTP协议支持' },
  { value: 'oss', label: 'OSS', icon: Cloudy, iconClass: 'protocol-oss', description: '阿里云OSS存储' }
];

// 计算属性
const activeListeners = computed(() => {
  return (tableData.value as any[]).filter(item => item.Status === 1).length
});

const inactiveListeners = computed(() => {
  return (tableData.value as any[]).filter(item => item.Status === 2).length
});

const isFormValid = computed(() => {
  if (formData.value.protocol === 'oss') {
    return ossData.value.endpoint &&
        formData.value.listenAddress &&
        formData.value.connectAddress &&
        ossData.value.bucketName;
  }
  return formData.value.listenAddress && formData.value.connectAddress;
});

// 方法
const getProtocolTagType = (protocol: string) => {
  const types: Record<string, string> = {
    'websocket': 'primary',
    'tcp': 'info',
    'kcp': 'warning',
    'http': 'success',
    'oss': 'danger'
  };
  return types[protocol] || 'info';
};

const selectProtocol = (protocol: string) => {
  formData.value.protocol = protocol;
  // 清空表单数据
  formData.value.listenAddress = '';
  formData.value.connectAddress = '';
  ossData.value = {
    endpoint: 'oss-cn-hangzhou.aliyuncs.com',
    bucketName: 'alisso'
  };
};

const getListenAddressPlaceholder = () => {
  return '0.0.0.0:8083';
};

const getConnectAddressPlaceholder = () => {
  return '外网连接地址 (127.0.0.1:8083)';
};

const getListenerList = async () => {
  loading.value = true;
  try {
    const res = await ListenerAPI.getListenerList();
    if (res.status === 200) {
      tableData.value = res.data.data;
    }
  } catch (error) {
    console.error('获取监听器列表失败:', error);
    ElMessage.error('获取监听器列表失败');
  } finally {
    loading.value = false;
  }
};

const addListener = async () => {
  if (!isFormValid.value) {
    ElMessage.warning('请填写完整的配置信息');
    return;
  }

  loading.value = true;
  try {
    let res;
    if (formData.value.protocol === "oss") {
      const fullAddress = `${ossData.value.endpoint}:${formData.value.listenAddress}:${formData.value.connectAddress}:${ossData.value.bucketName}`;
      res = await ListenerAPI.addListener({
        type: formData.value.protocol,
        listenAddress: fullAddress,
        connectAddress: fullAddress
      });
    } else {
      res = await ListenerAPI.addListener({
        type: formData.value.protocol,
        listenAddress: formData.value.listenAddress,
        connectAddress: formData.value.connectAddress
      });
    }

    if (res.status === 200) {
      if (res.data.status === 200) {
        ElMessage.success("监听器添加成功");
        addListenerDialogVisible.value = false;
        resetForm();
        await getListenerList();
      } else {
        ElMessage.error(res.data.data || "添加失败");
      }
    }
  } catch (error) {
    console.error('添加监听器失败:', error);
    ElMessage.error('添加监听器失败');
  } finally {
    loading.value = false;
  }
};

const handleOpen = async (row: any) => {
  try {
    const res = await ListenerAPI.openListener({ listenAddress: row.ListenAddress });
    if (res.data.status === 200) {
      await getListenerList();
      ElMessage.success("监听器启动成功");
    } else {
      ElMessage.error(res.data.data || "启动失败");
    }
  } catch (error) {
    console.error('启动监听器失败:', error);
    ElMessage.error('启动监听器失败');
  }
};

const handleClose = async (row: any) => {
  try {
    const res = await ListenerAPI.closeListener({ listenAddress: row.ListenAddress });
    if (res.data.status === 200) {
      await getListenerList();
      ElMessage.success("监听器已停止");
    } else {
      ElMessage.error(res.data.data || "停止失败");
    }
  } catch (error) {
    console.error('停止监听器失败:', error);
    ElMessage.error('停止监听器失败');
  }
};

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
        `确定要删除监听器 "${row.ListenAddress}" 吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          confirmButtonClass: 'delete-confirm-btn'
        }
    );

    const res = await ListenerAPI.deleteListener({ listenAddress: row.ListenAddress });
    if (res.data.status === 200) {
      await getListenerList();
      ElMessage.success("监听器删除成功");
    } else {
      ElMessage.error(res.data.data || "删除失败");
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除监听器失败:', error);
      ElMessage.error('删除监听器失败');
    }
  }
};

const handleViewDetails = (row: any) => {
  ElMessageBox.alert(
      `<div class="listener-details">
      <h3>监听器详情</h3>
      <p><strong>协议类型：</strong>${row.Type}</p>
      <p><strong>监听地址：</strong>${row.ListenAddress}</p>
      <p><strong>连接地址：</strong>${row.ConnectAddress}</p>
      <p><strong>当前状态：</strong>${row.Status === 1 ? '运行中' : '已停止'}</p>
    </div>`,
      '监听器详情',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确定',
        customClass: 'details-dialog'
      }
  );
};

const handleCancel = () => {
  addListenerDialogVisible.value = false;
  resetForm();
};

const resetForm = () => {
  formData.value = {
    protocol: 'websocket',
    listenAddress: '',
    connectAddress: '',
  };
  ossData.value = {
    endpoint: 'oss-cn-hangzhou.aliyuncs.com',
    bucketName: 'alisso'
  };
  currentStep.value = 0;
};

onMounted(async () => {
  await getListenerList();
});
</script>

<style scoped>
.listener-management {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  min-height: calc(100vh - 60px);
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-content {
  flex: 1;
}

.page-title {
  margin: 0;
  font-size: 28px;
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
  font-size: 14px;
  color: #7f8c8d;
}

.add-listener-btn {
  height: 44px;
  padding: 0 24px;
  border-radius: 10px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s;
}

.add-listener-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.add-listener-btn .el-icon {
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

/* 表格卡片 */
.listener-table-card {
  border-radius: 12px;
  border: 1px solid #ebeef5;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.listener-table-card :deep(.el-card__header) {
  border-bottom: 1px solid #ebeef5;
  padding: 20px;
  background: linear-gradient(90deg, #f8f9fa 0%, #fff 100%);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  margin: 0;
  font-size: 16px;
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
  height: 16px;
  background: linear-gradient(180deg, #409eff 0%, #79bbff 100%);
  border-radius: 2px;
}

/* 自定义表格样式 */
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

/* 协议类型样式 */
.protocol-cell {
  display: flex;
  align-items: center;
}

.protocol-tag {
  font-weight: 600;
  font-size: 12px;
  padding: 4px 12px;
  letter-spacing: 0.5px;
}

/* 地址单元格样式 */
.address-cell {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.address-icon {
  color: #409eff;
  font-size: 16px;
  margin-top: 2px;
  flex-shrink: 0;
}

.address-content {
  flex: 1;
  min-width: 0;
}

.address-text {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 13px;
  color: #2c3e50;
  word-break: break-all;
}

.address-label {
  font-size: 11px;
  color: #7f8c8d;
  margin-top: 2px;
}

/* 状态单元格样式 */
.status-cell {
  display: flex;
  align-items: center;
  gap: 8px;
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

.status-tag {
  font-weight: 500;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  gap: 8px;
}

.action-buttons .el-button {
  width: 32px;
  height: 32px;
  padding: 0;
  transition: all 0.3s;
}

.action-buttons .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 添加监听器对话框样式 */
.add-listener-dialog {
  border-radius: 16px;
  overflow: hidden;
}

.add-listener-dialog :deep(.el-dialog__header) {
  margin: 0;
  padding: 0;
}

.dialog-content {
  padding: 0 24px;
}

.form-steps {
  margin-bottom: 24px;
}

.step-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

/* 协议选择网格 */
.protocol-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.protocol-card {
  padding: 16px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  gap: 12px;
}

.protocol-card:hover {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.protocol-selected {
  border-color: #409eff !important;
  background: rgba(64, 158, 255, 0.1) !important;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.protocol-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.protocol-icon .protocol-ws { color: #409eff; }
.protocol-icon .protocol-tcp { color: #909399; }
.protocol-icon .protocol-kcp { color: #e6a23c; }
.protocol-icon .protocol-http { color: #67c23a; }
.protocol-icon .protocol-oss { color: #f56c6c; }

.protocol-info {
  flex: 1;
  min-width: 0;
}

.protocol-name {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.protocol-desc {
  font-size: 12px;
  color: #6c757d;
  line-height: 1.4;
}

/* 表单样式 */
.listener-form {
  margin-top: 24px;
}

.listener-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.listener-form :deep(.el-form-item__label) {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
  padding-bottom: 8px;
  display: block;
}

.listener-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  padding-left: 12px;
}

.listener-form :deep(.el-input__prepend) {
  background: transparent;
  border-right: 1px solid #dcdfe6;
  padding: 0 12px;
}

.listener-form :deep(.el-input__prepend .el-icon) {
  color: #909399;
}

.form-hint {
  font-size: 12px;
  color: #6c757d;
  margin-top: 6px;
  padding-left: 4px;
}

/* 对话框底部 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #ebeef5;
}

.dialog-footer .el-button {
  min-width: 80px;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s;
}

.dialog-footer .el-button:hover {
  transform: translateY(-1px);
}

/* 详情对话框样式 */
:deep(.details-dialog) {
  border-radius: 12px;
}

:deep(.listener-details) {
  line-height: 1.6;
}

:deep(.listener-details h3) {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
}

:deep(.listener-details p) {
  margin: 8px 0;
  color: #495057;
}

:deep(.listener-details strong) {
  color: #2c3e50;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .listener-management {
    padding: 16px;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .header-section {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .add-listener-btn {
    width: 100%;
  }

  .protocol-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }

  .action-buttons .el-button {
    width: 28px;
    height: 28px;
  }
}

@media (max-width: 480px) {
  .add-listener-dialog {
    width: 90vw !important;
  }

  .dialog-content {
    padding: 0 16px;
  }

  .dialog-footer {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>