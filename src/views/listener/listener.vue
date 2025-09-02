<template>
  <div>
    <el-button size="large" type="primary" @click="addListenerDialogVisible = true">添加Listener</el-button>
    <br>
    <br>
    <el-table :data="tableData">
      <el-table-column prop="Type" label="类型"/>
      <el-table-column prop="ListenAddress" label="监听地址"/>
      <el-table-column prop="ConnectAddress" label="连接地址"/>
      <el-table-column label="状态" prop="Status">
        <template #default="{ row }">
          <el-tag :type="row.Status === 1 ? 'success' : 'danger'" size="default">
            {{ row.Status === 1 ? '开启' : '关闭' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" v-if="scope.row.Status === 2" type="success" @click="handleOpen(scope.row)">开启</el-button>
          <el-button size="small" v-if="scope.row.Status === 1" type="primary" @click="handleClose(scope.row)">关闭</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>


    <el-dialog v-model="addListenerDialogVisible" title="添加Listener" width="500px">
      <el-form :model="formData" label-width="120px">
        <!-- 协议选择 -->
        <el-form-item label="协议">
          <el-select v-model="formData.protocol" placeholder="请选择协议">
            <el-option label="Websocket" value="websocket"></el-option>
            <el-option label="TCP" value="tcp"></el-option>
            <el-option label="KCP" value="kcp"></el-option>
            <el-option label="HTTP" value="http"></el-option>
            <el-option label="OSS" value="oss"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item v-if="formData.protocol === 'oss'" label="EndPoint">
          <el-input v-model="ossData.endpoint" style="width: 300px;"/>
        </el-form-item>

        <!-- 监听地址 -->
        <el-form-item :label="formData.protocol === 'oss'?'AccessKeyId':'监听地址'">
          <el-input v-model="formData.listenAddress" :placeholder="formData.protocol === 'oss'?'':'0.0.0.0:8083'" style="width: 300px;"/>
        </el-form-item>

        <!-- 连接地址 -->
        <el-form-item :label="formData.protocol === 'oss'?'AccessKeySecret':'连接地址'">
          <el-input v-model="formData.connectAddress" :placeholder="formData.protocol === 'oss'?'':'外网连接地址（127.0.0.1:8083)'" style="width: 300px;"/>
        </el-form-item>

        <el-form-item v-if="formData.protocol === 'oss'" label="BucketName">
          <el-input v-model="ossData.bucketName" style="width: 300px;"/>
        </el-form-item>

        <!-- 确定按钮 -->
        <el-form-item>
          <el-button type="primary" @click="addListener">添加</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import {ref,onMounted} from "vue";
import ListenerAPI from '@/api/listener'
import {ElMessage} from "element-plus";

const tableData = ref([
]);

const formData = ref({
  protocol: 'websocket', // 默认选择TCP
  listenAddress: '',
  connectAddress: '',
});
const ossData = ref({
  endpoint:'oss-cn-hangzhou.aliyuncs.com',
  bucketName:'alisso'
})


const addListenerDialogVisible = ref(false);

const getListenerList = async()=>{
  const res = await ListenerAPI.getListenerList()
  if (res.status === 200){
    tableData.value = res.data.data
  }
}

const addListener = async()=>{
  if (formData.value.protocol ==="oss"){
    const res = await ListenerAPI.addListener({type:formData.value.protocol,listenAddress:ossData.value.endpoint+":"+formData.value.listenAddress+":"+formData.value.connectAddress+":"+ossData.value.bucketName,connectAddress:ossData.value.endpoint+":"+formData.value.listenAddress+":"+formData.value.connectAddress+":"+ossData.value.bucketName})
    if(res.status === 200){
      if(res.data.status === 200){
        ElMessage.success("添加成功")
        await getListenerList()
      }else{
        ElMessage.error(res.data.data)
      }

    }
    addListenerDialogVisible.value = false
  }else{
    const res = await ListenerAPI.addListener({type:formData.value.protocol,listenAddress:formData.value.listenAddress,connectAddress:formData.value.connectAddress})
    if(res.status === 200){
      if(res.data.status === 200){
        ElMessage.success("添加成功")
        await getListenerList()
      }else{
        ElMessage.error(res.data.data)
      }
    }
    addListenerDialogVisible.value = false
  }


}
const handleOpen = async(row :any)=>{
  const res = await ListenerAPI.openListener({listenAddress:row.ListenAddress})
  if(res.data.status===200){
    await getListenerList()
    ElMessage.success("开启监听成功")

  }else{
    await getListenerList()
    ElMessage.error(res.data.data)
  }
}

const handleClose = async(row :any) =>{
  const res = await ListenerAPI.closeListener({listenAddress:row.ListenAddress})
  if(res.data.status===200){
    await getListenerList()
    ElMessage.success("关闭监听成功")

  }else{
    await getListenerList()
    ElMessage.error(res.data.data)
  }
}

const handleDelete = async(row :any)=>{
  const res = await ListenerAPI.deleteListener({listenAddress:row.ListenAddress})
  if(res.data.status===200){
    await getListenerList()
    ElMessage.success("删除监听成功")

  }else{
    await getListenerList()
    ElMessage.error(res.data.data)
  }
}
onMounted(async()=>{
  await getListenerList()
})
</script>



<style scoped>

</style>