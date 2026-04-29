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

      <!-- 通知设置 -->
      <div class="background-section">
        <h3 class="section-title">上线提醒配置</h3>
        <el-tabs v-model="activeNotificationTab">
          <el-tab-pane label="企业微信" name="wecom">
            <el-form label-width="120px" :model="notifications.wecom">
              <el-form-item label="启用提醒">
                <el-switch v-model="notifications.wecom.enabled" />
              </el-form-item>
              <el-form-item label="Webhook KEY">
                <el-input v-model="notifications.wecom.url" placeholder="请输入 Webhook KEY" clearable />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="钉钉" name="dingtalk">
            <el-form label-width="120px" :model="notifications.dingtalk">
              <el-form-item label="启用提醒">
                <el-switch v-model="notifications.dingtalk.enabled" />
              </el-form-item>
              <el-form-item label="Webhook URL">
                <el-input v-model="notifications.dingtalk.webhook" placeholder="请输入 Webhook URL" clearable />
              </el-form-item>
              <el-form-item label="加签 Secret">
                <el-input v-model="notifications.dingtalk.secret" placeholder="请输入加签 Secret（可选）" clearable />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="Telegram" name="telegram">
            <el-form label-width="120px" :model="notifications.telegram">
              <el-form-item label="启用提醒">
                <el-switch v-model="notifications.telegram.enabled" />
              </el-form-item>
              <el-form-item label="Bot Token">
                <el-input v-model="notifications.telegram.token" placeholder="Bot Token" clearable />
              </el-form-item>
              <el-form-item label="Chat ID">
                <el-input v-model="notifications.telegram.chat_id" placeholder="Chat ID" clearable />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="Email" name="email">
            <el-form label-width="120px" :model="notifications.email">
              <el-form-item label="启用提醒">
                <el-switch v-model="notifications.email.enabled" />
              </el-form-item>
              <el-form-item label="SMTP 服务器">
                <el-input v-model="notifications.email.host" placeholder="例如 smtp.qq.com" clearable />
              </el-form-item>
              <el-form-item label="SMTP 端口">
                <el-input-number v-model="notifications.email.port" :min="1" :max="65535" />
              </el-form-item>
              <el-form-item label="用户名">
                <el-input v-model="notifications.email.username" placeholder="邮箱账号" clearable />
              </el-form-item>
              <el-form-item label="密码 / 授权码">
                <el-input v-model="notifications.email.password" type="password" placeholder="邮箱密码" show-password />
              </el-form-item>
              <el-form-item label="接收邮箱">
                <el-input v-model="notifications.email.to" placeholder="接收提醒的邮箱地址" clearable />
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>

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
      <el-table :data="filteredTableData" style="width: 100%">
        <el-table-column prop="Name" label="设置项" width="200" />

        <!-- 可编辑值 -->
        <el-table-column label="值">
          <template #default="{ row }">
            <template v-if="row.Name === 'mcp_enabled'">
              <el-switch
                v-model="row.Value"
                active-value="true"
                inactive-value="false"
                active-text="启用"
                inactive-text="禁用"
              />
            </template>
            <template v-else>
              <el-input v-model="row.Value" placeholder="请输入值" clearable/>
            </template>
          </template>
        </el-table-column>

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
import { ref, onMounted, computed, reactive } from "vue";
import { useUserStore } from "@/stores/user";
import { ElMessage } from "element-plus";
import SettingsAPI from "@/api/settings";
import { Upload, Delete } from '@element-plus/icons-vue';

const tableData = ref<{ Name: string; Value: string }[]>([]);
const filteredTableData = computed(() => {
  const hides = ["wecom", "dingtalk", "telegram", "email"];
  return tableData.value.filter(item => !hides.includes(item.Name));
});

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

const activeNotificationTab = ref('wecom');

const notifications = reactive<any>({
  wecom: { enabled: false, url: '' },
  dingtalk: { enabled: false, webhook: '', secret: '' },
  telegram: { enabled: false, token: '', chat_id: '' },
  email: { enabled: false, host: '', port: 465, username: '', password: '', to: '' }
});

const getBackgroundImage = () => {
  const bg = localStorage.getItem('backgroundImage');
  if (bg) {
    backgroundImage.value = bg;
    applyBackground(bg);
  }
};

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

const applyBackground = (bg: string) => {
  document.body.classList.add('has-background');
  document.body.style.setProperty(
      'background', 
      `url(${bg}) center center / cover no-repeat fixed`, 
      'important'
  );
};

const getSettingsList = async () => {
  const res = await SettingsAPI.getSettingsList();
  if (res.status === 200) {
    tableData.value = res.data.data;
    
    // Parse notifications
    tableData.value.forEach(item => {
      if (notifications[item.Name] !== undefined) {
        try {
          if (item.Name === 'wecom' && (!item.Value.startsWith('{') && item.Value !== '')) {
             notifications.wecom.url = item.Value;
             notifications.wecom.enabled = true;
          } else if (item.Value) {
             const parsed = JSON.parse(item.Value);
             Object.assign(notifications[item.Name], parsed);
          }
        } catch(e) {
          console.warn("Parse setting config failed", item.Name);
        }
      }
    });
  }
};

const saveSetting = async (row: { Name: string; Value: string }) => {
  const res = await SettingsAPI.editSettings([row]); 
  if (res.status === 200) {
    ElMessage.success("保存成功");
  } else {
    ElMessage.error("保存失败");
  }
};

const saveAll = async () => {
  const toSave = [...tableData.value];
  
  // Update notifications into the saving list
  ["wecom", "dingtalk", "telegram", "email"].forEach(name => {
    const existing = toSave.find(t => t.Name === name);
    const jsonStr = JSON.stringify(notifications[name]);
    if (existing) {
      existing.Value = jsonStr;
    } else {
      toSave.push({ Name: name, Value: jsonStr });
    }
  });

  const res = await SettingsAPI.editSettings(toSave);
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
