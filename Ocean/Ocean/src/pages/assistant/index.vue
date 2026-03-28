<template>
  <view class="chat-page">
    <scroll-view class="message-list" :scroll-y="true" :scroll-into-view="'msg' + (messages.length - 1)" :show-scrollbar="false">
      <view v-for="(message, index) in messages" :key="index" :id="'msg' + index" class="message-row" :class="{ 'is-user': message.isUser }">
        <image v-if="!message.isUser" class="avatar avatar-ai" src="/static/images/beluge.png" mode="aspectFit" />
        <view class="bubble" :class="{ 'bubble-user': message.isUser, 'bubble-ai': !message.isUser }">
          <text class="bubble-text">{{ message.text }}</text>
        </view>
        <image v-if="message.isUser" class="avatar avatar-user" src="/static/images/mascot.png" mode="aspectFit" />
      </view>
    </scroll-view>

    <view class="quick-panel">
      <text class="quick-title">你可能想问：</text>
      <view class="quick-list">
        <button
          v-for="(q, idx) in quickPrompts"
          :key="idx"
          class="quick-chip"
          @click="sendQuickPrompt(q)"
        >
          <text class="quick-chip-text">{{ q }}</text>
        </button>
      </view>
    </view>

    <view class="input-panel">
      <view class="input-wrap">
        <input class="input-field" type="text" v-model="newMessage" placeholder="输入你的问题" @confirm="sendMessage" confirm-type="send" />
      </view>
      <button class="send-button" @click="sendMessage">
        <image class="send-icon" src="/static/icons/arrow-right.png" mode="aspectFit" />
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      newMessage: '',
      quickPrompts: ['帮我推荐行程', '我想去水母馆，有什么要注意的吗？', '附近的厕所在哪里？'],
      demoFaq: {
        nearestToilet: '离你最近的厕所位于梦幻水母宫与白鲸海连廊中段，沿当前路线前行约120米，看到蓝色导视牌后右转即可到达。'
      },
      messages: [
        {
          text: '我是小白！遇到什么问题都可以点击我来询问哦~',
          isUser: false
        },
        {
          text: '附近的厕所在哪里呀？',
          isUser: true
        },
        {
          text: '离您最近的厕所位于白鲸馆的一楼，是否要为您规划导航？',
          isUser: false
        }
      ]
    }
  },
  onLoad(options) {
      this.loadDemoFaq();
      if (options.initialQuery) {
          this.messages.push({ text: options.initialQuery, isUser: true });
      }
  },
  methods: {
      loadDemoFaq() {
        const raw = uni.getStorageSync('ocean:assistant:demo_faq');
        if (!raw) return;
        try {
          const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (parsed && typeof parsed === 'object') {
            this.demoFaq = { ...this.demoFaq, ...parsed };
          }
        } catch (e) {
        }
      },
      buildReply(question) {
        const text = String(question || '').trim();
        if (!text) return '收到，正在为您处理...';
        if (text.includes('厕所') || text.includes('洗手间')) {
          return this.demoFaq.nearestToilet;
        }
        if (text.includes('行程')) {
          return '已为你准备演示行程：雨林海豚湾 → 企鹅岛 → 梦幻水母宫 → 白鲸海。你可以前往“我的行程”查看完整顺序。';
        }
        if (text.includes('水母')) {
          return '梦幻水母宫光线变化较多，建议佩戴墨镜并放慢脚步，遇到镜面反光可低头看地面短暂调整。';
        }
        return '收到，正在为您处理...';
      },
      sendMessage() {
          if (!this.newMessage.trim()) return;
          const question = this.newMessage;
          this.messages.push({ text: question, isUser: true });
          this.newMessage = '';
          setTimeout(() => {
              this.messages.push({ text: this.buildReply(question), isUser: false });
          }, 1000);
      },
      sendQuickPrompt(text) {
        this.newMessage = text;
        this.sendMessage();
      }
  }
}
</script>

<style lang="scss">
@import '@/uni.scss';

.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f1f1f1;
}

.message-list {
  flex: 1;
  padding: 24rpx 32rpx 0;
  padding-bottom: calc(360rpx + env(safe-area-inset-bottom));
}

.message-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 22rpx;
}

.message-row.is-user {
  justify-content: flex-end;
}

.avatar {
  flex-shrink: 0;
}

.avatar-ai {
  width: 114rpx;
  height: 140rpx;
  margin-right: 18rpx;
}

.avatar-user {
  width: 124rpx;
  height: 152rpx;
  margin-left: 18rpx;
}

.bubble {
  max-width: 520rpx;
  border-radius: 20rpx;
  background-color: #ffffff;
  box-shadow: 0 8rpx 8rpx rgba(0, 0, 0, 0.25);
  padding: 18rpx 22rpx;
}

.bubble-text {
  font-size: 26rpx;
  line-height: 36rpx;
  color: #999999;
}

.quick-panel {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(120rpx + env(safe-area-inset-bottom));
  padding: 0 32rpx;
}

.quick-title {
  display: block;
  margin-left: 6rpx;
  font-size: 26rpx;
  color: #0f92ff;
}

.quick-list {
  margin-top: 12rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  align-items: flex-start;
}

.quick-chip {
  max-width: 650rpx;
  border-radius: 60rpx;
  box-shadow: 0 8rpx 8rpx rgba(0, 0, 0, 0.25);
  background-color: #c6e2fb;
  padding: 18rpx 26rpx;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-chip::after {
  border: none;
}

.quick-chip-text {
  font-size: 26rpx;
  color: #999999;
}

.input-panel {
  position: fixed;
  bottom: env(safe-area-inset-bottom);
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 18rpx 32rpx 22rpx;
  background-color: transparent;
}

.input-wrap {
  flex: 1;
  height: 104rpx;
  border-radius: 60rpx;
  box-shadow: 0 8rpx 8rpx rgba(0, 0, 0, 0.25);
  background-color: #ffffff;
  padding: 0 40rpx;
  display: flex;
  align-items: center;
}

.input-field {
  width: 100%;
  font-size: 26rpx;
  color: #333333;
}

.send-button {
  width: 104rpx;
  height: 104rpx;
  border-radius: 999rpx;
  background-color: #0088ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 18rpx;
  padding: 0;
}

.send-button::after {
  border: none;
}

.send-icon {
  width: 62rpx;
  height: 66rpx;
}

</style>
