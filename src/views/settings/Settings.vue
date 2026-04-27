<template>
  <div class="settings-container">
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">系统设置</span>
        </div>
      </template>

      <!-- 背景图片设置 -->
      <div class="background-section">
        <h3 class="section-title">背景图片设置</h3>
        <div class="background-upload">
          <el-upload
            class="upload-demo"
            action="#"
            :show-file-list="false"
            :on-change="handleBackgroundChange"
            :auto-upload="false"
            accept="image/*"
          >
            <el-button type="primary">
              <el-icon><Upload /></el-icon>
              上传背景图片
            </el-button>
          </el-upload>
          <el-button v-if="backgroundImage" @click="clearBackground" class="clear-btn">
            <el-icon><Delete /></el-icon>
            清除背景
          </el-button>
        </div>
        <p class="background-tip">支持 JPG、PNG 格式，建议尺寸 1920x1080</p>
        <div v-if="backgroundImage" class="background-preview">
          <el-image
            :src="backgroundImage"
            fit="cover"
            style="width: 200px; height: 120px; border-radius: 8px;"
          />
        </div>
      </div>

      <el-divider />

      
      <el-divider />

      <!-- MCP 配置信息 -->
      <div class="mcp-section background-section" v-if="mcpEnabled" style="margin-bottom: 24px;">
        <h3 class="section-title">MCP 服务已启用</h3>
        <el-alert
          title="将以下配置填入您的 AI IDE (例如 Cursor、Windsurf、Chatbox) 以连接 Rshell 控制端"
          type="success"
          show-icon
          :closable="false"
          style="margin-bottom: 16px;"
        />
        
        <div style="background: rgba(0,0,0,0.05); padding: 16px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.1);">
            <div style="margin-bottom: 12px;">
              <div style="font-size: 14px; color: #333; font-weight: bold; margin-bottom: 4px;">SSE 接入地址 (Server URL):</div>
              <div style="background: #fff; border: 1px solid #dcdfe6; color: #333; font-family: monospace; padding: 8px 12px; border-radius: 4px; user-select: all;">{{ mcpSseUrl }}</div>
            </div>
            
            <div>
              <div style="font-size: 14px; color: #333; font-weight: bold; margin-bottom: 4px;">如客户端不支持自定义Header，你也可以在URL中追加 token 参数:</div>
              <div style="background: #fff; border: 1px solid #dcdfe6; color: #333; font-family: monospace; padding: 8px 12px; border-radius: 4px; user-select: all;">{{ mcpSseUrl }}?token={{ userToken }}</div>
            </div>
        </div>
      </div>

      <!-- 其他设置 -->
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="Name" label="设置项" width="200" />

        <!-- 可编辑值 -->
        <el-table-column label="值">
          <template #default="{ row }">
            <!-- 针对 mcp_enabled 用开关显示 -->
            <template v-if="row.Name === 'mcp_enabled'">
              <el-switch
                v-model="row.Value"
                active-value="true"
                inactive-value="false"
                active-text="启用"
                inactive-text="禁用"
              />
            </template>
            <!-- 其他设置项使用输入框 -->
            <template v-else>
              <el-input v-model="row.Value" placeholder="请输入值" clearable/>
            </template>
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
      <div class="save-all-btn">
        <el-button type="success" @click="saveAll">保存全部</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useUserStore } from "@/stores/user";
import { ElMessage } from "element-plus";
import SettingsAPI from "@/api/settings";
import { Upload, Delete } from '@element-plus/icons-vue';

const tableData = ref<{ Name: string; Value: string }[]>([]);

const userStore = useUserStore();
const userToken = computed(() => userStore.getToken());
const mcpSseUrl = computed(() => {
  const protocol = window.location.protocol;
  const host = window.location.host;
  return `${protocol}//${host}/api/mcp/sse`;
});

const mcpEnabled = computed(() => {
  const mcpItem = tableData.value.find(item => item.Name === 'mcp_enabled');
  return mcpItem ? mcpItem.Value === 'true' : false;
});

const backgroundImage = ref<string>('');

// 从 localStorage 获取背景图片
const getBackgroundImage = () => {
  const bg = localStorage.getItem('backgroundImage');
  if (bg) {
    backgroundImage.value = bg;
    applyBackground(bg);
  }
};

// 处理背景图片上传
const handleBackgroundChange = (file: any) => {
  const reader = new FileReader();
  reader.readAsDataURL(file.raw);
  reader.onload = (e: any) => {
    const base64 = e.target.result;
    backgroundImage.value = base64;
    localStorage.setItem('backgroundImage', base64);
    applyBackground(base64);
    ElMessage.success('背景图片设置成功');
  };
};

// 清除背景图片
const clearBackground = () => {
  backgroundImage.value = '';
  localStorage.removeItem('backgroundImage');
  document.body.classList.remove('has-background');
  document.body.style.background = 'var(--theme-gradient)';
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundPosition = 'center';
  document.body.style.backgroundRepeat = 'no-repeat';
  document.body.style.backgroundAttachment = 'fixed';
  ElMessage.success('背景图片已清除');
};

// 应用背景图片
const applyBackground = (bg: string) => {
  document.body.classList.add('has-background');
  // document.body.style.background = `url(${bg}) center center / cover no-repeat fixed`;
  document.body.style.setProperty(
      'background', 
      `url(${bg}) center center / cover no-repeat fixed`, 
      'important'
  );
};

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
  getBackgroundImage();
});
</script>

<style scoped>
.settings-container {
  padding: 24px;
  min-height: calc(100vh - 60px);
}

.settings-card {
  border-radius: 20px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 16px 0;
}

.card-title {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-dark) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.background-section {
  margin-bottom: 24px;
  padding: 20px;
  background: var(--theme-light);
  border-radius: 16px;
  border: 2px solid var(--theme-primary);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #5a4a5a;
  margin: 0 0 16px 0;
}

.background-upload {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.background-tip {
  font-size: 14px;
  color: #9a8a9a;
  margin: 8px 0;
}

.background-preview {
  margin-top: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  border: 2px solid;
  border-color: color-mix(in srgb, var(--theme-primary) 20%, transparent);
}

.clear-btn {
  margin-left: 12px;
}

.save-all-btn {
  margin-top: 20px;
  text-align: right;
}
</style>