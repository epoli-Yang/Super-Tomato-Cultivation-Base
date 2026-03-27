<template>
  <view class="auth-page">
    <view class="auth-shell">
      <image class="auth-brand" src="/static/images/beluge.png" mode="aspectFit" />
      <text class="auth-title">邮箱注册</text>
      <text class="auth-sub">输入邮箱和密码创建账号</text>
      <input class="auth-input" v-model="email" placeholder="请输入邮箱" />
      <input class="auth-input" v-model="password" type="password" password placeholder="请输入密码" />
      <button class="auth-btn primary" @click="submitRegister">注册账号</button>
      <view class="auth-link-line" @click="goEmailLogin">
        <text class="auth-link-text">已有账号，</text>
        <text class="auth-link">去登录</text>
      </view>
    </view>
  </view>
</template>

<script>
const SUPABASE_URL = 'https://sxqkqpspnzaeeoiypqxg.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4cWtxcHNwbnphZWVvaXlwcXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNTQ3NDUsImV4cCI6MjA4OTkzMDc0NX0.SSkEU8-SLzt_iUeSpgH-k_J6TBrHzoUwVL9l7pIPUFY'

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
                message: body.msg || body.error_description || body.error || '注册失败'
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
    submitRegister() {
      const email = this.normalizeEmail(this.email);
      const password = String(this.password || '').trim();
      if (!email || !password) {
        uni.showToast({ title: '请输入邮箱和密码', icon: 'none' });
        return;
      }
      if (password.length < 6) {
        uni.showToast({ title: '密码至少6位', icon: 'none' });
        return;
      }
      this.registerBySupabase(email, password);
    },
    async registerBySupabase(email, password) {
      const nickname = email.split('@')[0] || '用户';
      try {
        const { error } = await this.authRequest(`${SUPABASE_URL}/auth/v1/signup`, {
          email,
          password,
          data: {
            role: this.role || 'visitor',
            nickname
          }
        });
        if (error) {
          uni.showToast({ title: error.message || '注册失败', icon: 'none' });
          return;
        }
      } catch (e) {
        uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' });
        return;
      }
      uni.showToast({ title: '注册成功，请登录', icon: 'none' });
      uni.navigateTo({ url: `/pages/email-login/index?role=${encodeURIComponent(this.role || 'visitor')}&email=${encodeURIComponent(email)}` });
    },
    goEmailLogin() {
      uni.navigateTo({ url: `/pages/email-login/index?role=${encodeURIComponent(this.role || 'visitor')}&email=${encodeURIComponent(this.email || '')}` });
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
