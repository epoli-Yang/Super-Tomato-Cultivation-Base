<template>
  <view class="permission-page">
    <view class="nav-header">
      <view class="back-btn" @click="goBack">
        <uni-icons type="left" size="24" color="#333"></uni-icons>
      </view>
    </view>
    <view class="content">
      <view class="illustration-placeholder"></view>
      <text class="title">我们需要知道你在哪里</text>
      <text class="description">这样才能带你去安静的地方</text>
      <button class="allow-button" @click="requestPermission">好的</button>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    goBack() {
      uni.navigateBack();
    },
    requestPermission() {
      uni.showToast({
        title: '感谢授权',
        icon: 'none'
      });
      setTimeout(() => {
        uni.navigateBack();
      }, 1000);
    }
  }
}
</script>

<style lang="scss">
@import '@/uni.scss';

.permission-page {
  height: 100vh;
  background-color: $bg-color-warm-sand;
  display: flex;
  flex-direction: column;
}

.nav-header {
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  margin-top: calc(env(safe-area-inset-top) + 6px);
}

.back-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 24px;
  padding-bottom: 20vh;
}

.illustration-placeholder {
  width: 200rpx;
  height: 200rpx;
  background-color: $aux-color-lavender;
  border-radius: 50%;
  margin-bottom: 24px;
}

.title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}

.description {
  font-size: 14px;
  color: #666;
  margin-bottom: 22px;
}

.allow-button {
  width: 520rpx;
  max-width: 520rpx;
  height: 92rpx;
  line-height: 92rpx;
  font-size: 16px;
  background-color: $primary-color-teal;
  color: white;
  border-radius: 46rpx;
}
</style>
