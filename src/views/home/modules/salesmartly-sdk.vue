<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';

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
    ElMessage.success(`发送消息成功，内容是：${messageContent}`);
  });
};

onSendMessage();
</script>

<template>
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
