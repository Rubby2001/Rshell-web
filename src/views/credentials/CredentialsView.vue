<template>
  <div class="credentials-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>凭据管理</span>
          <el-button type="primary" size="small" @click="fetchData">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>
      <el-table :data="credentials" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="uid" label="客户端" width="180" />
        <el-table-column prop="target" label="目标" min-width="120" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="secret" label="密码/Hash" min-width="180">
          <template #default="{ row }">
            <el-tag type="danger" style="font-family: monospace">{{ row.secret }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="cred_type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.cred_type === 'password' ? 'warning' : row.cred_type === 'hash' ? 'danger' : 'info'" size="small">
              {{ row.cred_type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="来源" width="100" />
        <el-table-column prop="notes" label="备注" min-width="120" />
        <el-table-column prop="created_at" label="时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.created_at * 1000).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import CredentialsAPI from '@/api/credentials'

const credentials = ref<any[]>([])
const loading = ref(false)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await CredentialsAPI.list()
    if (res.data.status === 200) {
      credentials.value = res.data.data || []
    }
  } finally {
    loading.value = false
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认删除此凭据?', '提示')
    const res = await CredentialsAPI.delete(row.id)
    if (res.data.status === 200) {
      ElMessage.success('已删除')
      await fetchData()
    }
  } catch {
    // cancelled
  }
}

onMounted(fetchData)
</script>

<style scoped>
.credentials-container {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
