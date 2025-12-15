<template>
  <div>
    <!-- 统计面板 -->
    <el-card shadow="never" class="stats-card" v-if="showStats">
      <div class="stats-content">
        <div class="stats-item total">
          <div class="stats-icon">
            <i class="el-icon-s-operation"></i>
          </div>
          <div class="stats-text">
            <div class="stats-label">总进程数</div>
            <div class="stats-value">{{ softwareStats.total }}</div>
          </div>
        </div>

        <el-divider direction="vertical" />

        <div class="stats-item antivirus" v-if="softwareStats.antivirus > 0">
          <div class="stats-icon">
            <i class="el-icon-shield"></i>
          </div>
          <div class="stats-text">
            <div class="stats-label">杀毒软件</div>
            <div class="stats-value">{{ softwareStats.antivirus }}</div>
          </div>
        </div>

        <div class="stats-item monitor" v-if="softwareStats.monitor > 0">
          <div class="stats-icon">
            <i class="el-icon-monitor"></i>
          </div>
          <div class="stats-text">
            <div class="stats-label">监控软件</div>
            <div class="stats-value">{{ softwareStats.monitor }}</div>
          </div>
        </div>

        <div class="stats-item cloud" v-if="softwareStats.cloud > 0">
          <div class="stats-icon">
            <i class="el-icon-cloudy"></i>
          </div>
          <div class="stats-text">
            <div class="stats-label">云安全</div>
            <div class="stats-value">{{ softwareStats.cloud }}</div>
          </div>
        </div>

        <div class="stats-item management" v-if="softwareStats.management > 0">
          <div class="stats-icon">
            <i class="el-icon-setting"></i>
          </div>
          <div class="stats-text">
            <div class="stats-label">管理软件</div>
            <div class="stats-value">{{ softwareStats.management }}</div>
          </div>
        </div>

        <div class="stats-item unknown" v-if="softwareStats.unknown > 0">
          <div class="stats-icon">
            <i class="el-icon-question"></i>
          </div>
          <div class="stats-text">
            <div class="stats-label">未知软件</div>
            <div class="stats-value">{{ softwareStats.unknown }}</div>
          </div>
        </div>
      </div>

      <!-- 过滤选项 -->
      <div class="filter-options">
        <el-button-group class="filter-buttons">
          <el-button
              :type="filterType === 'all' ? 'primary' : ''"
              size="small"
              @click="filterType = 'all'"
          >
            全部
          </el-button>
          <el-button
              :type="filterType === 'antivirus' ? 'primary' : ''"
              size="small"
              @click="filterType = 'antivirus'"
          >
            杀毒软件
          </el-button>
          <el-button
              :type="filterType === 'monitor' ? 'primary' : ''"
              size="small"
              @click="filterType = 'monitor'"
          >
            监控软件
          </el-button>
          <el-button
              :type="filterType === 'cloud' ? 'primary' : ''"
              size="small"
              @click="filterType = 'cloud'"
          >
            云安全
          </el-button>
          <el-button
              :type="filterType === 'management' ? 'primary' : ''"
              size="small"
              @click="filterType = 'management'"
          >
            管理软件
          </el-button>
          <el-button
              :type="filterType === 'security' ? 'primary' : ''"
              size="small"
              @click="filterType = 'security'"
          >
            安全软件
          </el-button>
          <el-button
              :type="filterType === 'normal' ? 'primary' : ''"
              size="small"
              @click="filterType = 'normal'"
          >
            普通进程
          </el-button>
        </el-button-group>

        <div class="filter-right">
          <el-switch
              v-model="showOnlySecuritySoftware"
              active-text="只显示安全软件"
              size="small"
              style="margin-right: 16px;"
          />
          <el-button
              type="info"
              size="small"
              @click="exportProcessList"
              :loading="exporting"
          >
            导出列表
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 进程列表 -->
    <TablesView
        :columns="PID_tableColumn"
        :table-data="filteredTableData"
        :options="options"
        :loading="loading"
    >
      <template #PID="{ row }">
        <span>{{ row.PID }}</span>
      </template>
      <template #PPID="{ row }">
        <span>{{ row.PPID }}</span>
      </template>
      <template #Name="{ row }">
        <div class="process-name-cell">
          <div class="process-name-main">
            <span class="process-name">{{ row.Name }}</span>
            <el-tooltip
                v-if="row.softwareInfo"
                effect="dark"
                placement="top"
            >
              <template #content>
                <div class="software-tooltip">
                  <div class="tooltip-title">{{ row.softwareInfo.name }}</div>
                  <div class="tooltip-category">
                    <el-tag :type="getSoftwareTagType(row.softwareInfo.category)" size="mini">
                      {{ getCategoryLabel(row.softwareInfo.category) }}
                    </el-tag>
                  </div>
                  <div class="tooltip-processes" v-if="row.softwareInfo.processes && row.softwareInfo.processes.length > 0">
                    <div class="tooltip-subtitle">相关进程：</div>
                    <div class="process-list">
                      <el-tag
                          v-for="process in row.softwareInfo.processes.slice(0, 5)"
                          :key="process"
                          size="mini"
                          type="info"
                          style="margin: 2px;"
                      >
                        {{ process }}
                      </el-tag>
                      <div v-if="row.softwareInfo.processes.length > 5" class="more-processes">
                        等 {{ row.softwareInfo.processes.length }} 个进程
                      </div>
                    </div>
                  </div>
                  <div class="tooltip-url" v-if="row.softwareInfo.url">
                    <a :href="row.softwareInfo.url" target="_blank" @click.stop>
                      官网：{{ row.softwareInfo.url }}
                    </a>
                  </div>
                </div>
              </template>
              <el-tag
                  class="software-tag"
                  :type="getSoftwareTagType(row.softwareInfo.category)"
                  size="small"
                  :effect="row.softwareInfo.category === 'antivirus' ? 'dark' : 'plain'"
              >
                {{ getCategoryLabel(row.softwareInfo.category) }}
              </el-tag>
            </el-tooltip>
          </div>
          <div class="process-extra" v-if="row.softwareInfo?.category === 'antivirus'">
            <el-alert
                title="检测到杀毒软件"
                type="warning"
                :closable="false"
                show-icon
                size="small"
            />
          </div>
        </div>
      </template>

      <!-- 新增：安全软件列 -->
      <template #SecuritySoftware="{ row }">
        <div class="security-software-cell">
          <div v-if="row.softwareInfo">
            <div class="software-name-row">
              <span class="software-name">{{ row.softwareInfo.name }}</span>
              <el-tag
                  class="category-tag"
                  :type="getSoftwareTagType(row.softwareInfo.category)"
                  size="mini"
                  effect="plain"
              >
                {{ getCategoryLabel(row.softwareInfo.category) }}
              </el-tag>
            </div>
            <div class="software-meta" v-if="row.softwareInfo.url">
              <a
                  :href="row.softwareInfo.url"
                  target="_blank"
                  class="software-link"
                  @click.stop
              >
                <i class="el-icon-link"></i> 官网
              </a>
            </div>
          </div>
          <div v-else class="no-software">
            <span class="no-software-text">-</span>
          </div>
        </div>
      </template>

      <template #Arch="{ row }">
        <span>{{ row.Arch }}</span>
      </template>
      <template #User="{ row }">
        <span>{{ row.User }}</span>
      </template>
      <template #action="{ row }">
        <div class="action-buttons">
          <el-button
              v-if="row.softwareInfo?.category === 'antivirus'"
              type="warning"
              size="small"
              @click.stop="showAntivirusWarning(row)"
          >
            警告
          </el-button>
          <el-button
              type="danger"
              size="small"
              @click.stop="handleKill(row)"
              :disabled="row.softwareInfo?.category === 'antivirus'"
          >
            Kill
          </el-button>
        </div>
      </template>
    </TablesView>

    <!-- 杀毒软件警告对话框 -->
    <el-dialog
        v-model="warningDialogVisible"
        title="杀毒软件警告"
        width="500px"
    >
      <div class="warning-dialog-content">
        <el-alert
            type="warning"
            title="注意"
            :description="warningMessage"
            show-icon
            :closable="false"
        />
        <div class="warning-actions">
          <el-button type="warning" @click="handleForceKill">强制终止</el-button>
          <el-button @click="warningDialogVisible = false">取消</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import TablesView from "@/components/Common/Tables/TablesView.vue";
import { reactive, ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import ClientAPI from "@/api/clients";
import { ElMessageBox, ElMessage } from "element-plus";

// 导入杀毒软件JSON数据
import antivirusData from "@/data/antivirus.json";

const route = useRoute();

// 响应式数据
const loading = ref(false);
const filterType = ref('all');
const showOnlySecuritySoftware = ref(false);
const warningDialogVisible = ref(false);
const selectedProcess = ref<any>(null);
const warningMessage = ref('');
const showStats = ref(true);
const exporting = ref(false);

// 统计信息
const softwareStats = ref({
  total: 0,
  antivirus: 0,
  monitor: 0,
  cloud: 0,
  management: 0,
  unknown: 0,
  security: 0,
  normal: 0
});

// 创建进程名到软件信息的映射
const processToSoftwareMap = new Map<string, {
  name: string;
  category: string;
  url: string;
  processes: string[];
}>();

// 优化分类判断
const classifySoftware = (softwareName: string, processes: string[]) => {
  const name = softwareName.toLowerCase();

  // 判断是否为杀毒软件
  const antivirusKeywords = [
    '杀毒', 'antivirus', '安全', '防护', 'firewall', 'defender',
    '安全狗', '火绒', '360', '金山', '腾讯', '迈克菲', '卡巴斯基',
    'symantec', 'norton', 'kaspersky', 'mcafee', 'trend', '趋势'
  ];

  const monitorKeywords = [
    '监控', 'monitor', 'agent', 'edr', 'endpoint', '探针', 'agent',
    '日志', '审计', 'audit', '监控'
  ];

  const cloudKeywords = [
    '云', 'cloud', '阿里', '腾讯', 'aws', 'azure', '华为云',
    '青云', 'ucloud', '滴滴云'
  ];

  const managementKeywords = [
    '管理', 'manager', '控制', 'admin', '管理中心', '控制台',
    'console', 'platform'
  ];

  // 检查关键词
  if (antivirusKeywords.some(keyword => name.includes(keyword))) {
    return 'antivirus';
  }

  if (monitorKeywords.some(keyword => name.includes(keyword))) {
    return 'monitor';
  }

  if (cloudKeywords.some(keyword => name.includes(keyword))) {
    return 'cloud';
  }

  if (managementKeywords.some(keyword => name.includes(keyword))) {
    return 'management';
  }

  return 'unknown';
};

// 初始化映射表
const initSoftwareMap = () => {
  for (const [softwareName, softwareInfo] of Object.entries(antivirusData)) {
    const category = classifySoftware(softwareName, softwareInfo.processes);

    // 为每个进程名创建映射
    softwareInfo.processes.forEach(processName => {
      const normalizedName = processName.toLowerCase();
      if (!processToSoftwareMap.has(normalizedName)) {
        processToSoftwareMap.set(normalizedName, {
          name: softwareName,
          category,
          url: softwareInfo.url,
          processes: softwareInfo.processes
        });
      }
    });
  }
};

// 初始化映射表
initSoftwareMap();

// 根据进程名识别软件
const identifySoftware = (processName: string) => {
  const normalizedName = processName.toLowerCase();
  return processToSoftwareMap.get(normalizedName);
};

// 获取软件标签类型
const getSoftwareTagType = (category: string) => {
  const typeMap: Record<string, 'danger' | 'warning' | 'success' | 'info' | ''> = {
    antivirus: 'danger',
    monitor: 'warning',
    cloud: 'success',
    management: 'info',
    unknown: ''
  };
  return typeMap[category] || '';
};

// 获取分类标签
const getCategoryLabel = (category: string) => {
  const labelMap: Record<string, string> = {
    antivirus: '杀毒软件',
    monitor: '监控软件',
    cloud: '云安全',
    management: '管理软件',
    unknown: '其他'
  };
  return labelMap[category] || '其他';
};

// 表格列配置 - 增加 SecuritySoftware 列
const PID_tableColumn: Table.Column[] = [
  {
    prop: 'PID',
    label: 'PID',
    showOverflowTooltip: true,
    width: '100px',
    align: 'center',
    Color: 'black'
  },
  {
    prop: 'PPID',
    label: 'PPID',
    sortable: true,
    showOverflowTooltip: true,
    width: '100px',
    align: 'center',
    Color: 'black'
  },
  {
    prop: 'Name',
    label: '进程名',
    sortable: true,
    showOverflowTooltip: true,
    width: '250px',
    Color: 'black'
  },
  {
    prop: 'SecuritySoftware',
    label: '安全软件',
    sortable: true,
    showOverflowTooltip: true,
    width: '200px',
    slot: 'SecuritySoftware',
    Color: 'black'
  },
  {
    prop: 'Arch',
    label: '架构',
    sortable: true,
    showOverflowTooltip: true,
    width: '80px',
    align: 'center',
    Color: 'black'
  },
  {
    prop: 'User',
    label: '用户',
    sortable: true,
    showOverflowTooltip: true,
    width: '240px',
    Color: 'black'
  },
  {
    label: '操作',
    buttons: [],
    slot: 'action',
    width: '160px',
    // fixed: 'right',
    align: 'center',
    Color: 'black'
  }
];

interface TableDataType {
  PID: string;
  PPID: string;
  Name: string;
  Arch: string;
  User: string;
  softwareInfo?: {
    name: string;
    category: string;
    url: string;
    processes: string[];
  };
}

const tableData = ref<TableDataType[]>([]);

// 过滤后的数据
const filteredTableData = computed(() => {
  let filtered = tableData.value;

  // 按类型过滤
  if (filterType.value !== 'all') {
    if (filterType.value === 'security') {
      // 安全软件：包含杀毒、监控、云安全、管理
      filtered = filtered.filter(item =>
          item.softwareInfo && ['antivirus', 'monitor', 'cloud', 'management'].includes(item.softwareInfo.category)
      );
    } else if (filterType.value === 'normal') {
      // 普通进程：没有识别到软件或未知类型
      filtered = filtered.filter(item =>
          !item.softwareInfo || item.softwareInfo.category === 'unknown'
      );
    } else {
      // 其他具体类型
      filtered = filtered.filter(item =>
          item.softwareInfo?.category === filterType.value
      );
    }
  }

  // 只显示安全软件
  if (showOnlySecuritySoftware.value) {
    filtered = filtered.filter(item =>
        item.softwareInfo && ['antivirus', 'monitor', 'cloud', 'management'].includes(item.softwareInfo.category)
    );
  }

  return filtered;
});

// 表格配置
const state = reactive({
  options: {
    showPagination: false,
    stripe: true,
    highlightCurrentRow: true,
    border: true,
    rowClassName: (row: any) => {
      if (row.softwareInfo) {
        return `${row.softwareInfo.category}-row`;
      }
      return '';
    }
  }
});

const { options } = state;

const uid = route.query.uid as string;

// 处理数据，识别软件
const processData = (data: any[]): TableDataType[] => {
  return data.map(item => {
    const softwareInfo = identifySoftware(item.Name);
    return {
      ...item,
      softwareInfo
    };
  });
};

// 计算统计信息
const calculateStats = (data: TableDataType[]) => {
  const stats = {
    total: data.length,
    antivirus: 0,
    monitor: 0,
    cloud: 0,
    management: 0,
    unknown: 0,
    security: 0,
    normal: 0
  };

  data.forEach(item => {
    if (item.softwareInfo) {
      switch (item.softwareInfo.category) {
        case 'antivirus':
          stats.antivirus++;
          stats.security++;
          break;
        case 'monitor':
          stats.monitor++;
          stats.security++;
          break;
        case 'cloud':
          stats.cloud++;
          stats.security++;
          break;
        case 'management':
          stats.management++;
          stats.security++;
          break;
        case 'unknown':
          stats.unknown++;
          stats.normal++;
          break;
      }
    } else {
      stats.normal++;
    }
  });

  softwareStats.value = stats;
};

// 加载进程列表
const loadProcessList = async () => {
  if (!uid) return;

  loading.value = true;
  try {
    const res = await ClientAPI.get_pid_list({ uid });
    tableData.value = processData(res.data.data);
    calculateStats(tableData.value);
  } catch (error) {
    console.error('加载进程列表失败:', error);
    ElMessage.error('加载进程列表失败');
  } finally {
    loading.value = false;
  }
};

// 导出进程列表
const exportProcessList = async () => {
  exporting.value = true;
  try {
    // 构建导出数据
    const exportData = tableData.value.map(item => ({
      PID: item.PID,
      PPID: item.PPID,
      进程名: item.Name,
      安全软件: item.softwareInfo?.name || '-',
      软件类型: item.softwareInfo ? getCategoryLabel(item.softwareInfo.category) : '-',
      架构: item.Arch,
      用户: item.User
    }));

    // 转换为 CSV
    const headers = ['PID', 'PPID', '进程名', '安全软件', '软件类型', '架构', '用户'];
    const csvContent = [
      headers.join(','),
      ...exportData.map(item => [
        item.PID,
        item.PPID,
        `"${item.进程名}"`,
        `"${item.安全软件}"`,
        `"${item.软件类型}"`,
        `"${item.架构}"`,
        `"${item.用户}"`
      ].join(','))
    ].join('\n');

    // 创建下载链接
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `进程列表_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    ElMessage.success('导出成功');
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败');
  } finally {
    exporting.value = false;
  }
};

// 杀毒软件警告
const showAntivirusWarning = (row: any) => {
  selectedProcess.value = row;
  warningMessage.value = `检测到杀毒软件 "${row.softwareInfo.name}" 的进程 "${row.Name}" (PID: ${row.PID})。终止此类进程可能导致系统安全风险。`;
  warningDialogVisible.value = true;
};

// 强制终止进程
const handleForceKill = async () => {
  if (!selectedProcess.value) return;

  warningDialogVisible.value = false;

  try {
    await ClientAPI.kill_pid({ uid, pid: selectedProcess.value.PID });
    ElMessage.success('进程已强制终止');
    await loadProcessList();
  } catch (error) {
    console.error('终止进程失败:', error);
    ElMessage.error('终止进程失败');
  }
};

// 终止进程
const handleKill = (row: any) => {
  // 如果是杀毒软件，显示警告
  if (row.softwareInfo?.category === 'antivirus') {
    showAntivirusWarning(row);
    return;
  }

  ElMessageBox.confirm(
      `是否终止进程 "${row.Name}" (PID: ${row.PID})？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        beforeClose: async (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true;
            try {
              await ClientAPI.kill_pid({ uid, pid: row.PID });
              ElMessage.success('进程已终止');
              await loadProcessList();
              done();
            } catch (error) {
              console.error('终止进程失败:', error);
              ElMessage.error('终止进程失败');
              instance.confirmButtonLoading = false;
            }
          } else {
            done();
          }
        }
      }
  );
};

// 监听路由变化
watch(
    () => route.query,
    async (val: any) => {
      if (uid) {
        await loadProcessList();
      }
    },
    { immediate: true }
);

// 监听过滤条件变化
watch([filterType, showOnlySecuritySoftware], () => {
  // 过滤条件变化时，重新计算统计信息
  calculateStats(tableData.value);
});
</script>

<style scoped>
/* 统计卡片 */
.stats-card {
  margin-bottom: 20px;
}

.stats-content {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-radius: 8px;
  min-width: 140px;
}

.stats-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.stats-text {
  display: flex;
  flex-direction: column;
}

.stats-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.stats-value {
  font-size: 24px;
  font-weight: bold;
}

/* 统计项颜色 */
.total .stats-icon {
  background: linear-gradient(135deg, #409EFF, #66b1ff);
}

.antivirus .stats-icon {
  background: linear-gradient(135deg, #F56C6C, #f78989);
}

.monitor .stats-icon {
  background: linear-gradient(135deg, #E6A23C, #ebb563);
}

.cloud .stats-icon {
  background: linear-gradient(135deg, #67C23A, #85ce61);
}

.management .stats-icon {
  background: linear-gradient(135deg, #909399, #a6a9ad);
}

.unknown .stats-icon {
  background: linear-gradient(135deg, #DCDFE6, #e4e7ed);
}

/* 过滤选项 */
.filter-options {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.filter-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 进程名单元格 */
.process-name-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.process-name-main {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.process-name {
  font-weight: 500;
}

.software-tag {
  cursor: pointer;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.process-extra {
  margin-top: 4px;
}

/* 安全软件单元格 */
.security-software-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.software-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.software-name {
  font-weight: 500;
  color: #409EFF;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-tag {
  flex-shrink: 0;
}

.software-meta {
  font-size: 12px;
}

.software-link {
  color: #909399;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.software-link:hover {
  color: #409EFF;
  text-decoration: underline;
}

.no-software {
  color: #C0C4CC;
  font-style: italic;
}

.no-software-text {
  color: #C0C4CC;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 8px;
}

/* 警告对话框 */
.warning-dialog-content {
  padding: 20px 0;
}

.warning-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

<style>
/* 全局表格行样式 */
.el-table .antivirus-row {
  background-color: #fef0f0 !important;
}

.el-table .antivirus-row:hover > td {
  background-color: #fde2e2 !important;
}

.el-table .monitor-row {
  background-color: #fdf6ec !important;
}

.el-table .monitor-row:hover > td {
  background-color: #faecd8 !important;
}

.el-table .cloud-row {
  background-color: #f0f9eb !important;
}

.el-table .cloud-row:hover > td {
  background-color: #e1f3d8 !important;
}

.el-table .management-row {
  background-color: #f4f4f5 !important;
}

.el-table .management-row:hover > td {
  background-color: #e9e9eb !important;
}

.el-table .unknown-row {
  background-color: #fafafa !important;
}

.el-table .unknown-row:hover > td {
  background-color: #f0f0f0 !important;
}

/* 工具提示样式 */
.software-tooltip {
  max-width: 320px;
  padding: 12px 0;
}

.tooltip-title {
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 14px;
  color: #303133;
}

.tooltip-category {
  margin-bottom: 12px;
}

.tooltip-subtitle {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.process-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.more-processes {
  font-size: 11px;
  color: #C0C4CC;
  margin-top: 2px;
}

.tooltip-url {
  font-size: 12px;
  color: #409EFF;
  word-break: break-all;
}

.tooltip-url a {
  color: #409EFF;
  text-decoration: none;
}

.tooltip-url a:hover {
  text-decoration: underline;
}

/* 调整标签样式 */
.el-tag--danger {
  border-color: #f56c6c;
  background-color: #fef0f0;
  color: #f56c6c;
}

.el-tag--warning {
  border-color: #e6a23c;
  background-color: #fdf6ec;
  color: #e6a23c;
}

.el-tag--success {
  border-color: #67c23a;
  background-color: #f0f9eb;
  color: #67c23a;
}

.el-tag--info {
  border-color: #909399;
  background-color: #f4f4f5;
  color: #909399;
}
</style>