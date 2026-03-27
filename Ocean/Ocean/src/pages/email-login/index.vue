<template>
  <view class="auth-page">
    <view class="auth-shell">
      <image class="auth-brand" src="/static/images/beluge.png" mode="aspectFit" />
      <text class="auth-title">邮箱登录</text>
      <text class="auth-sub">输入邮箱和密码完成登录</text>
      <input class="auth-input" v-model="email" placeholder="请输入邮箱" />
      <input class="auth-input" v-model="password" type="password" password placeholder="请输入密码" />
      <button class="auth-btn primary" @click="submitLogin">登录</button>
      <view class="demo-line">
        <text class="demo-text">测试账号：demo@ocean.com / Ocean123456</text>
      </view>
      <view class="auth-link-line" @click="goRegister">
        <text class="auth-link-text">无账号，</text>
        <text class="auth-link">去注册</text>
      </view>
    </view>
  </view>
</template>

<script>
const SUPABASE_URL = 'https://sxqkqpspnzaeeoiypqxg.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4cWtxcHNwbnphZWVvaXlwcXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNTQ3NDUsImV4cCI6MjA4OTkzMDc0NX0.SSkEU8-SLzt_iUeSpgH-k_J6TBrHzoUwVL9l7pIPUFY'
const DEMO_EMAIL = 'demo@ocean.com'
const DEMO_PASSWORD = 'Ocean123456'

export default {
  data() {
    return {
      role: 'visitor',
      email: '',
      password: ''
    };
  },
  onLoad(query) {
    const q = query || {};
    if (q.role) this.role = this.safeDecode(q.role);
    if (q.email) this.email = this.safeDecode(q.email);
  },
  methods: {
    authRequest(url, data) {
      return new Promise((resolve, reject) => {
        uni.request({
          url,
          method: 'POST',
          data,
          header: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          success: (res) => {
            const body = res && typeof res.data === 'object' ? res.data : {}
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ data: body, error: null })
              return
            }
            resolve({
              data: null,
              error: {
                message: body.msg || body.error_description || body.error || '账号或密码错误'
              }
            })
          },
          fail: (err) => reject(err)
        })
      })
    },
    safeDecode(v) {
      try {
        return decodeURIComponent(String(v || ''));
      } catch (e) {
        return String(v || '');
      }
    },
    normalizeEmail(v) {
      return String(v || '').trim().toLowerCase();
    },
    ensureFirstLoginPlannerState(userId) {
      const id = String(userId || '').trim();
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
    syncVisitorInviteDirectory(auth) {
      if (!auth || auth.role !== 'visitor') return;
      const inviteCode = String(auth.inviteCode || '').trim();
      if (!inviteCode) return;
      const vp = auth.visitorProfile && typeof auth.visitorProfile === 'object' ? auth.visitorProfile : {};
      const senses = Array.isArray(vp.senses) && vp.senses.length ? vp.senses : [0, 0, 0, 0, 0];
      let directory = {};
      try {
        const raw = uni.getStorageSync('ocean:inviteDirectory');
        const parsed = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : {};
        directory = parsed && typeof parsed === 'object' ? parsed : {};
      } catch (e) {
        directory = {};
      }
      directory[inviteCode] = {
        name: vp.name || auth.nickname || '心青年',
        age: vp.age || 0,
        intro: vp.intro || '',
        senses
      };
      uni.setStorageSync('ocean:inviteDirectory', JSON.stringify(directory));
    },
    applyLoginAuth({ userId, email, role, nickname }) {
      let auth = {};
      try {
        const raw = uni.getStorageSync('ocean:auth');
        const parsed = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : {};
        auth = parsed && typeof parsed === 'object' ? parsed : {};
      } catch (e) {
        auth = {};
      }
      auth.loggedIn = true;
      auth.role = role || 'visitor';
      auth.avatarUrl = auth.avatarUrl || '/static/images/beluge.png';
      auth.nickname = String(nickname || email.split('@')[0] || '用户').trim();
      auth.userId = String(userId || `email:${email}`);
      this.ensureFirstLoginPlannerState(auth.userId);
      uni.setStorageSync('ocean:auth', JSON.stringify(auth));
      this.syncVisitorInviteDirectory(auth);
      uni.showToast({ title: '登录成功', icon: 'none' });
      uni.switchTab({ url: '/pages/profile/index' });
    },
    async submitLogin() {
      const email = this.normalizeEmail(this.email);
      const password = String(this.password || '').trim();
      if (!email || !password) {
        uni.showToast({ title: '请输入邮箱和密码', icon: 'none' });
        return;
      }
      let data = null
      let error = null
      try {
        const result = await this.authRequest(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
          email,
          password
        })
        data = result.data
        error = result.error
      } catch (e) {
        error = { message: '网络异常，请稍后重试' }
      }
      if (error || !data || !data.user) {
        if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
          this.applyLoginAuth({
            userId: 'local-demo-user',
            email,
            role: this.role || 'visitor',
            nickname: 'demo'
          });
          return;
        }
        uni.showToast({ title: error && error.message ? error.message : '账号或密码错误', icon: 'none' });
        return;
      }
      const user = data.user;
      const userMeta = user.user_metadata && typeof user.user_metadata === 'object' ? user.user_metadata : {};
      const nickname = String(userMeta.nickname || email.split('@')[0] || '用户').trim();
      const cloudRole = String(userMeta.role || '').trim();
      this.applyLoginAuth({
        userId: String(user.id || `email:${email}`),
        email,
        role: this.role || cloudRole || 'visitor',
        nickname
      });
    },
    goRegister() {
      uni.redirectTo({ url: `/pages/register/index?role=${encodeURIComponent(this.role || 'visitor')}&email=${encodeURIComponent(this.email || '')}` });
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

.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  box-sizing: border-box;
}

.auth-shell {
  width: 100%;
  max-width: 620rpx;
  background-color: #faf8f5;
  border-radius: 18px;
  padding: 44px 36px 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.auth-brand {
  width: 156px;
  height: 196px;
}

.auth-title {
  margin-top: 14px;
  line-height: 30px;
  color: #3282d4;
  font-size: 22px;
  font-weight: 500;
  text-align: center;
}

.auth-sub {
  margin-top: 8px;
  line-height: 22px;
  color: #3282d4;
  font-size: 17px;
  text-align: center;
}

.auth-input {
  margin-top: 14px;
  width: 100%;
  height: 52px;
  border-radius: 16px;
  background-color: rgba(44, 62, 80, 0.06);
  padding: 0 14px;
  box-sizing: border-box;
  font-size: 16px;
  color: #2C3E50;
}

.auth-btn {
  margin-top: 20px;
  width: 100%;
  height: 52px;
  border-radius: 16px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #ffffff;
}

.auth-btn::after {
  border: none;
}

.auth-btn.primary {
  background-color: #2a73ca;
}

.auth-link-line {
  margin-top: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.demo-line {
  margin-top: 12px;
}

.demo-text {
  font-size: 12px;
  color: rgba(44, 62, 80, 0.7);
}

.auth-link-text {
  font-size: 13px;
  color: #434343;
}

.auth-link {
  font-size: 13px;
  color: #2a73ca;
  text-decoration: underline;
}
</style>
