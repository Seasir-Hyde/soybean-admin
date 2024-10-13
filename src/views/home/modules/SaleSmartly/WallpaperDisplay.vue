<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 定义响应式数据
const wallpaperUrl = ref('');
const loading = ref(false);
const error = ref<string | null>(null);

// 定义获取壁纸的函数
const fetchWallpaper = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch('https://api.vvhan.com/api/wallpaper/acg?type=json');
    const data = await response.json();
    if (data.success && data.url) {
      wallpaperUrl.value = data.url;
    } else {
      throw new Error('Failed to fetch wallpaper');
    }
  } catch (err) {
    // 进行类型检查，确保 err 是对象且有 message 属性
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = 'An unknown error occurred';
    }
  } finally {
    loading.value = false;
  }
};

// 用于控制点击频率的变量
const isProcessing = ref(false); // 控制按钮是否处于处理状态
const lastClickTime = ref(0); // 记录上一次点击的时间戳
const cooldownTime = 3000; // 设置冷却时间为3秒

// 显示确认对话框
const showConfirmDialog = (message: string, title: string) => {
  return ElMessageBox.confirm(message, title, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    draggable: true
  });
};

// 显示信息消息
const showInfoMessage = (message: string) => {
  ElMessage({
    type: 'info',
    message
  });
};

// 显示成功消息
const showSuccessMessage = (message: string) => {
  ElMessage({
    type: 'success',
    message
  });
};

// 封装防抖逻辑的函数
const handleDebounce = () => {
  const now = Date.now();

  // 判断是否在冷却时间内重复点击
  if (now - lastClickTime.value < cooldownTime) {
    ElMessage.error('点击太快啦，休息下叭~');
    return true;
  }

  // 更新最后一次点击的时间
  lastClickTime.value = now;
  return false;
};
// 打开聊天窗口
const openChat = async () => {
  if (handleDebounce()) {
    return;
  }
  try {
    isProcessing.value = true; // 设置处理状态为真，防止重复操作
    await showConfirmDialog('确定要打开聊天窗口吗？', '确认');
    if (typeof window.ssq !== 'undefined' && typeof window.ssq.push === 'function') {
      window.ssq.push('chatOpen');
      console.log('聊天窗口已打开');
      showSuccessMessage('聊天窗口已打开');
    } else {
      console.error('ssq 未定义或者未声明--打开聊天窗口');
    }
  } catch {
    showInfoMessage('操作已取消');
    console.log('用户已取消打开聊天窗口');
  }
};

// 初始加载时获取一次壁纸
fetchWallpaper();
</script>

<template>
  <div class="wallpaper-container">
    <!-- 提示信息 -->
    <ElButton v-if="loading" class="loading-text" type="primary" loading>壁纸加载中...</ElButton>
    <p v-if="error">{{ error }}</p>

    <!-- 成功获取时显示图片 -->
    <div v-if="wallpaperUrl">
      <img :src="wallpaperUrl" alt="ACG Wallpaper" class="wallpaper-image" @click="openChat" />
    </div>

    <!-- 刷新壁纸按钮 -->
    <ElButton type="primary" @click="fetchWallpaper">刷新壁纸</ElButton>
  </div>
</template>

<style scoped>
.wallpaper-container {
  text-align: center;
  margin: 10px;
  margin-top: 60px;
}

.wallpaper-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin-top: 10px;
  margin-bottom: 10px;
  cursor: pointer; /* 鼠标放上去时显示手指光标 */
}

.loading-text {
  color: #ffffff;
}
</style>
