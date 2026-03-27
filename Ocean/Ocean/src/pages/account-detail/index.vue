<template>
  <view class="account-detail-page">
    <scroll-view class="content" :scroll-y="true" :show-scrollbar="false">
      <view class="card" :class="draftRole === 'companion' ? 'orange' : 'blue'">
        <view class="avatar-wrap" @click="pickAvatar">
          <image class="avatar" :src="draftAvatarUrl" mode="aspectFill" />
        </view>
        <view class="card-body">
          <text class="card-label">昵称</text>
          <input class="nickname-input" v-model="draftNickname" maxlength="12" placeholder="请输入昵称" />
          <text class="card-label">身份</text>
          <view class="role-switch">
            <view class="role-btn" :class="{ active: draftRole === 'visitor' }" @click="draftRole = 'visitor'">游客</view>
            <view class="role-btn" :class="{ active: draftRole === 'companion' }" @click="draftRole = 'companion'">伴游</view>
          </view>
        </view>
      </view>

      <button class="save-btn" @click="save">保存</button>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      draftNickname: '',
      draftAvatarUrl: '/static/images/mascot.png',
      draftRole: 'visitor',
      auth: null
    };
  },
  onShow() {
    this.load();
  },
  methods: {
    goBack() {
      uni.navigateBack({
        delta: 1,
        fail: () => {
          uni.switchTab({ url: '/pages/profile/index' });
        }
      });
    },
    load() {
      const raw = uni.getStorageSync('ocean:auth');
      if (!raw) return;
      try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        this.auth = parsed;
      } catch (e) {
        this.auth = null;
      }
      const a = this.auth || {};
      this.draftNickname = a.nickname || '';
      this.draftAvatarUrl = a.avatarUrl || this.draftAvatarUrl;
      this.draftRole = a.role === 'companion' ? 'companion' : 'visitor';
    },
    pickAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: res => {
          const path = res && res.tempFilePaths && res.tempFilePaths[0];
          if (!path) return;
          this.draftAvatarUrl = path;
        }
      });
    },
    save() {
      const nextNickname = (this.draftNickname || '').trim();
      if (!nextNickname) {
        uni.showToast({ title: '请输入昵称', icon: 'none' });
        return;
      }
      const raw = uni.getStorageSync('ocean:auth');
      let auth = null;
      try {
        auth = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null;
      } catch (e) {
        auth = null;
      }
      auth = auth && typeof auth === 'object' ? auth : {};
      auth.loggedIn = true;
      auth.nickname = nextNickname;
      auth.avatarUrl = this.draftAvatarUrl;
      auth.role = this.draftRole;
      uni.setStorageSync('ocean:auth', JSON.stringify(auth));
      uni.showToast({ title: '已保存', icon: 'none' });
      this.goBack();
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

.account-detail-page {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f0f4f7;
}

.content {
  flex: 1;
  padding: 16px;
}

.card {
  border-radius: 18px;
  padding: 16px;
  display: flex;
  gap: 12px;
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.10);
}

.card.blue {
  background-color: #4276FC;
}

.card.orange {
  background-color: #FF9F4A;
}

.avatar-wrap {
  width: 74px;
  height: 74px;
  border-radius: 37px;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.35);
}

.avatar {
  width: 74px;
  height: 74px;
}

.card-body {
  flex: 1;
}

.card-label {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.92);
  margin-top: 10px;
}

.card-label:first-child {
  margin-top: 0;
}

.nickname-input {
  margin-top: 8px;
  height: 40px;
  border-radius: 12px;
  padding: 0 12px;
  background-color: rgba(255, 255, 255, 0.22);
  color: #ffffff;
  font-size: 14px;
}

.role-switch {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

.role-btn {
  flex: 1;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.22);
  color: rgba(255, 255, 255, 0.88);
  font-size: 14px;
  font-weight: 700;
}

.role-btn.active {
  background-color: rgba(255, 255, 255, 0.92);
  color: #2C3E50;
}

.save-btn {
  margin-top: 16px;
  height: 46px;
  border-radius: 14px;
  padding: 0;
  border: none;
  background-color: #2C3E50;
  color: #ffffff;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.save-btn::after {
  border: none;
}
</style>
