<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Lock,
  User,
  Key,
  Check,
  Close,
  View,
  Hide,
} from '@element-plus/icons-vue';
import { useUserStore } from "@/stores/user";
import { usePermissStore } from "@/stores/userpermiss";
import UserApi from '@/api/user'

const router = useRouter();
const userStore = useUserStore();
const permissStore = usePermissStore();

const dialogFormVisible = ref(true);
const loading = ref(false);
const showOldPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

interface RuleForm {
  username: string;
  password: string;
  new_password: string;
  again_password: string;
}

const form = reactive<RuleForm>({
  username: userStore.getUserName() || '',
  password: '',
  new_password: '',
  again_password: ''
});

// 密码强度检查
const passwordStrength = computed(() => {
  if (!form.new_password) return 0;

  let score = 0;
  // 长度检查
  if (form.new_password.length >= 8) score++;
  if (form.new_password.length >= 12) score++;

  // 字符种类检查
  if (/[a-z]/.test(form.new_password)) score++;
  if (/[A-Z]/.test(form.new_password)) score++;
  if (/[0-9]/.test(form.new_password)) score++;
  if (/[^a-zA-Z0-9]/.test(form.new_password)) score++;

  return Math.min(score, 5);
});

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value;
  if (strength <= 2) return '弱';
  if (strength <= 3) return '中';
  return '强';
});

const passwordStrengthColor = computed(() => {
  const strength = passwordStrength.value;
  if (strength <= 2) return '#f56c6c';
  if (strength <= 3) return '#e6a23c';
  return '#67c23a';
});

// 密码验证规则
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,}$/;

const isPasswordValid = computed(() => {
  if (!form.new_password) return false;
  return passwordRegex.test(form.new_password);
});

const doPasswordsMatch = computed(() => form.new_password === form.again_password);

// 密码验证规则
const validatePassword = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请输入原密码'));
  } else if (value.length < 6) {
    callback(new Error('密码长度不能小于6位'));
  } else {
    callback();
  }
};

const validateNewPassword = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请输入新密码'));
  } else if (value.length < 8) {
    callback(new Error('密码长度不能小于8位'));
  } else if (!passwordRegex.test(value)) {
    callback(new Error('密码必须包含大小写字母和数字'));
  } else {
    callback();
  }
};

const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请确认新密码'));
  } else if (value !== form.new_password) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const ruleFormRef = ref<FormInstance>();
const rules = reactive<FormRules<RuleForm>>({
  password: [
    { required: true, validator: validatePassword, trigger: 'blur' }
  ],
  new_password: [
    { required: true, validator: validateNewPassword, trigger: 'blur' }
  ],
  again_password: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
});

// 检查用户是否已登录
onMounted(() => {
  if (!form.username) {
    ElMessage.error('请先登录');
    setTimeout(() => {
      router.push('/login');
    }, 1500);
  }
});

// 密码要求列表
const passwordRequirements = [
  { text: '至少8个字符', met: computed(() => form.new_password.length >= 8) },
  { text: '至少一个大写字母', met: computed(() => /[A-Z]/.test(form.new_password)) },
  { text: '至少一个小写字母', met: computed(() => /[a-z]/.test(form.new_password)) },
  { text: '至少一个数字', met: computed(() => /[0-9]/.test(form.new_password)) },
];

const resetPassword = async () => {
  loading.value = true;

  try {
    const res = await UserApi.rest_password({
      old_password: form.password,
      new_password: form.new_password
    });

    if (res.data.code === 200) {
      ElMessage.success('密码重置成功');

      // 显示成功提示框
      await ElMessageBox.alert('密码重置成功，请使用新密码重新登录', '操作成功', {
        confirmButtonText: '重新登录',
        type: 'success',
        showClose: false,
        closeOnClickModal: false,
        closeOnPressEscape: false,
      });

      // 清除用户信息并跳转登录
      userStore.logout();
      permissStore.clear();
      localStorage.clear();
      sessionStorage.clear();

      router.push('/login');
    } else {
      ElMessage.error(res.data.message || '重置密码失败，请稍后重试');
    }
  } catch (error: any) {
    console.error('重置密码失败:', error);
    ElMessage.error(error.response?.data?.message || '重置密码失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const closeDialog = async () => {
  if (form.password || form.new_password || form.again_password) {
    try {
      await ElMessageBox.confirm(
          '您有未保存的更改，确定要取消吗？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
      );
      dialogFormVisible.value = false;
      router.push('/Clients');
    } catch {
      // 用户取消
    }
  } else {
    dialogFormVisible.value = false;
    router.push('/Clients');
  }
};

const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  formEl.validate((valid, fields) => {
    if (valid) {
      resetPassword();
    } else {
      console.log('验证失败:', fields);
      ElMessage.error('请检查表单信息');
    }
  });
};

// 切换密码可见性
const togglePasswordVisibility = (type: 'old' | 'new' | 'confirm') => {
  switch (type) {
    case 'old':
      showOldPassword.value = !showOldPassword.value;
      break;
    case 'new':
      showNewPassword.value = !showNewPassword.value;
      break;
    case 'confirm':
      showConfirmPassword.value = !showConfirmPassword.value;
      break;
  }
};
</script>

<template>
  <div class="reset-password-container">
    <!-- 背景装饰 -->
    <div class="background-decorations">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>
    </div>

    <!-- 主对话框 -->
    <el-dialog
        v-model="dialogFormVisible"
        title="重置密码"
        width="520px"
        class="reset-password-dialog"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :show-close="false"
        destroy-on-close
    >
      <!-- 对话框头部 -->
      <template #header>
        <div class="dialog-header">
          <div class="header-icon">
            <el-icon class="lock-icon"><Key /></el-icon>
          </div>
          <div class="header-content">
            <h3 class="dialog-title">重置密码</h3>
            <p class="dialog-subtitle">请验证身份并设置新的登录密码</p>
          </div>
        </div>
      </template>

      <!-- 对话框内容 -->
      <div class="dialog-content">
        <el-form
            ref="ruleFormRef"
            :model="form"
            class="reset-password-form"
            label-position="top"
            :rules="rules"
            @submit.prevent="submitForm(ruleFormRef)"
        >
          <!-- 用户名 -->
          <el-form-item label="用户名" class="form-item-custom">
            <div class="username-display">
              <el-icon class="user-icon"><User /></el-icon>
              <span class="username-text">{{ form.username }}</span>
            </div>
            <div class="form-hint">系统管理员账号</div>
          </el-form-item>

          <!-- 原密码 -->
          <el-form-item label="原密码" prop="password" class="form-item-custom">
            <div class="password-input-wrapper">
              <el-icon class="input-icon"><Lock /></el-icon>
              <el-input
                  v-model="form.password"
                  :type="showOldPassword ? 'text' : 'password'"
                  placeholder="请输入当前使用的密码"
                  size="large"
                  clearable
              />
              <el-icon
                  class="password-toggle"
                  @click="togglePasswordVisibility('old')"
              >
                <component :is="showOldPassword ? View : Hide" />
              </el-icon>
            </div>
            <div class="form-hint">请输入您当前的登录密码</div>
          </el-form-item>

          <!-- 新密码 -->
          <el-form-item label="新密码" prop="new_password" class="form-item-custom">
            <div class="password-input-wrapper">
              <el-icon class="input-icon"><Lock /></el-icon>
              <el-input
                  v-model="form.new_password"
                  :type="showNewPassword ? 'text' : 'password'"
                  placeholder="请设置新的登录密码"
                  size="large"
                  clearable
              />
              <el-icon
                  class="password-toggle"
                  @click="togglePasswordVisibility('new')"
              >
                <component :is="showNewPassword ? View : Hide" />
              </el-icon>
            </div>

            <!-- 密码强度指示器 -->
            <div class="password-strength-indicator" v-if="form.new_password">
              <div class="strength-meter">
                <div
                    class="strength-bar"
                    :style="{
                    width: `${(passwordStrength / 5) * 100}%`,
                    backgroundColor: passwordStrengthColor
                  }"
                ></div>
              </div>
              <div class="strength-info">
                <span class="strength-label">密码强度：</span>
                <span
                    class="strength-value"
                    :style="{ color: passwordStrengthColor }"
                >
                  {{ passwordStrengthText }}
                </span>
              </div>
            </div>

            <!-- 密码要求列表 -->
            <div class="password-requirements">
              <div
                  v-for="(req, index) in passwordRequirements"
                  :key="index"
                  class="requirement-item"
              >
                <el-icon
                    class="requirement-icon"
                    :class="{ 'requirement-met': req.met.value }"
                >
                  <component :is="req.met.value ? Check : Close" />
                </el-icon>
                <span
                    class="requirement-text"
                    :class="{ 'requirement-met': req.met.value }"
                >
                  {{ req.text }}
                </span>
              </div>
            </div>
          </el-form-item>

          <!-- 确认密码 -->
          <el-form-item label="确认密码" prop="again_password" class="form-item-custom">
            <div class="password-input-wrapper">
              <el-icon class="input-icon"><Lock /></el-icon>
              <el-input
                  v-model="form.again_password"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="请再次输入新密码"
                  size="large"
                  clearable
              />
              <el-icon
                  class="password-toggle"
                  @click="togglePasswordVisibility('confirm')"
              >
                <component :is="showConfirmPassword ? View : Hide" />
              </el-icon>
            </div>

            <!-- 密码匹配指示器 -->
            <div class="password-match-indicator" v-if="form.again_password">
              <el-icon
                  class="match-icon"
                  :class="{ 'match-success': doPasswordsMatch }"
              >
                <component :is="doPasswordsMatch ? Check : Close" />
              </el-icon>
              <span
                  class="match-text"
                  :class="{ 'match-success': doPasswordsMatch }"
              >
                {{ doPasswordsMatch ? '密码匹配成功' : '密码不匹配' }}
              </span>
            </div>
          </el-form-item>
        </el-form>

        <!-- 安全提示 -->
        <div class="security-notice">
          <el-icon class="notice-icon"><Check /></el-icon>
          <div class="notice-content">
            <p class="notice-title">安全提示</p>
            <p class="notice-text">
              为了您的账户安全，请定期更换密码，并确保密码复杂度符合要求。
              修改密码后，您需要重新登录系统。
            </p>
          </div>
        </div>
      </div>

      <!-- 对话框底部 -->
      <template #footer>
        <div class="dialog-footer">
          <el-button
              @click="closeDialog"
              class="footer-button"
              :disabled="loading"
          >
            取消
          </el-button>
          <el-button
              type="primary"
              @click="submitForm(ruleFormRef)"
              class="footer-button"
              :loading="loading"
              :disabled="!isPasswordValid || !doPasswordsMatch"
          >
            <template #default>
              <span v-if="!loading">重置密码</span>
              <span v-else>处理中...</span>
            </template>
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.reset-password-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.background-decorations {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(64, 158, 255, 0.05) 100%);
}

.circle-1 {
  width: 400px;
  height: 400px;
  top: -200px;
  right: -200px;
}

.circle-2 {
  width: 300px;
  height: 300px;
  bottom: -150px;
  left: -150px;
}

.circle-3 {
  width: 200px;
  height: 200px;
  top: 50%;
  left: 10%;
}

/* 对话框样式 */
:deep(.reset-password-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

:deep(.reset-password-dialog .el-dialog__header) {
  margin: 0;
  padding: 0;
}

:deep(.reset-password-dialog .el-dialog__body) {
  padding: 0;
}

.dialog-header {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.lock-icon {
  color: white;
  font-size: 24px;
}

.header-content {
  flex: 1;
}

.dialog-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin-bottom: 4px;
}

.dialog-subtitle {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.dialog-content {
  padding: 32px;
  background: white;
}

.reset-password-form {
  margin-bottom: 24px;
}

.form-item-custom {
  margin-bottom: 24px;
}

:deep(.form-item-custom .el-form-item__label) {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
  padding-bottom: 8px;
  display: block;
}

.username-display {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.user-icon {
  color: #6c757d;
  font-size: 18px;
}

.username-text {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.password-input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 1;
  font-size: 18px;
}

:deep(.password-input-wrapper .el-input__wrapper) {
  padding-left: 44px;
  padding-right: 44px;
  border-radius: 8px;
  transition: all 0.3s;
}

:deep(.password-input-wrapper .el-input__wrapper:hover) {
  border-color: #409eff;
}

:deep(.password-input-wrapper .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

.password-toggle {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  cursor: pointer;
  z-index: 1;
  font-size: 18px;
  transition: color 0.3s;
}

.password-toggle:hover {
  color: #409eff;
}

.form-hint {
  font-size: 12px;
  color: #6c757d;
  margin-top: 6px;
}

/* 密码强度指示器 */
.password-strength-indicator {
  margin-top: 12px;
}

.strength-meter {
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}

.strength-bar {
  height: 100%;
  border-radius: 3px;
  transition: all 0.3s;
}

.strength-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.strength-label {
  font-size: 12px;
  color: #6c757d;
}

.strength-value {
  font-size: 12px;
  font-weight: 600;
  transition: color 0.3s;
}

/* 密码要求列表 */
.password-requirements {
  margin-top: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.requirement-item:last-child {
  margin-bottom: 0;
}

.requirement-icon {
  font-size: 12px;
  color: #dc3545;
  transition: all 0.3s;
}

.requirement-icon.requirement-met {
  color: #28a745;
}

.requirement-text {
  font-size: 13px;
  color: #6c757d;
  transition: all 0.3s;
}

.requirement-text.requirement-met {
  color: #28a745;
}

/* 密码匹配指示器 */
.password-match-indicator {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.match-icon {
  font-size: 14px;
  color: #dc3545;
  transition: all 0.3s;
}

.match-icon.match-success {
  color: #28a745;
}

.match-text {
  font-size: 13px;
  color: #6c757d;
  transition: all 0.3s;
}

.match-text.match-success {
  color: #28a745;
  font-weight: 500;
}

/* 安全提示 */
.security-notice {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #e7f3ff;
  border-radius: 8px;
  border: 1px solid #cce5ff;
}

.notice-icon {
  color: #409eff;
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.notice-content {
  flex: 1;
}

.notice-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #004085;
}

.notice-text {
  margin: 0;
  font-size: 13px;
  color: #004085;
  line-height: 1.5;
  opacity: 0.8;
}

/* 对话框底部 */
:deep(.reset-password-dialog .el-dialog__footer) {
  padding: 20px 32px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.footer-button {
  min-width: 100px;
  border-radius: 8px;
  padding: 10px 24px;
  font-weight: 500;
  transition: all 0.3s;
}

.footer-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 600px) {
  .dialog-header {
    padding: 20px;
  }

  .dialog-content {
    padding: 24px;
  }

  :deep(.reset-password-dialog) {
    width: 90vw !important;
    margin: 0 auto;
  }

  .footer-button {
    min-width: 80px;
    padding: 8px 20px;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reset-password-form,
.security-notice,
.dialog-footer {
  animation: fadeIn 0.5s ease;
}
</style>