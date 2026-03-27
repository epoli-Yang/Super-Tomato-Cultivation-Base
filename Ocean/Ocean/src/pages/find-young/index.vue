<template>
  <view class="find-page">
    <view class="find-card">
      <text class="card-title">寻找心青年</text>
      <text class="card-sub">请输入游客邀请码完成绑定</text>
      <input
        class="code-input"
        v-model="inviteCode"
        placeholder="请输入邀请码"
        placeholder-class="code-placeholder"
      />
      <button class="bind-btn" @click="confirmBind">确认绑定</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      inviteCode: ''
    };
  },
  methods: {
    readDirectory() {
      try {
        const raw = uni.getStorageSync('ocean:inviteDirectory');
        const parsed = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : {};
        return parsed && typeof parsed === 'object' ? parsed : {};
      } catch (e) {
        return {};
      }
    },
    readAuth() {
      try {
        const raw = uni.getStorageSync('ocean:auth');
        const parsed = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : {};
        return parsed && typeof parsed === 'object' ? parsed : {};
      } catch (e) {
        return {};
      }
    },
    confirmBind() {
      const code = (this.inviteCode || '').trim();
      if (!code) {
        uni.showToast({ title: '请输入邀请码', icon: 'none' });
        return;
      }
      const directory = this.readDirectory();
      const matched = directory[code];
      if (!matched) {
        uni.showToast({ title: '邀请码无效', icon: 'none' });
        return;
      }
      const senses = Array.isArray(matched.senses) && matched.senses.length ? matched.senses : [0, 0, 0, 0, 0];
      const auth = this.readAuth();
      auth.boundCode = code;
      auth.servedProfile = {
        name: matched.name || '心青年',
        age: matched.age || 0,
        intro: matched.intro || '',
        senses
      };
      uni.setStorageSync('ocean:auth', JSON.stringify(auth));
      uni.showToast({ title: '绑定成功', icon: 'none' });
      uni.navigateTo({ url: '/pages/service-profile-detail/index' });
    }
  }
}
</script>

<style lang="scss">
@import '@/uni.scss';

page {
  width: 100%;
  height: 100%;
  background-color: #f7f9f9;
}

.find-page {
  min-height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
}

.find-card {
  background-color: #faf8f5;
  border-radius: 24rpx;
  padding: 30rpx 24rpx;
}

.card-title {
  display: block;
  font-size: 34rpx;
  color: #2C3E50;
  font-weight: 700;
}

.card-sub {
  margin-top: 12rpx;
  display: block;
  font-size: 26rpx;
  color: rgba(44, 62, 80, 0.72);
}

.code-input {
  margin-top: 20rpx;
  min-height: 88rpx;
  border-radius: 18rpx;
  background-color: rgba(44, 62, 80, 0.06);
  padding: 0 20rpx;
  font-size: 30rpx;
  color: #2C3E50;
}

.code-placeholder {
  color: rgba(44, 62, 80, 0.45);
}

.bind-btn {
  margin-top: 20rpx;
  width: 100%;
  min-height: 88rpx;
  border-radius: 20rpx;
  border: none;
  background-color: #2a73ca;
  color: #ffffff;
  font-size: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bind-btn::after {
  border: none;
}
</style>
