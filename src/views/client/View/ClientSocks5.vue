<template>
  <div>
    <el-button type="primary" size="default" @click="dialogVisible = true">
      新增Socks5代理
    </el-button>
    <br>
    <br>
    <el-table :data="tableData">
      <el-table-column prop="Type" label="类型"/>
<!--      <el-table-column prop="ConnectAddress" label="回连地址"/>-->
      <el-table-column prop="Socks5port" label="Socks5端口"/>
      <el-table-column prop="UserName" label="用户名"/>
      <el-table-column prop="Password" label="密码"/>
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

    <el-dialog v-model="dialogVisible" title="新增Socks5代理" width="500px">
      <el-form :model="formData" label-width="120px">
      <!-- 监听地址 -->
<!--      <el-form-item label="外网回连地址">-->
<!--        <el-input v-model="formData.connectAddress" :placeholder="'外网回连地址（xxx.xxx.xxx.xxx:9999)'"/>-->
<!--      </el-form-item>-->

      <!-- 连接地址 -->
      <el-form-item :label="'Socks5端口'">
        <el-input v-model="formData.socks5port" :placeholder="'20000'"/>
      </el-form-item>

      <el-form-item :label="'用户名'">
        <el-input v-model="formData.username" :placeholder="''"/>
      </el-form-item>

      <el-form-item :label="'密码'">
        <el-input v-model="formData.password" :placeholder="''"/>
      </el-form-item>

      <!-- 确定按钮 -->
      <el-form-item>
        <el-button type="primary" @click="startScoks5">添加</el-button>
      </el-form-item>
      </el-form>
    </el-dialog>

  </div>



</template>

<script setup lang="ts">
import {onMounted, reactive, ref} from "vue";
import ClientAPI from "@/api/clients";
import {ElMessage} from "element-plus";
import {useRoute} from "vue-router";

const dialogVisible = ref(false);
const tableData = ref([]);
const formData = reactive({
  connectAddress:"",
  socks5port:"",
  username:"",
  password:""
});
const route = useRoute();
const uid = route.query.uid
const getSocks5List = async()=>{
  const res = await ClientAPI.getSocks5List({uid:uid})
  if (res.status === 200){
    tableData.value = res.data.data
  }
}
const startScoks5 = async()=>{
  const res = await ClientAPI.startSocks5({Password: formData.password, Socks5port: formData.socks5port, UserName: formData.username, uid:uid})
  if(res.status === 200){
    if(res.data.status === 200) {
      ElMessage.success("添加成功")
      await getSocks5List()
    }else{
      await getSocks5List();
      ElMessage.error(res.data.data)
    }

  }
  dialogVisible.value = false

}
const handleClose = async(row :any)=>{
  const res = await ClientAPI.CloseSocks5({Password: row.Password, Socks5port: row.Socks5port, UserName: row.UserName, uid:uid})
  if (res.status ===200){
    if(res.data.status === 200){
      ElMessage.success("关闭成功")
      await getSocks5List();
    }else{
      await getSocks5List();
      ElMessage.error(res.data.data)
    }
  }
}
const handleOpen = async(row :any)=>{
  const res = await ClientAPI.OpenSocks5({Password: row.Password, Socks5port: row.Socks5port, UserName: row.UserName, uid:uid})
  if (res.status ===200){
    if(res.data.status === 200){
      ElMessage.success("开启成功")
      await getSocks5List();
    }else{
      await getSocks5List();
      ElMessage.error(res.data.data)
    }
  }
}
const handleDelete = async(row :any)=>{
  const res = await ClientAPI.DeleteSocks5({Password: row.Password, Socks5port: row.Socks5port, UserName: row.UserName, uid:uid})
  if (res.status ===200){
    if(res.data.status === 200){
      ElMessage.success("删除成功")
      await getSocks5List();
    }else{
      await getSocks5List();
      ElMessage.error(res.data.data)
    }
  }
}

onMounted(async()=>{
  await getSocks5List()
})
</script>


<style scoped>

</style>