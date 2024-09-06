<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { $t } from '@/locales';
import { useAppStore } from '@/store/modules/app';
import { useAuthStore } from '@/store/modules/auth';
defineOptions({
  name: 'HeaderBanner'
});

const appStore = useAppStore();
const authStore = useAuthStore();

const gap = computed(() => (appStore.isMobile ? 0 : 16));

interface StatisticData {
  id: number;
  label: string;
  value: string;
}

const statisticData = computed<StatisticData[]>(() => [
  {
    id: 0,
    label: $t('page.home.projectCount'),
    value: '25'
  },
  {
    id: 1,
    label: $t('page.home.todo'),
    value: '4/16'
  },
  {
    id: 2,
    label: $t('page.home.message'),
    value: '12'
  }
]);

// 确保外部脚本已经加载
onMounted(() => {
  if (typeof window.ssq !== 'undefined' && typeof window.ssq.push === 'function') {
    console.log('salesmartly外部脚本已经加载');
  } else {
    console.error('salesmartly外部脚本未能加载');
  }
});

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

// 用于控制点击频率的变量
const isProcessing = ref(false); // 控制按钮是否处于处理状态
const lastClickTime = ref(0); // 记录上一次点击的时间戳
const cooldownTime = 3000; // 设置冷却时间为3秒

// 打开聊天窗口
const openChat = async () => {
  const now = Date.now();

  // 判断是否在冷却时间内重复点击
  if (now - lastClickTime.value < cooldownTime) {
    ElMessage.error('操作太频繁，请稍后重试');
    return;
  }

  lastClickTime.value = now; // 更新点击时间戳
  try {
    isProcessing.value = true; // 设置处理状态为真，防止重复操作
    await showConfirmDialog('确定要打开聊天窗口吗？', '确认');
    if (typeof window.ssq !== 'undefined' && typeof window.ssq.push === 'function') {
      window.ssq.push('chatOpen');
      console.log('聊天窗口已打开');
      showSuccessMessage('聊天窗口已打开');
    } else {
      console.error('ssq未定义或ssq.push不是函数');
    }
  } catch {
    showInfoMessage('操作已取消');
    console.log('用户已取消打开聊天窗口');
  }
};

// 关闭聊天窗口
const chatClose = async () => {
  const now = Date.now();

  // 判断是否在冷却时间内重复点击
  if (now - lastClickTime.value < cooldownTime) {
    ElMessage.error('操作太频繁，请稍后重试');
    return;
  }

  lastClickTime.value = now; // 更新点击时间戳

  try {
    isProcessing.value = true; // 设置处理状态为真，防止重复操作

    // 弹出确认对话框
    await ElMessageBox.confirm('确定要关闭聊天窗口吗？', '确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      draggable: true
    });

    // 显示初始提示
    showInfoMessage('聊天窗口将在3秒后关闭');

    let countdown = 3; // 初始倒计时秒数
    const interval = setInterval(() => {
      countdown -= 1; // 替代 countdown--
      if (countdown > 0) {
        showInfoMessage(`聊天窗口将在${countdown}秒后关闭`);
      } else if (countdown === 0) {
        clearInterval(interval);

        // 在倒计时结束后延迟关闭聊天窗口
        setTimeout(() => {
          if (typeof window.ssq !== 'undefined' && typeof window.ssq.push === 'function') {
            window.ssq.push('chatClose');
            console.log('聊天窗口已关闭');
            showSuccessMessage('聊天窗口已成功关闭');
          } else {
            console.error('ssq未定义或ssq.push不是函数');
          }

          isProcessing.value = false; // 处理完成后重置处理状态
        }, 1000); // 延迟1秒后关闭聊天窗口并显示成功消息
      }
    }, 1000); // 每秒更新一次
  } catch {
    showInfoMessage('操作已取消');
    isProcessing.value = false; // 处理完成后重置处理状态
  }
};

// 定义函数时指定参数的类型为 string
const confirmNavigation = (url: string, linkName: string) => {
  ElMessageBox.confirm(`您确定要跳转到专属链接${linkName}吗？`, '确认跳转', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      // 用户点击确定后的操作，跳转到指定的链接
      window.open(url, '_blank'); // 在新标签页打开链接
      ElMessage({
        type: 'success',
        message: `已跳转到专属链接${linkName}`
      });
    })
    .catch(() => {
      // 用户点击取消后的操作
      ElMessage({
        type: 'info',
        message: '操作已取消'
      });
    });
};
</script>

<template>
  <NCard :bordered="false" class="card-wrapper">
    <NGrid :x-gap="gap" :y-gap="16" responsive="screen" item-responsive>
      <NGi span="24 s:24 m:18">
        <div class="flex-y-center">
          <div class="size-72px shrink-0 overflow-hidden rd-1/2">
            <img src="@/assets/imgs/soybean.jpg" class="size-full" />
          </div>
          <div class="pl-12px">
            <h3 class="text-18px font-semibold">
              {{ $t('page.home.greeting', { userName: authStore.userInfo.userName }) }}
            </h3>
            <p class="text-#999 leading-30px">{{ $t('page.home.weatherDesc') }}</p>
          </div>
        </div>
      </NGi>
      <NGi span="24 s:24 m:6">
        <NSpace :size="24" justify="end">
          <NStatistic v-for="item in statisticData" :key="item.id" class="whitespace-nowrap" v-bind="item" />
        </NSpace>
      </NGi>
    </NGrid>
  </NCard>
  <div class="button-container">
    <ElButton type="primary" @click="openChat">咨询客服</ElButton>
    <ElButton type="danger" @click="chatClose">关闭咨询</ElButton>
    <ElButton type="primary" plain @click="confirmNavigation('http://test.seasir.top/', 'A')">专属链接A</ElButton>
    <ElButton type="success" plain @click="confirmNavigation('http://test.nicoo.ltd/', 'B')">专属链接B</ElButton>
  </div>
</template>

<style scoped>
.button-container {
  display: flex;
  justify-content: center; /* 使按钮组居右对齐 */
}
</style>
