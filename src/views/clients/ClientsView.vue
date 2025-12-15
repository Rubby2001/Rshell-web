<template>
  <div class="client-management">
    <!-- 更多操作对话框 -->
    <el-dialog
        v-model="dialogVisible"
        title="客户端操作"
        width="380px"
        class="action-dialog"
        :close-on-click-modal="false"
    >
      <div class="action-buttons">
        <el-button
            type="primary"
            @click="handleAddNote(uid)"
            class="action-button"
        >
          <el-icon><Document /></el-icon>
          添加备注
        </el-button>
        <el-button
            type="success"
            @click="handleMarkColor(uid)"
            class="action-button"
        >
          <el-icon><Brush /></el-icon>
          标记颜色
        </el-button>
        <el-button
            type="warning"
            @click="handleEditSleep(uid)"
            class="action-button"
        >
          <el-icon><Timer /></el-icon>
          设置休眠
        </el-button>
        <el-button
            type="danger"
            @click="handleExit(uid)"
            class="action-button"
        >
          <el-icon><SwitchButton /></el-icon>
          退出客户端
        </el-button>
      </div>
    </el-dialog>

    <!-- 颜色选择对话框 -->
    <el-dialog
        v-model="colorDialogVisible"
        title="选择标记颜色"
        width="420px"
        @close="handleClose"
        :close-on-click-modal="false"
        class="color-dialog"
    >
      <div class="color-picker-container">
        <p class="color-picker-hint">请选择标记颜色：</p>
        <div class="color-options">
          <div
              v-for="(color, index) in colors"
              :key="index"
              class="color-option"
              :class="{ 'color-option-selected': selectedColor === color }"
              @click="selectedColor = color"
          >
            <div
                class="color-circle"
                :style="{ backgroundColor: color }"
            ></div>
            <span class="color-hex">{{ color }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelSelection" class="footer-button">取消</el-button>
          <el-button
              type="primary"
              @click="confirmSelection"
              :disabled="!selectedColor"
              class="footer-button"
          >
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 主表格区域 -->
    <div class="table-container">
      <el-card shadow="never" class="table-card">
        <template #header>
          <div class="table-header">
            <h3 class="table-title">客户端管理</h3>
            <div class="table-header-actions">
              <el-tag type="info" class="refresh-tag">
                自动刷新: 2秒
              </el-tag>
              <el-button
                  type="success"
                  @click="ReloadClick"
                  size="small"
              >
                <el-icon><Refresh /></el-icon>
                手动刷新
              </el-button>
            </div>
          </div>
        </template>

        <TablesView
            :columns="Clients_tableColumn"
            :table-data="tableData"
            :options="options"
            @pagination-change="handlePaginationChange"
            class="custom-table"
        >
          <!-- 自定义列渲染 -->
          <template #FirstStart="{ row }">
            <div class="first-start-cell">
              <div
                  class="color-indicator"
                  :style="{ backgroundColor: row.Color }"
                  v-if="row.Color"
              ></div>
              <span class="timestamp">{{ formatFirstStart(row.FirstStart) }}</span>
            </div>
          </template>

          <template #ExternalIP="{ row }">
            <div class="ip-cell">
              <el-icon class="ip-icon"><Position /></el-icon>
              <span class="ip-text">{{ row.ExternalIP }}</span>
            </div>
          </template>

          <template #Username="{ row }">
            <div class="user-cell">
              <el-avatar :size="24" class="user-avatar">
                {{ getInitials(row.Username) }}
              </el-avatar>
              <span class="username">{{ row.Username }}</span>
            </div>
          </template>

          <template #Computer="{ row }">
            <div class="computer-cell">
              <el-icon class="computer-icon"><Monitor /></el-icon>
              <span class="computer-name">{{ row.Computer }}</span>
            </div>
          </template>

          <template #Address="{ row }">
            <div class="address-cell">
              <el-tag size="small" type="info" class="address-tag">
                {{ row.Address }}
              </el-tag>
            </div>
          </template>

          <template #Arch="{ row }">
            <el-tag
                :type="row.Arch === 'x64' ? 'success' : 'warning'"
                size="small"
                class="arch-tag"
            >
              {{ row.Arch }}
            </el-tag>
          </template>

          <template #Note="{ row }">
            <div class="note-cell">
              <el-tooltip
                  :content="row.Note || '暂无备注'"
                  placement="top"
                  v-if="row.Note"
              >
                <span class="note-text">{{ truncateNote(row.Note) }}</span>
              </el-tooltip>
              <span v-else class="note-empty">-</span>
            </div>
          </template>

          <template #Sleep="{ row }">
            <div class="sleep-cell">
              <el-icon class="sleep-icon"><Clock /></el-icon>
              <span class="sleep-value">{{ row.Sleep }}s</span>
            </div>
          </template>

          <template #onlineStatus="{ row }">
            <div class="status-cell">
              <div
                  class="status-dot"
                  :class="row.Online === '1' ? 'status-online' : 'status-offline'"
              ></div>
              <el-tag
                  :type="row.Online === '1' ? 'success' : 'danger'"
                  size="small"
                  class="status-tag"
              >
                {{ row.Online === '1' ? '在线' : '离线' }}
              </el-tag>
            </div>
          </template>

          <template #action="{ row }">
            <div class="action-cell">
              <el-button
                  type="primary"
                  @click="handleViewClick(row)"
                  size="small"
                  class="action-btn"
              >
                <el-icon><View /></el-icon>
                查看
              </el-button>
              <el-button
                  type="info"
                  @click="handleMoreOptions(row)"
                  size="small"
                  class="action-btn"
              >
                <el-icon><More /></el-icon>
                更多
              </el-button>
            </div>
          </template>
        </TablesView>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Document,
  Brush,
  Timer,
  SwitchButton,
  Refresh,
  Position,
  Monitor,
  Clock,
  View,
  More
} from '@element-plus/icons-vue'
import TablesView from "@/components/Common/Tables/TablesView.vue";
import { inject, onMounted, onUnmounted, reactive, ref, toRefs, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
const route = useRoute()
const router = useRouter()
const input_search = ref()
const dialogVisible = ref(false);
const colorDialogVisible = ref(false);
const selectedColor = ref('')
const colors = [
  '#f31616', // 红色
  '#09e609', // 绿色
  '#0b0be6', // 蓝色
  '#e8e807', // 黄色
  '#e10fe1', // 紫色
  '#12dada'  // 青色
];
let uid: string = '';

// 工具函数
const formatFirstStart = (timestamp: string) => {
  if (!timestamp) return '-';
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return timestamp;
  }
};

const getInitials = (username: string) => {
  if (!username) return '?';
  return username.charAt(0).toUpperCase();
};

const truncateNote = (note: string, maxLength: number = 15) => {
  if (!note) return '';
  return note.length > maxLength ? note.substring(0, maxLength) + '...' : note;
};

const handleClose = () => {
  selectedColor.value = '';
};

const cancelSelection = () => {
  selectedColor.value = '';
  colorDialogVisible.value = false;
};

const confirmSelection = async () => {
  if (selectedColor.value) {
    const res = await ClientAPI.select_color({ uid: uid, color: selectedColor.value })
    if (res.data.status === 200) {
      ElMessage.success("标记颜色成功")
    }
  }
  colorDialogVisible.value = false;
  dialogVisible.value = false;
};

interface TableDataType {
  Uid: string
  FirstStart: string
  ExternalIP: string
  InternalIP: string
  Listener: string
  Username: string
  Computer: string
  Process: string
  Pid: string
  Address: string
  Arch: string
  Note: string
  Sleep: string
  Online:string
  Color: string
}
const tableData = ref<TableDataType[]>([])
const params = {
  page: Number(route.query.page) || 1,
  pageSize: Number(route.query.pageSize) || 10,
}
import ClientAPI from '@/api/clients'
// import {ReadLastLine} from "../../../wailsjs/go/main/App";
const get_clients_list = (page: number = 1, pageSize: number = 10) => {
  /**
   * 获取任务列表数据
   */
  return ClientAPI.get_clients_list({ page: page, page_size: pageSize })
}
watch(
    () => route.query,
    async (val: any) => {
      // const value = await ReadLastLine()
      // axiosConfig.updateBaseURL(value);
      const { page, pageSize } = val
      params.page = Number(page) || params.page
      params.pageSize = Number(pageSize) || params.pageSize
      console.log('send requests', params.page, params.pageSize)
      get_clients_list(params.page, params.pageSize).then((res) => {
        tableData.value = res.data.data.list
        state.options.paginationConfig = {
          total: res.data.data.total,
          currentPage: params.page,
          pageSize: params.pageSize,
          pageSizes: [10, 50, 100, 1000],
          layout: 'total,prev, pager, next,sizes'
        }
      })
    },
    { immediate: true }
)
function getList(){
  get_clients_list(params.page, params.pageSize).then((res) => {
    tableData.value = res.data.data.list
    state.options.paginationConfig = {
      total: res.data.data.total,
      currentPage: params.page,
      pageSize: params.pageSize,
      pageSizes: [10, 50, 100, 1000],
      layout: 'total,prev, pager, next,sizes'
    }
  })
}
onMounted(async() => {
  // const value = await ReadLastLine()
  // axiosConfig.updateBaseURL(value);

  // 设置一个定时器，每5秒执行一次
  const intervalId = setInterval(getList, 2000);

  // 确保在组件卸载时清除定时器
  onUnmounted(() => {
    clearInterval(intervalId);
  });
});

const Clients_tableColumn :Table.Column[]= [
  // {prop: 'uid', label: 'uid', showOverflowTooltip: true},
  {prop: 'FirstStart', label: 'FirstStart', showOverflowTooltip: true, Color: 'Color',width:"130"},
  {prop: 'ExternalIP', label: '外网IP', showOverflowTooltip: true, Color: 'Color',width:"130"},
  // {prop: 'InternalIP', label: '内网IP', showOverflowTooltip: true, Color: 'Color'},
  {prop: 'Username', label: 'User', showOverflowTooltip: true,width:"170", Color: 'Color'},
  {prop: 'Computer', label: 'Computer', showOverflowTooltip: true,width:"170", Color: 'Color'},
  {prop: 'Process', label: 'Process', showOverflowTooltip: true, Color: 'Color'},
  {prop: 'Pid', label: 'Pid', showOverflowTooltip: true, Color: 'Color'},
  {prop: 'Address', label: 'Address', showOverflowTooltip: true, Color: 'Color',width:"200"},
  {prop: 'Arch', label: 'Arch', showOverflowTooltip: true,width:"60", Color: 'Color'},
  {prop: 'Note', label: 'Note',  showOverflowTooltip: true, Color: 'Color',width:"120"},
  {prop: 'Sleep', label: 'Sleep',  showOverflowTooltip: true,width:"65", Color: 'Color'},
  {
    label: 'Online',
    slot: 'onlineStatus',  // 使用插槽方式
    width: "80",
    align: 'center',  // 居中显示
    Color: 'Color'
  },
  {
    // width: '200',
    label: '操作',
    buttons: [],
    slot: 'action', Color: 'Color'
  }
]
const handleMoreOptions = (val:any) =>{
  dialogVisible.value = true;
  uid = val.Uid;
}
const handleAddNote = async(uid :string) =>{
  const { value } = await ElMessageBox.prompt(
      '输入Note',
      'Note',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: 'Note',
      }
  )
  if (!value) {
    ElMessage.warning('Note不能为空')
    return
  }
  const res = await ClientAPI.add_uid_note({uid:uid,note:value})
  if (res.data.status === 200){
    ElMessage.success("Note成功")
  }
  dialogVisible.value = false

}
const handleEditSleep = async(uid :string) =>{
  const { value } = await ElMessageBox.prompt(
      'Sleep',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: 'Sleep',
      }
  )
  if (!value) {
    ElMessage.warning('Sleep不能为空')
    return
  }
  const res = await ClientAPI.edit_sleep({uid:uid,sleep:value})
  if (res.data.status === 200){
    ElMessage.success("修改Sleep成功")
  }
  dialogVisible.value = false

}
const handleMarkColor = async(uid :string) =>{
  colorDialogVisible.value = true;
}
const handleExit = (uid :string) =>{
  ElMessageBox.confirm(`是否退出客户端?`, '退出确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
      .then(async () => {
        const res = await ClientAPI.do_exit({uid:uid})
        if (res.data.status === 200){
          ElMessage.success("退出成功")
        }
        dialogVisible.value = false
      })
}
const handleViewClick = (val: any) => {
  router.push({
    path: '/client/shell',
    query: {
      uid: val.Uid,
      user: val.Username,
      ip: val.ExternalIP,
      computer: val.Computer,
      arch: val.Arch,
      note: val.Note,
      address: val.Address,
      status: val.Online,  // 改为 status 并格式化为字符串
    }
  })
}
interface State {
  options: Table.Options
}
const state = reactive<State>({
  options: { showPagination: true }
})
const { options } = toRefs(state)
// 局部刷新方法
const reload: any = inject('reload')
const ReloadClick = async () => {
  input_search.value = ''
  await router.push({
    path: route.path,
    query: {
      page: 1,
      pageSize: 10,
      search: ''
    }
  })
  reload()
}
const handlePaginationChange = async (
    page: number,
    pageSize: number,
) => {
  await router.push({
    path: route.path,
    query: {
      page,
      pageSize,
    }
  })
  reload()
}
</script>


<style scoped>
.client-management {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  min-height: calc(100vh - 40px);
}

.table-container {
  margin: 0 auto;
  max-width: 100%;
}

.table-card {
  border-radius: 12px;
  border: 1px solid #ebeef5;
  background: white;
}

.table-card :deep(.el-card__header) {
  border-bottom: 1px solid #ebeef5;
  padding: 16px 24px;
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

.table-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.refresh-tag {
  font-size: 12px;
  opacity: 0.8;
}

.custom-table :deep(.el-table) {
  font-size: 13px;
}

.custom-table :deep(.el-table th) {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #e9ecef;
}

.custom-table :deep(.el-table tr:hover) {
  background-color: #f8fafc;
}

.custom-table :deep(.el-table tr:hover td) {
  background-color: #f8fafc;
}

/* 单元格样式 */
.first-start-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.timestamp {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 12px;
  color: #666;
}

.ip-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ip-icon {
  color: #409eff;
  font-size: 14px;
}

.ip-text {
  font-family: 'Monaco', 'Consolas', monospace;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 10px;
  font-weight: bold;
}

.username {
  font-weight: 500;
}

.computer-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.computer-icon {
  color: #67c23a;
  font-size: 14px;
}

.address-tag {
  font-family: 'Monaco', 'Consolas', monospace;
  background: #f0f9ff;
  border-color: #cce5ff;
  color: #004085;
}

.note-cell {
  max-width: 120px;
}

.note-text {
  color: #e6a23c;
  font-weight: 500;
  cursor: help;
}

.note-empty {
  color: #c0c4cc;
  font-style: italic;
}

.sleep-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sleep-icon {
  color: #e6a23c;
  font-size: 14px;
}

.sleep-value {
  font-family: 'Monaco', 'Consolas', monospace;
  font-weight: 500;
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

.status-online {
  background: #67c23a;
  box-shadow: 0 0 0 2px rgba(103, 194, 58, 0.2);
}

.status-offline {
  background: #f56c6c;
  box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.2);
}

.arch-tag {
  font-family: 'Monaco', 'Consolas', monospace;
  font-weight: bold;
}

.action-cell {
  display: flex;
  gap: 6px;
}

.action-btn {
  padding: 4px 10px;
  border-radius: 4px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

/* 对话框样式 */
.action-dialog :deep(.el-dialog__header) {
  margin: 0;
  padding: 16px 20px;
  background: linear-gradient(90deg, #f8f9fa 0%, #fff 100%);
  border-bottom: 1px solid #ebeef5;
}

.action-dialog :deep(.el-dialog__title) {
  font-weight: 600;
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  padding: 8px 0;
}

.action-button {
  width: 100%;
  height: 44px;
  justify-content: flex-start;
  padding-left: 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 10px;
}

.action-button:hover {
  transform: translateX(4px);
}

.color-picker-container {
  padding: 8px 0;
}

.color-picker-hint {
  margin: 0 0 16px 0;
  color: #606266;
  font-size: 14px;
}

.color-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.color-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background: #f8f9fa;
}

.color-option:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.color-option-selected {
  border-color: #409eff;
  background: #f0f9ff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
}

.color-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.color-hex {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 12px;
  color: #495057;
  font-weight: 500;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 0 0 0;
  border-top: 1px solid #ebeef5;
}

.footer-button {
  min-width: 80px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .client-management {
    padding: 12px;
  }

  .color-options {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .table-header-actions {
    justify-content: space-between;
  }

  .action-cell {
    flex-direction: column;
    gap: 4px;
  }

  .action-btn {
    width: 100%;
  }

  .color-options {
    grid-template-columns: 1fr;
  }
}
</style>