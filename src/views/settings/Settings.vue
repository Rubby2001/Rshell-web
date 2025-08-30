<template>
  <div>
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="Name" label="设置项" width="200" />

      <!-- 可编辑值 -->
      <el-table-column label="值">
        <template #default="{ row }">
          <el-input v-model="row.Value" placeholder="请输入值" clearable/>
        </template>
      </el-table-column>

      <!-- 操作按钮 -->
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="saveSetting(row)">
            保存
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 全局保存按钮 -->
    <div style="margin-top: 20px; text-align: right;">
      <el-button type="success" @click="saveAll">保存全部</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import SettingsAPI from "@/api/settings";

const tableData = ref<{ Name: string; Value: string }[]>([]);

// 获取配置列表
const getSettingsList = async () => {
  const res = await SettingsAPI.getSettingsList();
  if (res.status === 200) {
    tableData.value = res.data.data; // 假设返回格式是 {data:[{Name:"xxx",Value:"xxx"}]}
  }
};

// 保存单个配置
const saveSetting = async (row: { Name: string; Value: string }) => {
  const res = await SettingsAPI.editSettings([row]); // 单个也要包在数组里
  if (res.status === 200) {
    ElMessage.success("保存成功");
  } else {
    ElMessage.error("保存失败");
  }
};

// 保存全部配置
const saveAll = async () => {
  const res = await SettingsAPI.editSettings(tableData.value);
  if (res.status === 200) {
    ElMessage.success("全部保存成功");
  } else {
    ElMessage.error("保存失败");
  }
};

onMounted(() => {
  getSettingsList();
});
</script>
