<template>

  <el-table style="width: 100%" :data="DownloadsTableData">
    <el-table-column prop="fileName" label="文件名" sortable>
      <template #default="{ row }">
        <span>{{ row.fileName }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="filePath" label="文件路径" sortable>
      <template #default="{ row }">
        <span>{{ row.filePath }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="fileSize" label="文件大小" sortable>
      <template #default="{ row }">
        <span>{{ row.fileSize }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="downloadPart" label="下载进度" sortable>
      <template #default="{ row }">
        <el-progress :percentage="row.downloadPart" :show-text="true"></el-progress>
      </template>
    </el-table-column>
    <el-table-column prop="option" label="操作">
      <template #default="{ row }">
        <el-button @click="handleDownload(row)" type="primary" size="small">下载</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>


<script setup lang="ts">
import {onMounted, onUnmounted, ref} from 'vue';
import {useRoute} from "vue-router";
import ClientAPI from "@/api/clients";
import {ElMessage,ElMessageBox} from "element-plus"

const route = useRoute();
const DownloadsTableData = ref([]);
const uid = route.query.uid;

const handleDownload = (row :any) =>{
  ElMessageBox.confirm(`是否下载文件：${row.fileName}?`, '下载确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
      .then(async () => {
        ElMessage.warning("后台下载中...")
        try {
          const res = await ClientAPI.download_downloaded_file({uid:uid,filePath:row.filePath});
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

//           let fileName = row.fileName
//
//           // 将响应数据转换为 Blob
//           const blob = new Blob([res.data], { type: res.headers['content-type'] });
//
// // 将 Blob 转换为 ArrayBuffer
//           const arrayBuffer = await blob.arrayBuffer();
//
// // 将 ArrayBuffer 转换为 Uint8Array
//           const uint8Array = new Uint8Array(arrayBuffer);
//
// // 将 Uint8Array 转换为普通的 number[]
//           const numberArray = Array.from(uint8Array);
//
// // 调用后端保存文件
//           try {
//             const filePath = await SaveFile(numberArray, fileName);
//             ElMessage.success(`文件成功保存到 ${filePath}`);
//           } catch (error) {
//             console.error('文件保存失败:', error);
//             ElMessage.error(`下载 ${fileName} 失败`);
//           }

        } catch (error) {
          ElMessage.error('下载'+row.filePath+'失败');
        }
      })
      .catch(() => {
        // 取消下载操作
        ElMessage.info('已取消下载');
      });
};
const fetchDownloadsInfo = async () =>{
  const res = await ClientAPI.get_downloads_info({uid:uid});
  if (res.data.status === 200){
    DownloadsTableData.value = res.data.data;
  }
}
onMounted(
    () => {
      fetchDownloadsInfo();
  // 设置一个定时器，每5秒执行一次
  const intervalId = setInterval(fetchDownloadsInfo, 2000);

  // 确保在组件卸载时清除定时器
  onUnmounted(() => {
    clearInterval(intervalId);
  });
}
)
</script>



<style scoped>

</style>