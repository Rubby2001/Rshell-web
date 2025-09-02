<script setup lang="ts">
import {computed} from "vue"
import {useRoute, useRouter} from "vue-router"
import {useSidebarStore} from "@/stores/sidebar"
import {useTaskStore} from "@/stores/taskinfo";
import {cancelRequest} from "@/utils/request";

const TaskStore = useTaskStore()
const sidebar = useSidebarStore()


const items = [
  {
    icon: "Odometer",
    index: '/client/shell',
    title: "Shell",
    permiss: "2"
  },
  {
    icon: "Odometer",
    index: '/client/files',
    title: "Files",
    permiss: "2"
  },
  {
    icon: "Odometer",
    index: '/client/pid',
    title: "PID",
    permiss: "2"
  },
  {
    icon: "Odometer",
    index: '/client/socks5',
    title: "Socks5",
    permiss: "2"
  },
  {
    icon: "Odometer",
    index: '/client/downloads',
    title: "Downloads",
    permiss: "2"
  },
  {
    icon: "Odometer",
    index: '/client/notes',
    title: "Notes",
    permiss: "2"
  },
  {
    icon: "Odometer",
    index: '/Clients',
    title: "返回首页",
    permiss: "2"
  },

]

const router = useRouter();
const route = useRoute();
const onRoutes = computed(() => {
  if (route.path === '/client') {
    TaskStore.clear();
  }
  return route.path;
});

const handleItemClick = (path :string) => {
  // cancelRequest();
  if (path!="/Clients"){
    // 获取当前的query参数
    const currentQuery = { ...route.query };

    // 导航到新路径并传递query参数
    router.push({ path, query: currentQuery });
  }else{
    router.push({ path});
  }

};

</script>

<template>
  <div class="sidebar">
    <el-menu
        class="sidebar-el-menu"
        :default-active="onRoutes"
        :collapse="sidebar.collapse"
        text-color="#181818"
        active-text-color="#20a0ff"
        unique-opened
        :router="false"
    >
      <template v-for="(item) in items" :key="item.index">
        <el-menu-item :index="item.index" @click="handleItemClick(item.index)" v-permiss="item.permiss">
          <el-icon>
            <component :is="item.icon"></component>
          </el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<style scoped>
.sidebar {
  display: block;
  position: absolute;
  left: 20px;
  top: 70px;
  min-width: 180px;
  height: 95%;
  bottom: 0;
  overflow-y: scroll;
}

.sidebar::-webkit-scrollbar {
  width: 0;
}

.sidebar > ul {
  height: 100%;
}
</style>
