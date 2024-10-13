<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

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

// 关闭聊天窗口
const chatClose = async () => {
  if (handleDebounce()) {
    return;
  }

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
            console.error('ssq 未定义或者未声明--关闭聊天窗口');
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
  if (handleDebounce()) {
    return;
  }

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
  <div class="button-container">
    <ElButton type="primary" @click="openChat">咨询客服</ElButton>
    <ElButton type="danger" @click="chatClose">关闭咨询</ElButton>
    <ElButton type="primary" plain @click="confirmNavigation('http://test.seasir.top/', 'A')">专属链接A</ElButton>
    <ElButton type="success" plain @click="confirmNavigation('http://test.nicoo.ltd/', 'B')">专属链接B</ElButton>
  </div>
</template>

<style lang="scss" scoped>
.button-container {
  display: flex;
  justify-content: flex-end; /* 保持 PC 端按钮居右对齐 */
  // padding-right: 20px;
  border-radius: 8px;
  height: 40px;
  align-items: center;

  display: grid;
  grid-template-columns: 1fr 1fr; /* 定义2列布局 */
  gap: 20px; /* 按钮之间的间距 */
}

.button-container .el-button {
  margin-left: 10px;
}

@media (max-width: 768px) {
  /* 移动端屏幕宽度小于等于 768px 时 */
  .button-container {
    justify-content: center; /* 移动端按钮居中 */
    flex-wrap: wrap;
    height: auto;
    padding: 0px; /* 增加内边距 */
  }

  .button-container .el-button {
    flex: 0 0 calc(50% - 20px); /* 每个按钮占据一半宽度减去一定的间距 */
    margin: 10px; /* 上下左右都有间距 */
    height: 38px; /* 增加按钮高度 */
  }
}

@media (max-width: 768px) {
  .button-container {
    grid-template-columns: 2fr; /* 在移动设备上改为1列 */
  }
}
</style>
