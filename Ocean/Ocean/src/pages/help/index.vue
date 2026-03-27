<template>
  <view class="help-page">
    <scroll-view class="help-scroll" :scroll-y="true" :show-scrollbar="false">
      <view class="help-section">
        <view class="help-card">
          <view class="card-head">
            <uni-icons type="person-filled" size="18" color="#2C3E50"></uni-icons>
            <text class="card-title">伴游人员邀请码</text>
          </view>
          <view class="invite-row" @click="copyInviteCode">
            <text class="invite-code">{{ inviteCode }}</text>
            <view class="invite-copy">点击复制</view>
          </view>
          <text class="card-tip">出示邀请码给工作人员，快速建立协助关系。</text>
        </view>

        <view class="help-card">
          <view class="card-head">
            <uni-icons type="phone-filled" size="18" color="#2C3E50"></uni-icons>
            <text class="card-title">场馆帮助热线</text>
          </view>
          <text class="contact-line">电话：400-000-0000</text>
          <text class="contact-line">微信：长乔海洋公园</text>
          <image class="contact-qr" :src="qrCodeUrl" mode="aspectFit" />
          <text class="card-tip">扫码可联系场馆客服获取帮助。</text>
        </view>

        <view class="help-card">
          <view class="card-head">
            <uni-icons type="medal-filled" size="18" color="#2C3E50"></uni-icons>
            <text class="card-title">感官友好书包</text>
          </view>
          <button
            class="apply-btn"
            :class="{ done: appliedSensoryPack }"
            @click="applySensoryPack"
          >
            {{ appliedSensoryPack ? '已申请感官友好书包' : '申请感官友好书包' }}
          </button>
          <view v-if="appliedSensoryPack" class="apply-info">
            <text class="apply-line">申请状态：{{ sensoryPackText }}</text>
            <text class="apply-line">申请时间：{{ sensoryPackTime }}</text>
            <text class="apply-line">关联邀请码：{{ inviteCode }}</text>
          </view>
        </view>
      </view>
      <view class="bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      auth: {
        inviteCode: 'ARqfsvbwu',
        sensoryPackApplication: null
      },
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=%E9%95%BF%E4%B9%94%E6%B5%B7%E6%B4%8B%E5%85%AC%E5%9B%AD%E5%AE%A2%E6%9C%8D'
    };
  },
  computed: {
    inviteCode() {
      return (this.auth && this.auth.inviteCode) || 'ARqfsvbwu';
    },
    appliedSensoryPack() {
      const info = this.auth && this.auth.sensoryPackApplication;
      return !!(info && info.applied);
    },
    sensoryPackText() {
      const info = this.auth && this.auth.sensoryPackApplication;
      return (info && info.text) || '已申请感官友好书包';
    },
    sensoryPackTime() {
      const info = this.auth && this.auth.sensoryPackApplication;
      return (info && info.appliedAt) || '-';
    }
  },
  onShow() {
    this.loadAuth();
  },
  methods: {
    loadAuth() {
      const raw = uni.getStorageSync('ocean:auth');
      if (!raw) return;
      try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (parsed && typeof parsed === 'object') {
          this.auth = { ...this.auth, ...parsed };
        }
      } catch (e) {
      }
    },
    saveAuth() {
      uni.setStorageSync('ocean:auth', JSON.stringify(this.auth));
    },
    copyInviteCode() {
      uni.setClipboardData({
        data: this.inviteCode,
        success: () => {
          uni.showToast({ title: '邀请码已复制', icon: 'none' });
        }
      });
    },
    applySensoryPack() {
      if (this.appliedSensoryPack) {
        uni.showToast({ title: '已申请感官友好书包', icon: 'none' });
        return;
      }
      const now = new Date();
      const month = `${now.getMonth() + 1}`.padStart(2, '0');
      const day = `${now.getDate()}`.padStart(2, '0');
      const hour = `${now.getHours()}`.padStart(2, '0');
      const minute = `${now.getMinutes()}`.padStart(2, '0');
      this.auth.sensoryPackApplication = {
        applied: true,
        text: '已申请感官友好书包',
        appliedAt: `${now.getFullYear()}-${month}-${day} ${hour}:${minute}`
      };
      this.saveAuth();
      uni.showToast({ title: '已申请感官友好书包', icon: 'none' });
    }
  }
}
</script>

<style lang="scss">
@import '@/uni.scss';

page {
  background-color: #f7f9f9;
}

.help-page {
  min-height: 100vh;
  background-color: #f7f9f9;
}

.help-scroll {
  height: 100vh;
}

.help-section {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.help-card {
  background-color: #faf8f5;
  border-radius: 24rpx;
  padding: 28rpx;
}

.card-head {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #2C3E50;
}

.invite-row {
  margin-top: 20rpx;
  background-color: rgba(44, 62, 80, 0.06);
  border-radius: 20rpx;
  min-height: 88rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.invite-code {
  font-size: 40rpx;
  line-height: 56rpx;
  color: #2C3E50;
  font-weight: 700;
}

.invite-copy {
  min-height: 88rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background-color: rgba(66, 118, 252, 0.12);
  color: #4276FC;
  font-size: 28rpx;
  display: flex;
  align-items: center;
}

.card-tip {
  margin-top: 16rpx;
  display: block;
  font-size: 26rpx;
  line-height: 38rpx;
  color: rgba(44, 62, 80, 0.72);
}

.contact-line {
  margin-top: 14rpx;
  display: block;
  font-size: 30rpx;
  line-height: 42rpx;
  color: rgba(44, 62, 80, 0.85);
}

.contact-qr {
  margin-top: 20rpx;
  width: 280rpx;
  height: 280rpx;
  border-radius: 20rpx;
  background-color: #f7f9f9;
}

.apply-btn {
  margin-top: 20rpx;
  width: 100%;
  min-height: 88rpx;
  border-radius: 20rpx;
  border: none;
  padding: 0 24rpx;
  background-color: #2a73ca;
  color: #ffffff;
  font-size: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.apply-btn::after {
  border: none;
}

.apply-btn.done {
  background-color: #4c8c4a;
}

.apply-info {
  margin-top: 16rpx;
  border-radius: 16rpx;
  background-color: rgba(76, 140, 74, 0.12);
  padding: 16rpx;
}

.apply-line {
  display: block;
  font-size: 26rpx;
  line-height: 38rpx;
  color: #2C3E50;
}

.bottom-space {
  height: calc(120rpx + env(safe-area-inset-bottom));
}
</style>
