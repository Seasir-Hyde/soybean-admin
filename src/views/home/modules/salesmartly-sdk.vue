<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 确保外部脚本已经加载
onMounted(() => {
  if (typeof window.ssq !== 'undefined' && typeof window.ssq.push === 'function') {
    window.ssq.push('onUnRead', handleOnUnRead); // 监听未读消息
    console.log('salesmartly外部脚本已经加载');
  } else {
    console.error('salesmartly外部脚本未能加载');
  }
  setLoginInfo();
});

// 设置登录信息
function setLoginInfo() {
  if (window.ssq) {
    window.ssq.push('setLoginInfo', {
      user_id: 'b58e64cfxs2ym', // 加密后的用户id, 必填！
      // 对应用户的channel_uid在get-user-info，此处通过您的后端api传前端。
      // 不展示在客户资料处
      user_name: '用户名_测试', // 对应用户名
      language: 'ru-RU', // 对应用户语言
      phone: '19966668888', // 对应用户手机号
      email: 'Test_Email@qq.com', // 对应用户邮箱
      description: '项目名称\n套餐\n套餐费用\n截至日期\n客户信息', // 对应客户资料的用户描述信息，例如套餐信息
      label_names: ['标签值1', '标签值2'], // 对应用户标签，仅支持传系统已创建的标签值

      test: 'xiaomi' // 自定义字段，仅用于测试
    });
  } else {
    console.error('ssq 未定义或者未声明--设置登录信息');
  }
}

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

// 定义 Message 类型接口
interface Message {
  id: string;
  send_type: string;
  sender_avatar: string;
  msg_type: string;
  message: string;
  mid: string;
  quote_chat: string;
  created_time: string;
  chat_user_id: string;
}

// 定义 UnReadObj 类型接口
interface UnReadObj {
  num: number;
  list: Message[];
}

// 响应式变量来保存未读数量和内容
const unreadCount = ref<number>(0);
const unreadList = ref<string[]>([]);

// 注册 onUnRead 事件
function handleOnUnRead(obj: UnReadObj) {
  unreadCount.value = obj.num; // 更新未读数量

  // 提取并保留 message 内容
  unreadList.value = obj.list.map(item => item.message);
}

// 标记消息为已读
function markAsRead(index: number) {
  // 从 unreadList 中移除已读消息
  unreadList.value.splice(index, 1);
  unreadCount.value = unreadList.value.length; // 更新未读数量

  // 可以在此处添加 API 调用，通知后端用户已读了消息
  window.ssq.push('onUnRead', handleOnUnRead); // 监听未读消息
}

// 定义数据接口
interface SimulatedData {
  timestamp: string; // 时间
  details: {
    messageId: string; // 消息 ID
    messageType: string; // 消息类型
    messageContent: string; // 消息内容
  };
}
// 创建一个响应式状态来保存模拟的数据
const simulatedObj = ref<SimulatedData | null>(null);
// 监听发送消息
const onSendMessage = () => {
  window.ssq.push('onSendMessage', (_obj: any) => {
    console.log('Data received:', _obj);

    // 获取当前时间的 UTC 时间戳
    const now = new Date();

    // 获取 UTC+8 时间
    const offset = 8 * 60; // UTC+8 时区偏移量，以分钟为单位
    const localTime = new Date(now.getTime() + offset * 60 * 1000);

    // 格式化时间为 'YYYY-MM-DDTHH:mm:ss.sss' 格式
    const formattedTime = localTime.toISOString().replace('Z', '+08:00');

    // 标准化消息内容
    const messageContent = _obj.message.trim().toLowerCase();

    // 确保 messageId 和 messageType 被赋值
    simulatedObj.value = {
      timestamp: formattedTime, // UTC+8 时间
      details: {
        messageId: _obj.mid, // 消息 ID
        messageType: _obj.msg_type, // 消息类型
        messageContent // 标准化消息内容
      }
    };

    console.log('访客消息发送成功并上报数据', simulatedObj.value.details.messageContent);

    if (simulatedObj.value.details.messageContent === 'success') {
      console.log('Simulated object:', simulatedObj.value);

      ElMessage.success('访客消息发送成功！');
    } else {
      ElMessage.error('访客消息发送失败，请稍后重试~');
    }
  });
};
onSendMessage();
</script>

<template>
  <div class="button-container">
    <ElButton type="primary" @click="openChat">咨询客服</ElButton>
    <ElButton type="danger" @click="chatClose">关闭咨询</ElButton>
    <ElButton type="primary" plain @click="confirmNavigation('http://test.seasir.top/', 'A')">专属链接A</ElButton>
    <ElButton type="success" plain @click="confirmNavigation('http://test.nicoo.ltd/', 'B')">专属链接B</ElButton>
  </div>
  <div class="unread-container">
    <p class="unread-count">未读数量: {{ unreadCount }}</p>
    <ul class="unread-list">
      <li v-for="(message, index) in unreadList" :key="index" class="unread-item" @click="markAsRead(index)">
        <span class="label">未读内容：</span>
        <span class="message">{{ message }}</span>
      </li>
    </ul>
  </div>
  <div v-if="simulatedObj" class="message-card">
    <h3>访客消息状态</h3>
    <p>消息ID: {{ simulatedObj.details.messageId }}</p>
    <p>发送时间: {{ simulatedObj.timestamp }}</p>
    <p>消息类型: {{ simulatedObj.details.messageType }}</p>
    <p>消息内容: {{ simulatedObj.details.messageContent }}</p>
  </div>
  <div @click="openChat">
    <img src="https://img0.baidu.com/it/u=2702865616,2265069128&fm=253&fmt=auto&app=120&f=JPEG?w=1422&h=800" alt="" />
  </div>
</template>

<style lang="scss" scoped>
.button-container {
  display: flex;
  justify-content: flex-end; /* 保持 PC 端按钮居右对齐 */
  padding-right: 20px;
  border-radius: 8px;
  height: 40px;
  align-items: center;
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

@media (min-width: 769px) {
  /* PC 端 */
  .button-container {
    padding-right: 20px;
  }
}

/* 容器样式 */
.unread-container {
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-image: linear-gradient(to right, rgba(255, 130, 130, 0.5), rgb(255, 130, 130));
  box-shadow:
    0 4px 8px rgb(255, 130, 130),
    0 0 3px rgb(216, 137, 137); /* 渐变阴影 */
  width: 50%; /* 默认宽度为一半 */
  margin-left: 0; /* 居左 */
}

/* 未读数量样式 */
.unread-count {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 5px 10px 12px;
}

/* 未读列表样式 */
.unread-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* 每条未读消息样式 */
.unread-item {
  padding: 10px;
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
  color: #333;
}

.unread-item:last-child {
  border-bottom: none;
}

/* 标签和消息文本样式 */
.label {
  font-weight: bold;
  margin-right: 8px;
}

.message {
  color: #555;
}

/* 媒体查询 - 移动端自适应 */
@media (max-width: 768px) {
  /* 可以根据实际情况调整断点 */
  .unread-container {
    width: 100%; /* 宽度为100% */
  }
}

.message-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px;
  margin: 16px 0;
  max-width: 600px;
  font-family: Arial, sans-serif;
}

.message-card h3 {
  font-size: 1.5em;
  margin-bottom: 12px;
  color: #333;
}

.message-card p {
  font-size: 1em;
  color: #555;
  margin: 8px 0;
}

.message-card p:first-child {
  font-weight: bold;
  color: #000;
}

.message-card p span {
  font-weight: normal;
  color: #777;
}

.message-card p {
  line-height: 1.6;
}
</style>
