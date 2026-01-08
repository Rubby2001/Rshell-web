<template>
  <div class="socks5-container">
    <!-- 头部卡片 -->
    <el-card shadow="never" class="header-card">
      <div class="header-content">
        <div class="header-left">
          <h2 class="header-title">
            <i class="el-icon-connection header-icon"></i>
            Socks5代理管理
          </h2>
          <p class="header-description">
            管理主机上的Socks5代理服务，实现网络流量转发
          </p>
        </div>
        <div class="header-right">
          <el-button
              type="primary"
              size="large"
              @click="dialogVisible = true"
              class="add-button"
          >
            <i class="el-icon-plus"></i>
            新增代理
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 代理列表 -->
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="table-header">
          <div class="table-title">
            <i class="el-icon-s-order"></i>
            <span>代理列表</span>
          </div>
          <div class="table-actions">
            <el-button
                type="info"
                size="small"
                :icon="Refresh"
                @click="refreshList"
                :loading="loading"
            >
              刷新
            </el-button>
            <el-button
                type="text"
                size="small"
                @click="toggleHelp"
            >
              <i class="el-icon-question"></i>
              使用说明
            </el-button>
          </div>
        </div>
      </template>

      <!-- 空状态 -->
      <el-empty
          v-if="tableData.length === 0 && !loading"
          description="暂无代理配置"
          :image-size="100"
      >
        <el-button type="primary" @click="dialogVisible = true">
          创建第一个代理
        </el-button>
      </el-empty>

      <!-- 代理表格 -->
      <div v-else>
        <el-table
            :data="tableData"
            :loading="loading"
            style="width: 100%"
            class="proxy-table"
            stripe
        >
          <el-table-column
              prop="Socks5port"
              label="端口"
              width="120"
          >
            <template #default="{ row }">
              <div class="port-cell">
                <span class="port-number">{{ row.Socks5port }}</span>
                <el-tag
                    size="small"
                    type="info"
                    effect="plain"
                    v-if="row.Status === 1"
                >
                  已开启
                </el-tag>
              </div>
            </template>
          </el-table-column>

          <el-table-column
              prop="UserName"
              label="用户名"
              width="150"
          >
            <template #default="{ row }">
              <span v-if="row.UserName" class="auth-info">
                <i class="el-icon-user"></i>
                {{ row.UserName }}
              </span>
              <span v-else class="no-auth">无认证</span>
            </template>
          </el-table-column>

          <el-table-column
              prop="Password"
              label="密码"
              width="180"
          >
            <template #default="{ row }">
              <div v-if="row.Password" class="password-cell">
                <span class="password-mask">••••••</span>
                <el-tooltip
                    content="点击显示密码"
                    placement="top"
                >
                  <el-button
                      type="text"
                      size="small"
                      @click="showPassword(row)"
                      class="show-password-btn"
                  >
                    <i class="el-icon-view"></i>
                  </el-button>
                </el-tooltip>
              </div>
              <span v-else class="no-auth">无密码</span>
            </template>
          </el-table-column>

          <el-table-column
              label="连接信息"
              min-width="200"
          >
            <template #default="{ row }">
              <div class="connection-info">
                <div class="connection-item">
                  <span class="label">类型：</span>
                  <el-tag size="small">{{ row.Type }}</el-tag>
                </div>
                <div class="connection-item">
                  <span class="label">状态：</span>
                  <el-tag
                      :type="row.Status === 1 ? 'success' : 'danger'"
                      size="small"
                      :effect="row.Status === 1 ? 'light' : 'plain'"
                  >
                    <i :class="row.Status === 1 ? 'el-icon-success' : 'el-icon-error'"></i>
                    {{ row.Status === 1 ? '运行中' : '已停止' }}
                  </el-tag>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column
              label="操作"
              width="240"
              align="center"
              fixed="right"
          >
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button
                    v-if="row.Status === 2"
                    type="success"
                    size="small"
                    @click="handleOpen(row)"
                    :loading="row.loading"
                    class="action-btn"
                >
                  <i class="el-icon-video-play"></i>
                  开启
                </el-button>
                <el-button
                    v-if="row.Status === 1"
                    type="warning"
                    size="small"
                    @click="handleClose(row)"
                    :loading="row.loading"
                    class="action-btn"
                >
                  <i class="el-icon-video-pause"></i>
                  停止
                </el-button>
                <el-button
                    type="danger"
                    size="small"
                    @click="handleDelete(row)"
                    :loading="row.deleting"
                    class="action-btn"
                >
                  <i class="el-icon-delete"></i>
                  删除
                </el-button>
                <el-dropdown
                    trigger="click"
                    @command="handleCommand($event, row)"
                    size="small"
                >
                  <el-button
                      type="text"
                      size="small"
                      class="more-btn"
                  >
                    <i class="el-icon-more"></i>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="copy">
                        <i class="el-icon-document-copy"></i>
                        复制连接信息
                      </el-dropdown-item>
                      <el-dropdown-item command="test">
                        <i class="el-icon-connection"></i>
                        测试连接
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 统计信息 -->
        <div class="stats-info" v-if="tableData.length > 0">
          <el-space>
            <span class="stat-item">
              <span class="stat-label">总数：</span>
              <span class="stat-value">{{ tableData.length }}</span>
            </span>
            <el-divider direction="vertical" />
            <span class="stat-item">
              <span class="stat-label">运行中：</span>
              <span class="stat-value running">
                {{ runningCount }}
              </span>
            </span>
            <el-divider direction="vertical" />
            <span class="stat-item">
              <span class="stat-label">已停止：</span>
              <span class="stat-value stopped">
                {{ stoppedCount }}
              </span>
            </span>
          </el-space>
        </div>
      </div>
    </el-card>

    <!-- 新增代理对话框 -->
    <el-dialog
        v-model="dialogVisible"
        title="新增Socks5代理"
        width="480px"
        class="add-dialog"
        @close="resetForm"
    >
      <el-form
          :model="formData"
          label-width="120px"
          :rules="formRules"
          ref="formRef"
      >
        <el-form-item
            label="监听端口"
            prop="socks5port"
            required
        >
          <el-input
              v-model="formData.socks5port"
              placeholder="请输入端口号（如：1080）"
              clearable
          >
            <template #prepend>
              <span class="input-prepend">端口</span>
            </template>
          </el-input>
          <div class="form-tip">
            建议使用 10000-65535 之间的端口
          </div>
        </el-form-item>

        <el-form-item label="用户名" prop="username">
          <el-input
              v-model="formData.username"
              placeholder="可选，留空则不启用认证"
              clearable
          >
            <template #prepend>
              <span class="input-prepend">用户</span>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
              v-model="formData.password"
              placeholder="可选，留空则不启用认证"
              type="password"
              show-password
              clearable
          >
            <template #prepend>
              <span class="input-prepend">密码</span>
            </template>
          </el-input>
          <div class="form-tip">
            若设置用户名，则必须同时设置密码
          </div>
        </el-form-item>

        <el-form-item label="代理类型" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio label="socks5">Socks5</el-radio>
<!--            <el-radio label="socks4" disabled>Socks4（暂不支持）</el-radio>-->
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
              type="primary"
              @click="startSocks5"
              :loading="adding"
          >
            确认创建
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 使用说明抽屉 -->
    <el-drawer
        v-model="helpVisible"
        title="使用说明"
        size="400px"
    >
      <div class="help-content">
        <h3><i class="el-icon-info"></i> 什么是Socks5代理？</h3>
        <p>Socks5是一种网络代理协议，它比HTTP代理更底层，可以代理各种类型的网络流量。</p>

        <h3><i class="el-icon-setting"></i> 使用方法</h3>
        <el-steps direction="vertical" :active="4">
          <el-step title="创建代理">
            <template #description>
              <p>点击"新增代理"按钮，配置端口和认证信息</p>
            </template>
          </el-step>
          <el-step title="启动代理">
            <template #description>
              <p>创建后，点击"开启"按钮启动代理服务</p>
            </template>
          </el-step>
          <el-step title="配置客户端">
            <template #description>
              <p>在客户端工具中配置代理地址：</p>
              <el-card shadow="never" class="example-card">
                <pre class="config-example">地址: {{ currentHost }}
端口: [您的端口]
认证: [用户名/密码]（如已设置）</pre>
              </el-card>
            </template>
          </el-step>
          <el-step title="使用代理">
            <template #description>
              <p>配置完成后，所有流量将通过代理服务器转发</p>
            </template>
          </el-step>
        </el-steps>

        <h3><i class="el-icon-warning-outline"></i> 注意事项</h3>
        <ul class="notice-list">
          <li>确保防火墙已开放对应端口</li>
          <li>建议使用高强度密码</li>
          <li>定期检查代理状态和日志</li>
          <li>不使用时请及时关闭代理</li>
        </ul>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus";
import { Refresh } from '@element-plus/icons-vue';
import ClientAPI from "@/api/clients";
import { useRoute } from "vue-router";

const route = useRoute();
const uid = route.query.uid as string;

// 响应式数据
const dialogVisible = ref(false);
const helpVisible = ref(false);
const loading = ref(false);
const adding = ref(false);
const tableData = ref<any[]>([]);
const formRef = ref<FormInstance>();

// 表单数据
const formData = reactive({
  connectAddress: "",
  socks5port: "",
  username: "",
  password: "",
  type: "socks5"
});

// 表单验证规则
const formRules = {
  socks5port: [
    { required: true, message: '请输入端口号', trigger: 'blur' },
    { pattern: /^[1-9]\d*$/, message: '端口号必须为正整数', trigger: 'blur' },
    { validator: (rule: any, value: string, callback: any) => {
        if (value && (parseInt(value) < 1 || parseInt(value) > 65535)) {
          callback(new Error('端口号范围 1-65535'));
        } else {
          callback();
        }
      }, trigger: 'blur' }
  ],
  username: [
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value && !formData.password) {
          callback(new Error('设置了用户名必须同时设置密码'));
        } else if (!value && formData.password) {
          callback(new Error('设置了密码必须同时设置用户名'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 计算属性
const runningCount = computed(() => {
  return tableData.value.filter(item => item.Status === 1).length;
});

const stoppedCount = computed(() => {
  return tableData.value.filter(item => item.Status === 2).length;
});

const currentHost = computed(() => {
  return window.location.hostname || 'localhost';
});

// 方法
const getSocks5List = async () => {
  loading.value = true;
  try {
    const res = await ClientAPI.getSocks5List({ uid });
    if (res.status === 200) {
      // 检查 res.data.data 是否存在且为数组，否则置空数组
      if (res.data.data && Array.isArray(res.data.data)) {
        tableData.value = res.data.data.map((item: any) => ({
          ...item,
          loading: false,
          deleting: false
        }));
      } else {
        // 当 data 为 null、undefined 或不是数组时，清空表格
        tableData.value = [];
      }
    }
  } catch (error) {
    console.error('获取代理列表失败:', error);
    ElMessage.error('获取代理列表失败');
  } finally {
    loading.value = false;
  }
};

const refreshList = async () => {
  await getSocks5List();
  ElMessage.success('列表已刷新');
};

const startSocks5 = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    adding.value = true;
    try {
      const res = await ClientAPI.startSocks5({
        Password: formData.password,
        Socks5port: formData.socks5port,
        UserName: formData.username,
        uid
      });

      if (res.status === 200) {
        if (res.data.status === 200) {
          ElMessage.success('代理创建成功');
          dialogVisible.value = false;
          await getSocks5List();
        } else {
          ElMessage.error(res.data.data || '创建失败');
        }
      }
    } catch (error) {
      console.error('创建代理失败:', error);
      ElMessage.error('创建代理失败');
    } finally {
      adding.value = false;
    }
  });
};

const handleClose = async (row: any) => {
  row.loading = true;
  try {
    const res = await ClientAPI.CloseSocks5({
      Password: row.Password,
      Socks5port: row.Socks5port,
      UserName: row.UserName,
      uid
    });

    if (res.status === 200) {
      if (res.data.status === 200) {
        ElMessage.success('代理已停止');
        await getSocks5List();
      } else {
        ElMessage.error(res.data.data || '停止失败');
      }
    }
  } catch (error) {
    console.error('停止代理失败:', error);
    ElMessage.error('停止代理失败');
  } finally {
    row.loading = false;
  }
};

const handleOpen = async (row: any) => {
  row.loading = true;
  try {
    const res = await ClientAPI.OpenSocks5({
      Password: row.Password,
      Socks5port: row.Socks5port,
      UserName: row.UserName,
      uid
    });

    if (res.status === 200) {
      if (res.data.status === 200) {
        ElMessage.success('代理已开启');
        await getSocks5List();
      } else {
        ElMessage.error(res.data.data || '开启失败');
      }
    }
  } catch (error) {
    console.error('开启代理失败:', error);
    ElMessage.error('开启代理失败');
  } finally {
    row.loading = false;
  }
};

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
        '确定要删除此代理吗？删除后无法恢复。',
        '确认删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    );

    row.deleting = true;
    const res = await ClientAPI.DeleteSocks5({
      Password: row.Password,
      Socks5port: row.Socks5port,
      UserName: row.UserName,
      uid
    });

    if (res.status === 200) {
      if (res.data.status === 200) {
        ElMessage.success('代理已删除');
        await getSocks5List();
      } else {
        ElMessage.error(res.data.data || '删除失败');
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除代理失败:', error);
      ElMessage.error('删除代理失败');
    }
  } finally {
    row.deleting = false;
  }
};

const handleCommand = (command: string, row: any) => {
  switch (command) {
    case 'copy':
      copyConnectionInfo(row);
      break;
    case 'test':
      testConnection(row);
      break;
  }
};

const copyConnectionInfo = (row: any) => {
  const text = `Socks5代理配置：
服务器: ${currentHost.value}
端口: ${row.Socks5port}
用户名: ${row.UserName || '无'}
密码: ${row.Password || '无'}`;

  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('连接信息已复制到剪贴板');
  }).catch(() => {
    ElMessage.error('复制失败');
  });
};

const testConnection = async (row: any) => {
  ElMessage.info('测试连接功能开发中...');
};

const showPassword = (row: any) => {
  ElMessageBox.alert(
      `密码：${row.Password}`,
      '密码详情',
      {
        confirmButtonText: '确定',
        callback: () => {
          copyToClipboard(row.Password);
        }
      }
  );
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('密码已复制到剪贴板');
  });
};

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  formData.socks5port = '';
  formData.username = '';
  formData.password = '';
  formData.type = 'socks5';
};

const toggleHelp = () => {
  helpVisible.value = !helpVisible.value;
};

// 生命周期
onMounted(async () => {
  await getSocks5List();
});
</script>

<style scoped lang="scss">
.socks5-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-card {
  margin-bottom: 20px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  :deep(.el-card__body) {
    padding: 24px 32px;
  }
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

  .header-icon {
    margin-right: 12px;
    font-size: 28px;
  }
}

.header-description {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

.add-button {
  height: 48px;
  padding: 0 32px;
  font-size: 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}

.table-card {
  border: none;
  border-radius: 12px;

  :deep(.el-card__header) {
    border-bottom: 1px solid #f0f0f0;
    padding: 20px 24px;
  }

  :deep(.el-card__body) {
    padding: 0;
  }
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;

  i {
    margin-right: 8px;
    color: #409eff;
  }
}

.table-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.proxy-table {
  :deep(.el-table__header) {
    th {
      background-color: #fafafa;
      font-weight: 600;
      color: #303133;
    }
  }

  :deep(.el-table__body) {
    tr:hover {
      td {
        background-color: #f5f7fa;
      }
    }
  }
}

.port-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .port-number {
    font-family: 'Monaco', 'Consolas', monospace;
    font-weight: 600;
    color: #409eff;
  }
}

.auth-info {
  display: flex;
  align-items: center;
  gap: 6px;

  i {
    color: #909399;
  }
}

.no-auth {
  color: #c0c4cc;
  font-style: italic;
}

.password-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .password-mask {
    font-family: 'Monaco', 'Consolas', monospace;
    letter-spacing: 2px;
  }

  .show-password-btn {
    padding: 2px;
    color: #909399;

    &:hover {
      color: #409eff;
    }
  }
}

.connection-info {
  .connection-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      color: #909399;
      font-size: 12px;
      min-width: 40px;
    }
  }
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;

  .action-btn {
    padding: 7px 12px;

    i {
      margin-right: 4px;
    }
  }

  .more-btn {
    padding: 7px;
    color: #909399;

    &:hover {
      color: #409eff;
    }
  }
}

.stats-info {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  background-color: #fafafa;

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

    &.running {
      color: #67c23a;
    }

    &.stopped {
      color: #f56c6c;
    }
  }
}

.add-dialog {
  :deep(.el-dialog__header) {
    border-bottom: 1px solid #f0f0f0;
    margin-right: 0;
  }

  :deep(.el-dialog__body) {
    padding: 24px 20px 20px;
  }
}

.input-prepend {
  color: #909399;
  width: 40px;
  text-align: center;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.help-content {
  padding: 20px;

  h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 20px 0 12px 0;
    color: #303133;

    i {
      color: #409eff;
    }

    &:first-child {
      margin-top: 0;
    }
  }

  p {
    color: #606266;
    line-height: 1.6;
    margin: 0 0 16px 0;
  }
}

.example-card {
  margin: 12px 0;
  background-color: #f8f9fa;

  :deep(.el-card__body) {
    padding: 12px;
  }
}

.config-example {
  margin: 0;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 13px;
  color: #333;
  white-space: pre-wrap;
}

.notice-list {
  margin: 0;
  padding-left: 20px;
  color: #606266;

  li {
    margin-bottom: 8px;
    line-height: 1.6;
  }
}

:deep(.el-step__head) {
  &.is-process {
    color: #409eff;
    border-color: #409eff;
  }
}

:deep(.el-step__title) {
  &.is-process {
    color: #409eff;
  }
}
</style>