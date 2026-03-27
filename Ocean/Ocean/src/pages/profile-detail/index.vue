<template>
  <view class="detail-page">
    <scroll-view class="content" :scroll-y="true" :show-scrollbar="false">
      <view class="user-info-card">
        <image class="avatar" :src="profile.avatarUrl" mode="aspectFill" />
        <view class="info-content">
          <text class="user-id">ID: {{ profile.id }}</text>
          <view class="user-tags">
            <text class="tag">{{ profile.gender }}</text>
            <text class="tag">{{ profile.age }}岁</text>
          </view>
        </view>
        <view class="edit-btn" @click="goEdit">
          <uni-icons type="compose" size="20" color="#ffffff"></uni-icons>
        </view>
      </view>

      <view class="card">
        <text class="card-title">基本信息</text>
        <view class="field">
          <text class="label">姓名</text>
          <text class="value">{{ profile.name }}</text>
        </view>
        <view class="field">
          <text class="label">年龄</text>
          <text class="value">{{ profile.age }} 岁</text>
        </view>
        <view class="field multiline">
          <text class="label">自我介绍</text>
          <text class="value">{{ profile.intro }}</text>
        </view>
      </view>

      <view v-if="hasEvaluation" class="card">
        <text class="card-title">测评结果</text>
        <radar-chart :values="profile.senses" />
      </view>

      <view v-else class="card">
        <text class="card-title">感官测评</text>
        <text class="card-desc">完成问卷后会生成你的五感雷达图，帮助我们提供更友好的游览建议。</text>
        <button class="primary-btn" @click="goQuestionnaire">填写问卷</button>
      </view>

      <view v-if="hasEvaluation" class="card">
        <text class="card-title">重新测评</text>
        <text class="card-desc">如需更新结果，可重新填写问卷。</text>
        <button class="secondary-btn" @click="retakeQuestionnaire">重新测评</button>
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
      profile: {
        id: '10086',
        gender: '男',
        avatarUrl: '/static/images/mascot.png',
        name: '',
        age: 0,
        intro: '',
        senses: [0, 0, 0, 0, 0]
      },
      hasEvaluation: false
    };
  },
  onShow() {
    this.load();
    this.refreshEvaluation();
  },
  methods: {
    load() {
      const raw = uni.getStorageSync('ocean:auth');
      if (!raw) return;
      try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        const vp = parsed && parsed.visitorProfile ? parsed.visitorProfile : null;
        if (parsed && parsed.avatarUrl) this.profile.avatarUrl = parsed.avatarUrl;
        if (vp) this.profile = { ...this.profile, ...vp };
      } catch (e) {
      }
    },
    refreshEvaluation() {
      const lastUpdatedAt = uni.getStorageSync('ocean:userdata:lastUpdatedAt');
      const userdata = this.readUserdata();
      if (!lastUpdatedAt || !userdata) {
        this.hasEvaluation = false;
        return;
      }
      const senses = this.calcSensesFromUserdata(userdata);
      const valid = senses.some(v => Number(v) > 0);
      if (!valid) {
        this.hasEvaluation = false;
        return;
      }
      this.hasEvaluation = true;
      this.profile.senses = senses;
      this.saveSensesToAuth(senses);
    },
    readUserdata() {
      const raw = uni.getStorageSync('ocean:sensory_matrix') || uni.getStorageSync('ocean:userdata');
      if (!raw) return null;
      try {
        return typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch (e) {
        return null;
      }
    },
    avgRaw(list) {
      if (!Array.isArray(list) || !list.length) return 0;
      const nums = list
        .map(i => (i && typeof i.raw !== 'undefined' ? Number(i.raw) : NaN))
        .filter(n => !Number.isNaN(n));
      if (!nums.length) return 0;
      const sum = nums.reduce((a, b) => a + b, 0);
      return Number((sum / nums.length).toFixed(1));
    },
    calcSensesFromUserdata(userdata) {
      const visual = this.avgRaw(userdata.visual);
      const auditory = this.avgRaw(userdata.auditory);
      const tactile = this.avgRaw(userdata.tactile);
      const olfactory = this.avgRaw(userdata.olfactory);
      const taste = this.avgRaw(userdata.taste);
      return [visual, auditory, tactile, olfactory, taste];
    },
    saveSensesToAuth(senses) {
      const raw = uni.getStorageSync('ocean:auth');
      let auth = null;
      try {
        auth = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null;
      } catch (e) {
        auth = null;
      }
      auth = auth && typeof auth === 'object' ? auth : {};
      const vp = auth.visitorProfile && typeof auth.visitorProfile === 'object' ? auth.visitorProfile : {};
      vp.senses = senses;
      auth.visitorProfile = vp;
      uni.setStorageSync('ocean:auth', JSON.stringify(auth));
    },
    goQuestionnaire() {
      uni.navigateTo({ url: '/pages/questionnaire/index' });
    },
    retakeQuestionnaire() {
      try {
        uni.removeStorageSync('ocean:sensoryAnswers');
        uni.removeStorageSync('ocean:userdata');
        uni.removeStorageSync('ocean:userdata_json');
        uni.removeStorageSync('ocean:userdata:lastUpdatedAt');
      } catch (e) {
      }
      this.hasEvaluation = false;
      this.profile.senses = [0, 0, 0, 0, 0];
      this.saveSensesToAuth(this.profile.senses);
      uni.navigateTo({ url: '/pages/questionnaire/index' });
    },
    goEdit() {
      uni.showToast({ title: '开发中', icon: 'none' });
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

.user-info-card {
  border-radius: 18px;
  background-color: #4276FC;
  padding: 20px 16px;
  display: flex;
  align-items: center;
  margin-bottom: 14px;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background-color: #ffffff;
  margin-right: 14px;
  flex-shrink: 0;
}

.info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.user-id {
  font-size: 18px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 8px;
}

.user-tags {
  display: flex;
  gap: 8px;
}

.tag {
  background-color: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 12px;
}

.edit-btn {
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card {
  background-color: #ffffff;
  border-radius: 18px;
  padding: 14px;
  margin-bottom: 14px;
}

.card-title {
  display: block;
  font-size: 15px;
  font-weight: 700;
  color: #2C3E50;
  margin-bottom: 12px;
}

.card-desc {
  display: block;
  font-size: 13px;
  color: rgba(44, 62, 80, 0.72);
  line-height: 18px;
}

.primary-btn {
  margin-top: 14px;
  width: 100%;
  height: 46px;
  border-radius: 14px;
  padding: 0;
  border: none;
  background-color: #4276FC;
  color: #ffffff;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.primary-btn::after {
  border: none;
}

.secondary-btn {
  margin-top: 14px;
  width: 100%;
  height: 46px;
  border-radius: 14px;
  padding: 0;
  border: none;
  background-color: rgba(44, 62, 80, 0.06);
  color: #2C3E50;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.secondary-btn::after {
  border: none;
}

.field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 10px;
}

.field:first-of-type {
  margin-top: 0;
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

.content-bottom-space {
  height: calc(24px + env(safe-area-inset-bottom));
}
</style>
