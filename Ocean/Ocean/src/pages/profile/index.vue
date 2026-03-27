<template>
  <view class="profile-page">
    <view v-if="stage === 'home'" class="content">
      <scroll-view class="home-scroll" :style="{ height: windowHeight + 'px' }" :scroll-y="true" :show-scrollbar="false">
        <view class="section">
          <view class="home">
            <view class="account-card" :class="auth.role === 'companion' ? 'orange' : 'blue'" @click="goAccountDetail">
              <image class="account-avatar" :src="auth.avatarUrl" mode="aspectFill" />
              <view class="account-meta">
                <text class="account-name">{{ auth.nickname }}</text>
                <text class="account-role">{{ roleText(auth.role) }}</text>
              </view>
            </view>

            <view class="menu-card" @click="goProfileDetail">
              <text class="menu-title">{{ auth.role === 'companion' ? '服务人员档案' : '个人档案' }}</text>
              <text class="menu-sub">查看五感雷达图</text>
            </view>

            <view class="menu-card" @click="goHelpAction">
              <text class="menu-title">{{ auth.role === 'companion' ? '寻找心青年' : '寻找帮助' }}</text>
              <text class="menu-sub">{{ auth.role === 'companion' ? '输入游客邀请码并绑定档案' : '查看邀请码、热线与感官友好书包申请' }}</text>
            </view>
          </view>
        </view>

        <view class="bottom-spacer"></view>
      </scroll-view>
    </view>

    <view v-else class="fixed-content">
      <view class="nav-header">
        <view class="back-btn" @click="handleLoginBack">
          <uni-icons type="left" size="20" color="#333"></uni-icons>
        </view>
      </view>
      <view class="section">
        <view v-if="stage === 'role'" class="login-shell">
          <image class="login-brand" src="/static/images/beluge.png" mode="aspectFit" />
          <text class="login-title">欢迎游览长乔海洋公园</text>
          <text class="login-sub">登录获取更多帮助~</text>
          <view class="login-actions">
            <button class="login-btn primary" @click="chooseRole('visitor')">游客登录</button>
            <button class="login-btn secondary" @click="chooseRole('companion')">伴游登录</button>
          </view>
        </view>

        <view v-else-if="stage === 'login'" class="login-shell">
          <image class="login-brand" src="/static/images/beluge.png" mode="aspectFit" />
          <text class="login-title">欢迎游览长乔海洋公园</text>
          <text class="login-sub">请选择登录方式</text>
          <view class="login-actions">
            <button class="login-btn primary" @click="getWeChatAccount">获取当前微信账号</button>
            <button class="login-btn secondary" @click="goOtherLogin">其他方式登录</button>
          </view>
          <view class="guest-line" @click="goRegister">
            <text class="guest-text">无账号，</text>
            <text class="guest-link">去注册</text>
          </view>
        </view>
      </view>
    </view>

  </view>
</template>

<script>
export default {
  data() {
    return {
      windowHeight: uni.getSystemInfoSync().windowHeight,
      stage: 'role',
      pendingRole: '',
      auth: {
        loggedIn: false,
        role: '',
        avatarUrl: '/static/images/mascot.png',
        nickname: '未登录',
        inviteCode: 'ARqfsvbwu',
        userId: '',
        boundCode: '',
        visitorProfile: {
          name: '王小白',
          age: 8,
          intro: '我喜欢安静的环境，拥挤时需要一点时间适应。',
          senses: [3, 2, 3, 1, 2]
        },
        servedProfile: null
      },
      
    }
  },
  onShow() {
    this.loadAuth();
  },
  methods: {
    roleText(role) {
      return role === 'companion' ? '伴游' : role === 'visitor' ? '游客' : '未选择';
    },
    loadAuth() {
      const raw = uni.getStorageSync('ocean:auth');
      if (!raw) {
        this.stage = 'role';
        return;
      }
      try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (parsed && typeof parsed === 'object') {
          this.auth = { ...this.auth, ...parsed };
        }
      } catch (e) {
      }

      if (this.auth.loggedIn) {
        this.stage = 'home';
        this.syncVisitorInviteDirectory();
      } else if (this.auth.role) {
        this.pendingRole = this.auth.role;
        this.stage = 'login';
      } else {
        this.stage = 'role';
      }
    },
    handleLoginBack() {
      if (this.stage === 'login') {
        this.stage = 'role';
        this.pendingRole = '';
      } else if (this.stage === 'role') {
        uni.switchTab({ url: '/pages/planner/index' });
      }
    },
    saveAuth() {
      uni.setStorageSync('ocean:auth', JSON.stringify(this.auth));
      this.syncBackendProfilePayload();
    },
    syncBackendProfilePayload() {
      const vp = this.auth.visitorProfile && typeof this.auth.visitorProfile === 'object' ? this.auth.visitorProfile : {};
      const profilePayload = {
        user_id: this.auth.userId || '',
        role: this.auth.role || '',
        nickname: this.auth.nickname || '',
        avatar_url: this.auth.avatarUrl || '',
        invite_code: this.auth.inviteCode || '',
        bound_code: this.auth.boundCode || ''
      };
      const visitorProfilePayload = {
        name: vp.name || '',
        age: Number(vp.age) || 0,
        intro: vp.intro || ''
      };
      uni.setStorageSync('ocean:backend:profile', JSON.stringify(profilePayload));
      uni.setStorageSync('ocean:backend:visitor_profile', JSON.stringify(visitorProfilePayload));
    },
    resolveUserId(userInfo, role) {
      const profile = userInfo && typeof userInfo === 'object' ? userInfo : {};
      const fromAuth = (this.auth.openid || this.auth.openId || this.auth.userId || '').trim();
      const fromProfile = (profile.openid || profile.openId || profile.unionId || '').trim();
      if (fromProfile) return fromProfile;
      if (fromAuth) return fromAuth;
      const baseRole = (role || this.auth.role || 'visitor').trim();
      const baseName = (profile.nickName || profile.nickname || this.auth.nickname || 'guest').trim();
      const baseAvatar = (profile.avatarUrl || this.auth.avatarUrl || '').trim();
      const avatarTail = baseAvatar ? baseAvatar.slice(-12) : 'default';
      return `${baseRole}:${baseName}:${avatarTail}`;
    },
    ensureFirstLoginPlannerState(userId) {
      const id = (userId || '').trim();
      if (!id) return;
      let firstLoginMap = {};
      try {
        const raw = uni.getStorageSync('ocean:planner:firstLoginByUser');
        const parsed = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : {};
        firstLoginMap = parsed && typeof parsed === 'object' ? parsed : {};
      } catch (e) {
        firstLoginMap = {};
      }
      if (firstLoginMap[id]) return;
      uni.removeStorageSync('ocean:itinerary');
      uni.removeStorageSync('ocean:backend:pre_trip');
      firstLoginMap[id] = true;
      uni.setStorageSync('ocean:planner:firstLoginByUser', JSON.stringify(firstLoginMap));
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
    sensesFromUserdata() {
      const userdata = this.readUserdata();
      if (!userdata) return [0, 0, 0, 0, 0];
      const visual = this.avgRaw(userdata.visual);
      const auditory = this.avgRaw(userdata.auditory);
      const tactile = this.avgRaw(userdata.tactile);
      const olfactory = this.avgRaw(userdata.olfactory);
      const taste = this.avgRaw(userdata.taste);
      return [visual, auditory, tactile, olfactory, taste];
    },
    syncVisitorInviteDirectory() {
      if (this.auth.role !== 'visitor') return;
      const inviteCode = (this.auth.inviteCode || '').trim();
      if (!inviteCode) return;
      const vp = this.auth.visitorProfile && typeof this.auth.visitorProfile === 'object' ? this.auth.visitorProfile : {};
      const senses = Array.isArray(vp.senses) && vp.senses.length ? vp.senses : this.sensesFromUserdata();
      let directory = {};
      try {
        const raw = uni.getStorageSync('ocean:inviteDirectory');
        const parsed = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : {};
        directory = parsed && typeof parsed === 'object' ? parsed : {};
      } catch (e) {
        directory = {};
      }
      directory[inviteCode] = {
        name: vp.name || this.auth.nickname || '心青年',
        age: vp.age || 0,
        intro: vp.intro || '',
        senses
      };
      uni.setStorageSync('ocean:inviteDirectory', JSON.stringify(directory));
    },
    chooseRole(role) {
      this.pendingRole = role;
      this.auth.role = role;
      this.auth.loggedIn = false;
      this.saveAuth();
      this.stage = 'login';
    },
    skipLogin() {
      this.pendingRole = '';
      this.auth.loggedIn = false;
      this.auth.role = '';
      this.saveAuth();
      this.stage = 'role';
    },
    getWeChatAccount() {
      const role = this.pendingRole || this.auth.role;
      if (!role) return;
      uni.getUserProfile({
        desc: '用于完善账号信息',
        success: res => {
          const userInfo = res && res.userInfo ? res.userInfo : {};
          const avatarUrl = userInfo.avatarUrl || this.auth.avatarUrl;
          const nickName = userInfo.nickName || userInfo.nickname || this.auth.nickname;

          this.auth.loggedIn = true;
          this.auth.role = role;
          this.auth.avatarUrl = avatarUrl;
          this.auth.nickname = nickName || '游客';
          this.auth.userId = this.resolveUserId(userInfo, role);
          this.ensureFirstLoginPlannerState(this.auth.userId);
          this.saveAuth();
          this.syncVisitorInviteDirectory();
          this.stage = 'home';
          uni.switchTab({ url: '/pages/profile/index' });
        },
        fail: () => {
          uni.showToast({ title: '未授权获取账号信息', icon: 'none' });
        }
      });
    },
    goOtherLogin() {
      this.goEmailLogin();
    },
    goEmailLogin() {
      const role = this.pendingRole || this.auth.role || 'visitor';
      uni.navigateTo({ url: `/pages/email-login/index?role=${encodeURIComponent(role)}` });
    },
    goRegister() {
      const role = this.pendingRole || this.auth.role || 'visitor';
      uni.navigateTo({ url: `/pages/register/index?role=${encodeURIComponent(role)}` });
    },
    browseAsVisitor() {
      this.pendingRole = '';
      this.auth.loggedIn = false;
      this.auth.role = '';
      this.saveAuth();
      this.stage = 'role';
      uni.switchTab({ url: '/pages/map/index' });
    },
    goAccountDetail() {
      uni.navigateTo({ url: '/pages/account-detail/index' });
    },
    goProfileDetail() {
      if (this.auth.role === 'companion') {
        uni.navigateTo({ url: '/pages/service-profile-detail/index' });
      } else {
        uni.navigateTo({ url: '/pages/profile-detail/index' });
      }
    },
    goHelpAction() {
      if (this.auth.role === 'companion') {
        uni.navigateTo({ url: '/pages/find-young/index' });
      } else {
        uni.navigateTo({ url: '/pages/help/index' });
      }
    }
  }
}
</script>

<style lang="scss">
@import '@/uni.scss';

page {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.profile-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.content {
  flex: 1;
  background-color: #f7f7f7;
}

.home-scroll {
  flex: 1;
}

.fixed-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f7f7f7;
}

.nav-header {
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  margin-top: calc(env(safe-area-inset-top) + 6px);
}

.back-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content .section {
  padding: 16px 16px 0;
}

.fixed-content .section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px 20px;
}

.login-shell {
  width: 100%;
  max-width: 620rpx;
  background-color: #faf8f5;
  border-radius: 18px;
  padding: 44px 36px 48px;
  min-height: 460px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.login-brand {
  width: 156px;
  height: 196px;
}

.login-title {
  margin-top: 14px;
  line-height: 30px;
  letter-spacing: 0;
  color: #3282d4;
  font-size: 22px;
  font-weight: 500;
  text-align: center;
}

.login-sub {
  margin-top: 8px;
  line-height: 22px;
  letter-spacing: 0;
  color: #3282d4;
  font-size: 17px;
  text-align: center;
}

.login-actions {
  margin-top: 34px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.login-btn {
  width: 100%;
  height: 52px;
  border-radius: 16px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.18);
  padding: 0;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  line-height: 26px;
  color: #ffffff;
}

.login-btn::after {
  border: none;
}

.login-btn.primary {
  background-color: #2a73ca;
}

.login-btn.secondary {
  background-color: #98e555;
}

.guest-line {
  margin-top: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.guest-text {
  font-size: 13px;
  color: #434343;
}

.guest-link {
  font-size: 13px;
  color: #2a73ca;
  text-decoration: underline;
}

.auth-card {
  background-color: #ffffff;
  border-radius: 18px;
  padding: 18px 14px;
}

.auth-title {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: #2C3E50;
  text-align: center;
}

.auth-sub {
  display: block;
  margin-top: 10px;
  font-size: 13px;
  color: rgba(44, 62, 80, 0.7);
  text-align: center;
}

.role-grid {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.role-item {
  border-radius: 16px;
  background-color: rgba(44, 62, 80, 0.06);
  padding: 14px;
}

.role-name {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: #2C3E50;
}

.role-desc {
  display: block;
  margin-top: 6px;
  font-size: 13px;
  color: rgba(44, 62, 80, 0.7);
}

.auth-actions {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.auth-btn {
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

.auth-btn::after {
  border: none;
}

.auth-btn.primary {
  background-color: #4276FC;
  color: #ffffff;
}

.home {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.account-card {
  border-radius: 18px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.10);
  width: 100%;
}

.account-card.blue {
  background-color: #4276FC;
}

.account-card.orange {
  background-color: #FF9F4A;
}

.account-avatar {
  width: 62px;
  height: 62px;
  border-radius: 31px;
  background-color: rgba(255, 255, 255, 0.35);
}

.account-meta {
  flex: 1;
}

.account-name {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
}

.account-role {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.88);
}

.menu-card {
  background-color: #ffffff;
  border-radius: 18px;
  padding: 16px;
  width: 100%;
}

.menu-title {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: #2C3E50;
}

.menu-sub {
  display: block;
  margin-top: 6px;
  font-size: 13px;
  color: rgba(44, 62, 80, 0.7);
}

.bottom-spacer {
  height: 110px;
}

</style>
