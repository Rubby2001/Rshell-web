<script setup lang="ts">
import Header from "@/components/HeaDer.vue";
import TagsView from "@/components/TagsView.vue";

import {useTagsStore} from "@/stores/tags";
import {useUserStore} from "@/stores/user";

import {computed, reactive, watch} from 'vue'
import {useRoute} from 'vue-router';

const tags = useTagsStore();
const users = useUserStore();
const route = useRoute();

</script>
<template>
  <div class="home-container">
    <Header></Header>
    <div class="content-wrapper">
      <div class="content-card">
        <router-view v-slot="{ Component }">
          <transition name="move" mode="out-in">
            <keep-alive :include="tags.nameList">
              <component :is="Component"></component>
            </keep-alive>
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
  /**background: linear-gradient(135deg, #ffe6eb 0%, #ffecd2 100%);**/
}

.content-wrapper {
  padding: 130px 24px 24px 24px;
  min-height: 100vh;
  /**background: linear-gradient(135deg, #ffe6eb 0%, #ffecd2 100%);**/
  opacity: var(--content-opacity);
}

.content-card {
  max-width: 1400px;
  margin: 0 auto;
  background: var(--glass-bg-card);
  backdrop-filter: var(--glass-backdrop);
  border-radius: 20px;
  box-shadow: 0 8px 32px color-mix(in srgb, var(--theme-primary) 20%, rgba(0,0,0,0));
  border: 3px solid;
  border-color: color-mix(in srgb, var(--theme-primary) 10%, transparent);
  min-height: calc(100vh - 154px);
  overflow: hidden;
  transition: all 0.3s ease;
}

.content-card:hover {
  box-shadow: 0 12px 40px color-mix(in srgb, var(--theme-primary) 25%, rgba(0,0,0,0));
  transform: translateY(-2px);
}

/* 路由过渡动画 */
.move-enter-active,
.move-leave-active {
  transition: all 0.3s ease;
}

.move-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.move-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 130px 16px 16px 16px;
  }

  .content-card {
    border-radius: 16px;
    min-height: calc(100vh - 146px);
  }
}
</style>
