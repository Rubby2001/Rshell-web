<template>
  <div class="home-page">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="banner-content">
<h1 class="welcome-title">欢迎使用 Rshell 控制平台</h1>
<p class="welcome-subtitle">功能强大的跨平台远程控制管理工具</p>
        <div class="banner-decoration">
          <div class="decoration-circle"></div>
          <div class="decoration-circle"></div>
          <div class="decoration-circle"></div>
        </div>
      </div>
    </div>

    <!-- 功能特性 -->
    <div class="features-section">
      <div class="section-title">
        <h2>核心功能</h2>
        <p>提供全面的远程控制解决方案</p>
      </div>

      <div class="features-grid">
        <el-card class="feature-card" shadow="hover">
          <div class="feature-icon">
            <el-icon><Connection /></el-icon>
          </div>
          <h3 class="feature-title">监听器管理</h3>
          <p class="feature-desc">支持多种协议（WebSocket、TCP、KCP、HTTP、OSS）的监听器配置与管理</p>
          <ul class="feature-list">
            <li><el-icon><Check /></el-icon> WebSocket 实时通信</li>
            <li><el-icon><Check /></el-icon> TCP 标准协议</li>
            <li><el-icon><Check /></el-icon> KCP 快速传输</li>
            <li><el-icon><Check /></el-icon> OSS 云存储支持</li>
          </ul>
        </el-card>

        <el-card class="feature-card" shadow="hover">
          <div class="feature-icon">
            <el-icon><Download /></el-icon>
          </div>
          <h3 class="feature-title">客户端生成</h3>
          <p class="feature-desc">快速生成适用于不同操作系统和架构的客户端程序</p>
          <ul class="feature-list">
            <li><el-icon><Check /></el-icon> Windows / Linux / macOS</li>
            <li><el-icon><Check /></el-icon> 多架构支持（x86/x64/ARM等）</li>
            <li><el-icon><Check /></el-icon> 一键生成下载</li>
            <li><el-icon><Check /></el-icon> 自定义连接密码</li>
          </ul>
        </el-card>

        <el-card class="feature-card" shadow="hover">
          <div class="feature-icon">
            <el-icon><Promotion /></el-icon>
          </div>
          <h3 class="feature-title">Web 投递</h3>
          <p class="feature-desc">通过 HTTP 服务投递客户端，支持一键上线</p>
          <ul class="feature-list">
            <li><el-icon><Check /></el-icon> 快速部署服务</li>
            <li><el-icon><Check /></el-icon> 自动生成上线命令</li>
            <li><el-icon><Check /></el-icon> 支持 Shellcode 生成</li>
            <li><el-icon><Check /></el-icon> 状态实时监控</li>
          </ul>
        </el-card>

        <el-card class="feature-card" shadow="hover">
          <div class="feature-icon">
            <el-icon><Monitor /></el-icon>
          </div>
          <h3 class="feature-title">客户端管理</h3>
          <p class="feature-desc">统一管理已连接的客户端，实时监控状态</p>
          <ul class="feature-list">
            <li><el-icon><Check /></el-icon> 实时在线状态</li>
            <li><el-icon><Check /></el-icon> 交互式 Shell</li>
            <li><el-icon><Check /></el-icon> 文件传输与管理</li>
            <li><el-icon><Check /></el-icon> 进程管理</li>
          </ul>
        </el-card>
      </div>
    </div>

    <!-- 快速开始 -->
    <div class="quick-start-section">
      <div class="section-title">
        <h2>快速开始</h2>
        <p>只需三步即可开始使用</p>
      </div>

      <div class="steps-container">
        <div class="step-card">
          <div class="step-number">1</div>
          <h3 class="step-title">创建监听器</h3>
          <p class="step-desc">在监听器管理页面创建一个新的监听器，选择协议和配置连接参数</p>
          <el-button type="primary" @click="goToListener" class="step-btn">
            <el-icon><Position /></el-icon>
            前往监听器
          </el-button>
        </div>

        <div class="step-arrow">
          <el-icon><ArrowRight /></el-icon>
        </div>

        <div class="step-card">
          <div class="step-number">2</div>
          <h3 class="step-title">生成客户端</h3>
          <p class="step-desc">在客户端生成页面配置参数，生成适用于目标系统的客户端程序</p>
          <el-button type="primary" @click="goToClient" class="step-btn">
            <el-icon><Download /></el-icon>
            前往生成
          </el-button>
        </div>

        <div class="step-arrow">
          <el-icon><ArrowRight /></el-icon>
        </div>

        <div class="step-card">
          <div class="step-number">3</div>
          <h3 class="step-title">运行并连接</h3>
          <p class="step-desc">在目标系统运行客户端，即可在控制台看到在线主机</p>
          <el-button type="primary" @click="goToClients" class="step-btn">
            <el-icon><Monitor /></el-icon>
            查看客户端
          </el-button>
        </div>
      </div>
    </div>

    <!-- 使用技巧 -->
    <div class="tips-section">
      <div class="section-title">
        <h2>使用技巧</h2>
        <p>提升使用效率的小贴士</p>
      </div>

      <div class="tips-grid">
        <div class="tip-item">
          <el-icon class="tip-icon"><InfoFilled /></el-icon>
          <h4>多协议支持</h4>
          <p>根据网络环境选择合适的协议，WebSocket 适合公网环境，KCP 适合高延迟网络</p>
        </div>

        <div class="tip-item">
          <el-icon class="tip-icon"><Lock /></el-icon>
          <h4>安全加固</h4>
          <p>建议为每个客户端设置独立的连接密码，提高安全性</p>
        </div>

        <div class="tip-item">
          <el-icon class="tip-icon"><MagicStick /></el-icon>
          <h4>Shellcode 生成</h4>
          <p>Web 投递支持生成多种格式的 Shellcode，方便集成到其他攻击载体</p>
        </div>

        <div class="tip-item">
          <el-icon class="tip-icon"><Document /></el-icon>
          <h4>命令参考</h4>
          <p>客户端生成页面提供了多种上线命令参考，可直接复制使用</p>
        </div>
      </div>
    </div>

    <!-- 版本信息 -->
    <div class="version-section">
      <el-card class="version-card" shadow="hover">
        <div class="version-content">
          <el-icon class="version-icon"><SuccessFilled /></el-icon>
          <div class="version-info">
<h3>系统版本</h3>
<p>Rshell - Cross-Platform C2 Framework</p>
<p class="version-note">基于 Go 语言开发的跨平台 C2 控制框架</p>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import {
  Connection,
  Download,
  Promotion,
  Monitor,
  Check,
  Position,
  ArrowRight,
  InfoFilled,
  Lock,
  MagicStick,
  Document,
  SuccessFilled
} from '@element-plus/icons-vue';

const router = useRouter();

const goToListener = () => {
  router.push('/Listeners');
};

const goToClient = () => {
  router.push('/Server');
};

const goToClients = () => {
  router.push('/Clients');
};
</script>

<style scoped>
.home-page {
  padding: 24px;
  min-height: calc(100vh - 60px);
  overflow-y: auto;
}

/* 欢迎横幅 */
.welcome-banner {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 20px;
  padding: 60px 40px;
  margin-bottom: 40px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(0, 0, 0, 0.1);
}

.banner-content {
  text-align: center;
  position: relative;
  z-index: 1;
}

.welcome-title {
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-dark) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 2px;
}

.welcome-subtitle {
  font-size: 20px;
  color: #666;
  margin: 0;
  font-weight: 500;
}

.banner-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.03));
}

.decoration-circle:nth-child(1) {
  width: 200px;
  height: 200px;
  top: -100px;
  right: -50px;
}

.decoration-circle:nth-child(2) {
  width: 150px;
  height: 150px;
  bottom: -75px;
  left: 20%;
}

.decoration-circle:nth-child(3) {
  width: 100px;
  height: 100px;
  top: 30%;
  left: -30px;
}

/* 章节标题 */
.section-title {
  text-align: center;
  margin-bottom: 32px;
}

.section-title h2 {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 12px 0;
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-dark) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-title p {
  font-size: 16px;
  color: #999;
  margin: 0;
}

/* 功能特性 */
.features-section {
  margin-bottom: 60px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.feature-card {
  border-radius: 20px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  transition: all 0.3s;
  cursor: default;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: var(--theme-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  font-size: 36px;
  color: var(--theme-primary);
}

.feature-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--theme-primary);
  margin: 0 0 12px 0;
}

.feature-desc {
  font-size: 15px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.feature-list li .el-icon {
  color: #67c23a;
  font-size: 16px;
  flex-shrink: 0;
}

/* 快速开始 */
.quick-start-section {
  margin-bottom: 60px;
}

.steps-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 20px 0;
}

.step-card {
  flex: 1;
  max-width: 320px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  transition: all 0.3s;
}

.step-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.step-number {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-dark) 100%);
  color: white;
  font-size: 28px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.step-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--theme-primary);
  margin: 0 0 12px 0;
}

.step-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 24px;
  min-height: 64px;
}

.step-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}

.step-arrow {
  font-size: 32px;
  color: var(--theme-primary);
  flex-shrink: 0;
}

/* 使用技巧 */
.tips-section {
  margin-bottom: 60px;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.tip-item {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s;
}

.tip-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.tip-icon {
  font-size: 32px;
  color: var(--theme-primary);
  margin-bottom: 16px;
}

.tip-item h4 {
  font-size: 18px;
  font-weight: 600;
  color: var(--theme-primary);
  margin: 0 0 12px 0;
}

.tip-item p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

/* 版本信息 */
.version-section {
  margin-bottom: 40px;
}

.version-card {
  border-radius: 20px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
}

.version-content {
  display: flex;
  align-items: center;
  gap: 24px;
}

.version-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: var(--theme-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: var(--theme-primary);
  flex-shrink: 0;
}

.version-info {
  flex: 1;
}

.version-info h3 {
  font-size: 24px;
  font-weight: 600;
  color: var(--theme-primary);
  margin: 0 0 8px 0;
}

.version-info p {
  font-size: 15px;
  color: #666;
  margin: 4px 0;
  line-height: 1.6;
}

.version-note {
  font-size: 14px;
  color: #999;
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .features-grid {
    grid-template-columns: 1fr;
  }

  .tips-grid {
    grid-template-columns: 1fr;
  }

  .steps-container {
    flex-direction: column;
  }

  .step-arrow {
    transform: rotate(90deg);
    margin: 10px 0;
  }

  .step-card {
    max-width: 100%;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .home-page {
    padding: 16px;
  }

  .welcome-banner {
    padding: 40px 24px;
  }

  .welcome-title {
    font-size: 32px;
  }

  .welcome-subtitle {
    font-size: 16px;
  }

  .section-title h2 {
    font-size: 24px;
  }

  .section-title p {
    font-size: 14px;
  }

  .features-grid,
  .tips-grid {
    grid-template-columns: 1fr;
  }

  .version-content {
    flex-direction: column;
    text-align: center;
  }

  .step-card {
    padding: 24px;
  }
}

@media (max-width: 480px) {
  .welcome-title {
    font-size: 28px;
  }

  .feature-icon {
    width: 60px;
    height: 60px;
    font-size: 28px;
  }

  .step-number {
    width: 50px;
    height: 50px;
    font-size: 24px;
  }
}
</style>