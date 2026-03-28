<template>
  <view class="detail-page">
    <scroll-view class="content" :scroll-y="true" :show-scrollbar="false">
      <view class="brand-card">
        <image class="brand-image" src="/static/images/beluge.png" mode="aspectFit" />
        <text class="brand-title">服务人员档案</text>
        <text class="brand-sub">查看被服务人员的五感偏好</text>
      </view>

      <view v-if="!servedProfile" class="empty-card">
        <text class="empty-title">尚未绑定</text>
        <text class="empty-desc">请在“寻找心青年”中输入邀请码进行绑定</text>
      </view>

      <view v-else>
        <view class="card">
          <text class="card-title">被服务人员</text>
          <view class="field">
            <text class="label">姓名</text>
            <text class="value">{{ servedProfile.name || '-' }}</text>
          </view>
          <view class="field">
            <text class="label">年龄</text>
            <text class="value">{{ servedProfile.age ? servedProfile.age + ' 岁' : '-' }}</text>
          </view>
          <view class="field">
            <text class="label">邀请码</text>
            <text class="value">{{ boundCode }}</text>
          </view>
          <view class="field multiline">
            <text class="label">自我介绍</text>
            <text class="value">{{ servedProfile.intro || '-' }}</text>
          </view>
        </view>

        <view class="card">
          <text class="card-title">五感雷达图</text>
          <radar-chart :values="servedSenses" />
        </view>

        <view class="card">
          <text class="card-title">游览注意事项</text>
          <view v-for="(tip, idx) in profileTips" :key="idx" class="tip-row">
            <uni-icons type="info-filled" size="16" color="#2C3E50"></uni-icons>
            <text class="tip-text">{{ tip }}</text>
          </view>
        </view>
      </view>
      <view class="content-bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script>
import RadarChart from '@/components/radar-chart/index.vue';

export default {
  components: { RadarChart },
  data() {
    return {
      servedProfile: null,
      boundCode: ''
    };
  },
  computed: {
    servedSenses() {
      const senses = this.servedProfile && Array.isArray(this.servedProfile.senses) ? this.servedProfile.senses : null;
      return senses && senses.length ? senses : [0, 0, 0, 0, 0];
    },
    profileTips() {
      if (!this.servedProfile) return [];
      const dims = ['视觉', '听觉', '触觉', '嗅觉', '味觉'];
      const tips = [];
      const senses = this.servedSenses;
      const ranked = senses
        .map((v, i) => ({ label: dims[i], value: Number(v) || 0 }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 2)
        .filter(item => item.value > 0);
      if (ranked.length) {
        ranked.forEach(item => {
          tips.push(`优先关注${item.label}刺激，提前提供可预期的提醒与缓冲时间。`);
        });
      }
      if (this.servedProfile.intro) {
        tips.push(`结合个人介绍沟通节奏：${this.servedProfile.intro}`);
      }
      tips.push('遇到拥挤或突发变化时，先暂停并提供安静过渡区域。');
      return tips;
    }
  },
  onShow() {
    this.load();
  },
  methods: {
    load() {
      const raw = uni.getStorageSync('ocean:auth');
      if (!raw) return;
      try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        this.servedProfile = parsed && parsed.servedProfile ? parsed.servedProfile : null;
        this.boundCode = parsed && parsed.boundCode ? parsed.boundCode : '';
      } catch (e) {
      }
    }
  }
};
</script>

<style lang="scss">
@import '@/uni.scss';

page {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.detail-page {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f7f7f7;
}

.content {
  flex: 1;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
}

.brand-card {
  border-radius: 19px;
  box-shadow: 3px 2px 4px rgba(0, 0, 0, 0.25);
  background-color: #f7f7f7;
  padding: 28px 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 14px;
}

.brand-image {
  width: 160px;
  height: 198px;
}

.brand-title {
  margin-top: 10px;
  font-size: 22px;
  font-weight: 600;
  color: #3282d4;
}

.brand-sub {
  margin-top: 6px;
  font-size: 14px;
  color: rgba(50, 130, 212, 0.92);
}

.card {
  background-color: #ffffff;
  border-radius: 18px;
  padding: 14px;
  margin-bottom: 14px;
}

.empty-card {
  background-color: #ffffff;
  border-radius: 18px;
  padding: 18px 14px;
}

.empty-title {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: #2C3E50;
  text-align: center;
}

.empty-desc {
  display: block;
  margin-top: 10px;
  font-size: 13px;
  color: rgba(44, 62, 80, 0.72);
  text-align: center;
}

.card-title {
  display: block;
  font-size: 15px;
  font-weight: 700;
  color: #2C3E50;
  margin-bottom: 12px;
}

.field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 10px;
}

.field.multiline {
  align-items: flex-start;
}

.label {
  width: 84px;
  font-size: 13px;
  color: rgba(44, 62, 80, 0.6);
}

.value {
  flex: 1;
  text-align: right;
  font-size: 13px;
  color: rgba(44, 62, 80, 0.9);
  line-height: 18px;
}

.tip-row {
  margin-top: 10px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.tip-row:first-of-type {
  margin-top: 0;
}

.tip-text {
  flex: 1;
  font-size: 13px;
  line-height: 20px;
  color: rgba(44, 62, 80, 0.9);
}

.content-bottom-space {
  height: calc(24px + env(safe-area-inset-bottom));
}
</style>
