<template>
  <view class="planner-page">
    <view class="planner-header">
      <view class="header-spacer"></view>
      <text class="header-title">我的行程</text>
      <view v-if="canUsePlanner && itinerary.length > 0" class="header-action" @click="toggleEditMode">{{ editMode ? '完成' : '编辑' }}</view>
      <view v-else class="header-spacer"></view>
    </view>

    <view v-if="showEmptyState" class="empty-state">
      <uni-icons type="map" size="54" color="rgba(44, 62, 80, 0.25)"></uni-icons>
      <text class="empty-title">{{ canUsePlanner ? '暂无行程' : '当前不可规划' }}</text>
      <text class="empty-desc">{{ canUsePlanner ? '点击下方按钮，小白会为你生成一条更友好的游览路线' : '当前未登录或伴游未绑定心青年' }}</text>
      <view class="empty-actions">
        <button class="empty-btn primary" @click="generateItinerary">规划行程</button>
      </view>
    </view>

    <view v-else class="list-wrapper">
      <scroll-view class="itinerary-list" :scroll-y="!isReordering" :show-scrollbar="false">
        <view v-for="(item, index) in itinerary" :key="item.id" class="itinerary-item" :class="{ edit: editMode, dragging: isReordering && draggingId === item.id }">
          <view class="item-number" :class="{ handle: editMode }">{{ index + 1 }}</view>
          <view class="item-card" :class="{ edit: editMode }">
            <view class="card-main">
              <view class="card-content" @click.stop="onCardContentTap(item)">
                <view class="item-media">
                  <image v-if="item.image" :src="item.image" class="item-image" mode="aspectFill"></image>
                  <view v-else class="item-image item-image-placeholder"></view>
                </view>
                <view class="item-info">
                  <text class="item-title">{{ formatTitle(item.name || item.title) }}</text>
                  <text class="item-description">{{ formatDesc(item.note || item.description) }}</text>
                </view>
              </view>
              <view class="card-action">
                <view v-if="editMode" class="delete-btn" @click.stop="deleteItem(item.id)">
                  <image class="delete-btn-icon" src="/static/icons/delete.png" mode="aspectFit" />
                </view>
                <view v-else class="arrow-btn" @click.stop="goVenueDetail(item)">
                  <image class="arrow-icon" src="/static/icons/chevron-right.png" mode="aspectFit" />
                </view>
              </view>
            </view>
            <view
              v-if="editMode"
              class="drag-handle"
              @touchstart.stop.prevent="onReorderTouchStart(index, $event)"
              @touchmove.stop.prevent="onReorderTouchMove"
              @touchend="onReorderTouchEnd"
              @touchcancel="onReorderTouchEnd"
            ></view>
          </view>
        </view>
      </scroll-view>
      <view class="bottom-actions">
        <button class="empty-btn primary" @click="regenerateItinerary">重新规划</button>
      </view>
    </view>

    <view v-if="draggingItem" class="drag-ghost" :style="{ top: dragGhostTop + 'px' }">
      <view class="itinerary-item ghost">
        <view class="item-number">{{ draggingIndex + 1 }}</view>
        <view class="item-card">
          <view class="card-main">
              <view class="card-content">
                <view class="item-media">
                  <image v-if="draggingItem.image" :src="draggingItem.image" class="item-image" mode="aspectFill"></image>
                  <view v-else class="item-image item-image-placeholder"></view>
                </view>
                <view class="item-info">
                  <text class="item-title">{{ formatTitle(draggingItem.name || draggingItem.title) }}</text>
                  <text class="item-description">{{ formatDesc(draggingItem.note || draggingItem.description) }}</text>
                </view>
              </view>
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
      editMode: false,
      isReordering: false,
      draggingId: null,
      draggingIndex: -1,
      dragGhostTop: 0,
      dragOffsetY: 0,
      listTop: 0,
      itemRects: [],
      reorderPressTimer: null,
      reorderPressIndex: -1,
      reorderStartClientY: 0,
      itinerary: [],
      plannerBlocked: true
    }
  },
  computed: {
    draggingItem() {
      if (!this.isReordering || !this.draggingId) return null;
      return this.itinerary.find(i => i.id === this.draggingId) || null;
    },
    canUsePlanner() {
      return !this.plannerBlocked;
    },
    showEmptyState() {
      return this.plannerBlocked || this.itinerary.length === 0;
    }
  },
  onShow() {
    uni.setNavigationBarTitle({
      title: '我的行程'
    });
    this.loadAuthState();
    this.loadItinerary();
  },
  methods: {
    loadAuthState() {
      this.plannerBlocked = true;
      try {
        const raw = uni.getStorageSync('ocean:auth');
        const auth = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null;
        if (!auth || !auth.loggedIn) return;
        const isCompanion = auth.role === 'companion';
        const hasBoundCode = !!(auth.boundCode && String(auth.boundCode).trim());
        this.plannerBlocked = isCompanion ? !hasBoundCode : false;
      } catch (e) {
        this.plannerBlocked = true;
      }
    },
    normalizeText(v) {
      return typeof v === 'string' ? v.trim() : '';
    },
    truncateText(v, maxLen) {
      const text = this.normalizeText(v);
      if (!text) return '';
      const max = Number(maxLen);
      if (!max || Number.isNaN(max) || max < 2) return text;
      if (text.length <= max) return text;
      return text.slice(0, max) + '…';
    },
    formatTitle(v) {
      const text = this.normalizeText(v) || '未命名地点';
      return this.truncateText(text, 12);
    },
    formatDesc(v) {
      const text = this.normalizeText(v) || '暂无介绍';
      return this.truncateText(text, 18);
    },
    onCardContentTap(item) {
      if (this.editMode) return;
      this.goVenueDetail(item);
    },
    loadItinerary() {
      try {
        const raw = uni.getStorageSync('ocean:itinerary');
        if (!raw) {
          this.itinerary = [];
          return;
        }
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        const normalized = this.normalizeItinerary(parsed);
        this.itinerary = normalized;
        uni.setStorageSync('ocean:itinerary', JSON.stringify(normalized));
      } catch (e) {
        this.itinerary = [];
      }
    },
    normalizeItinerary(list) {
      if (!Array.isArray(list)) return [];
      const uniq = [];
      const idSet = [];
      list.forEach(item => {
        const id = String(item && item.id ? item.id : '').trim();
        if (!id) return;
        if (idSet.includes(id)) return;
        idSet.push(id);
        uniq.push({
          id,
          name: this.normalizeText(item && (item.name || item.title)),
          note: this.normalizeText(item && (item.note || item.description)),
          image: this.normalizeText(item && item.image)
        });
      });
      return uniq;
    },
    syncPreTripPayload() {
      const itinerary = this.itinerary.map((item, index) => ({
        id: index + 1,
        name: item.name || '',
        note: item.note || ''
      }));
      uni.setStorageSync('ocean:backend:pre_trip', JSON.stringify({
        itinerary
      }));
    },
    saveItinerary() {
      const normalized = this.normalizeItinerary(this.itinerary);
      this.itinerary = normalized;
      uni.setStorageSync('ocean:itinerary', JSON.stringify(normalized));
      this.syncPreTripPayload();
    },
    toggleEditMode() {
      if (!this.canUsePlanner || this.itinerary.length === 0) return;
      this.editMode = !this.editMode;
      if (!this.editMode) this.endReorder();
    },
    deleteItem(id) {
      this.itinerary = this.itinerary.filter(i => i.id !== id);
      this.saveItinerary();
    },
    generateItinerary() {
      if (!this.canUsePlanner) {
        uni.showToast({ title: '请先登录后使用此功能', icon: 'none' });
        return;
      }
      this.editMode = false;
      this.itinerary = [
        { id: '9', name: '雨林海豚湾', note: '先进入温暖环境适应湿度，感觉闷热时去空调区休息。', image: '/static/images/Rainforest%20Pavilion.jpg' },
        { id: '13', name: '企鹅岛', note: '进入前补充外套，优先在边缘区域观察，减少冷刺激。', image: '/static/images/Penguin%20Island.jpg' },
        { id: '2', name: '梦幻水母宫', note: '遇到强反光可戴墨镜，沿固定方向慢慢走。', image: '/static/Jellyfish%20Pavilion/Enter%20the%20Jelly%20Palace.png' },
        { id: '12', name: '白鲸海', note: '在隧道保持匀速步行，必要时使用降噪耳机。', image: '/static/Beluge%20Whale%20Pavilion/enter.jpg' }
      ];
      this.saveItinerary();
      uni.showToast({ title: '已生成行程', icon: 'none' });
    },
    regenerateItinerary() {
      this.generateItinerary();
    },
    goVenueDetail(item) {
      const id = item && item.id ? String(item.id) : '';
      const name = item && (item.name || item.title) ? encodeURIComponent(item.name || item.title) : '';
      uni.navigateTo({
        url: `/pages/venue-detail/index?id=${id}&name=${name}`
      });
    },
    async captureReorderRects() {
      return new Promise(resolve => {
        const query = uni.createSelectorQuery().in(this);
        query.select('.itinerary-list').boundingClientRect();
        query.selectAll('.itinerary-item').boundingClientRect();
        query.exec(res => {
          const listRect = res && res[0];
          const itemRects = res && res[1];
          this.listTop = listRect ? listRect.top : 0;
          this.itemRects = Array.isArray(itemRects) ? itemRects : [];
          resolve();
        });
      });
    },
    reorderToIndex(fromIndex, toIndex) {
      if (fromIndex === toIndex) return;
      const next = this.itinerary.slice();
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      this.itinerary = next;
      this.draggingIndex = toIndex;
      this.saveItinerary();
    },
    findIndexByPointer(clientY) {
      if (!this.itemRects.length) return this.draggingIndex;
      for (let i = 0; i < this.itemRects.length; i++) {
        const rect = this.itemRects[i];
        if (!rect) continue;
        const mid = rect.top + rect.height / 2;
        if (clientY < mid) return i;
      }
      return this.itemRects.length - 1;
    },
    async startReorder(index, clientY) {
      if (!this.editMode) return;
      await this.captureReorderRects();
      const item = this.itinerary[index];
      const rect = this.itemRects[index];
      if (!item || !rect) return;
      this.isReordering = true;
      this.draggingId = item.id;
      this.draggingIndex = index;
      this.dragOffsetY = clientY - rect.top;
      this.dragGhostTop = clientY - this.dragOffsetY;
    },
    moveReorder(clientY) {
      if (!this.isReordering) return;
      this.dragGhostTop = clientY - this.dragOffsetY;
      const targetIndex = this.findIndexByPointer(clientY);
      if (targetIndex < 0 || targetIndex === this.draggingIndex) return;
      this.reorderToIndex(this.draggingIndex, targetIndex);
      this.$nextTick(() => {
        this.captureReorderRects();
      });
    },
    endReorder() {
      if (this.reorderPressTimer) {
        clearTimeout(this.reorderPressTimer);
        this.reorderPressTimer = null;
      }
      this.reorderPressIndex = -1;
      this.reorderStartClientY = 0;
      this.isReordering = false;
      this.draggingId = null;
      this.draggingIndex = -1;
      this.dragOffsetY = 0;
      this.itemRects = [];
    },
    onReorderTouchStart(index, e) {
      if (!this.editMode) return;
      if (!e.touches || !e.touches[0]) return;
      const clientY = e.touches[0].clientY;
      this.reorderStartClientY = clientY;
      this.reorderPressIndex = index;

      if (this.reorderPressTimer) {
        clearTimeout(this.reorderPressTimer);
        this.reorderPressTimer = null;
      }

      this.reorderPressTimer = setTimeout(() => {
        if (!this.editMode) return;
        if (this.reorderPressIndex !== index) return;
        this.startReorder(index, clientY);
        this.reorderPressTimer = null;
      }, 260);
    },
    onReorderTouchMove(e) {
      if (!e.touches || !e.touches[0]) return;
      const clientY = e.touches[0].clientY;
      if (this.isReordering) {
        this.moveReorder(clientY);
        return;
      }

      if (this.reorderPressTimer) {
        const moved = Math.abs(clientY - this.reorderStartClientY);
        if (moved >= 6) {
          clearTimeout(this.reorderPressTimer);
          this.reorderPressTimer = null;
          this.reorderPressIndex = -1;
          this.reorderStartClientY = 0;
        }
      }
    },
    onReorderTouchEnd() {
      if (this.isReordering) {
        this.endReorder();
        return;
      }
      if (this.reorderPressTimer) {
        clearTimeout(this.reorderPressTimer);
        this.reorderPressTimer = null;
      }
      this.reorderPressIndex = -1;
      this.reorderStartClientY = 0;
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
  background-color: #faf8f5;
}

.planner-page {
  height: 100vh;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 0 20px;
}

.planner-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  margin-top: 6px;
  margin-bottom: 12px;
}

.header-spacer {
  width: 80px;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  color: #2C3E50;
}

.header-action {
  width: 80px;
  text-align: right;
  font-size: 14px;
  color: #ffffff;
  height: 32px;
  border-radius: 16px;
  background-color: #2a73ca;
  display: flex;
  align-items: center;
  justify-content: center;
}

.list-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.itinerary-list {
  flex: 1;
  padding-bottom: 16px;
  scrollbar-width: none;
  -ms-overflow-style: none;
  overflow: hidden;
  &::-webkit-scrollbar {
      display: none;
      width: 0 !important;
  }
}

.itinerary-list .uni-scroll-view::-webkit-scrollbar,
.itinerary-list .uni-scroll-view-scrollbar::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

.itinerary-list .uni-scroll-view-scrollbar {
  display: none;
  width: 0;
}

.itinerary-list .uni-scroll-view {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.itinerary-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
}

.itinerary-item.edit {
  margin-bottom: 18px;
}

.itinerary-item.dragging {
  opacity: 0.15;
}

.item-number {
  font-size: 16px;
  font-weight: bold;
  color: $aux-color-blue-gray;
  margin-right: 15px;
  padding-top: 20px;
  width: 28px;
  text-align: center;
}

.item-number.handle {
  border-radius: 8px;
  background-color: rgba(44, 62, 80, 0.06);
  padding: 8px 0;
  margin-top: 10px;
}

.drag-ghost {
  position: fixed;
  left: 20px;
  right: 20px;
  z-index: 50;
  pointer-events: none;
}

.itinerary-item.ghost {
  margin-bottom: 0;
}

.itinerary-item.ghost .item-card {
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.12);
  transform: scale(1.01);
}


.item-card {
  flex: 0 1 auto;
  background-color: white;
  border-radius: 18px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  position: relative;
  width: 100%;
  max-width: 620rpx;
}

.item-card.edit {
  overflow: hidden;
}

.card-main {
  display: flex;
  align-items: center;
  position: relative;
}

.card-content {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  padding: 14px 0 14px 14px;
}

.card-action {
  width: 72px;
  padding-right: 14px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
  position: relative;
  z-index: 3;
}

.drag-handle {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 72px;
  z-index: 2;
}

.arrow-btn {
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background-color: rgba(44, 62, 80, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.arrow-icon {
  width: 20px;
  height: 20px;
}

.delete-btn {
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background-color: $warning-color-soft-orange;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.delete-btn-icon {
  width: 22px;
  height: 22px;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 22px 28px;
}

.empty-title {
  margin-top: 12px;
  font-size: 18px;
  font-weight: 700;
  color: #2C3E50;
}

.empty-desc {
  margin-top: 8px;
  font-size: 13px;
  line-height: 18px;
  color: rgba(44, 62, 80, 0.7);
  text-align: center;
}

.empty-actions {
  margin-top: 18px;
  width: 100%;
}

.bottom-actions {
  padding: 8px 0 calc(12px + env(safe-area-inset-bottom));
}

.empty-btn {
  width: 100%;
  height: 44px;
  border-radius: 14px;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.empty-btn::after {
  border: none;
}

.empty-btn.primary {
  background-color: #4276fc;
  color: #ffffff;
}

.item-media {
  width: 60px;
  height: 60px;
  margin-right: 15px;
  flex-shrink: 0;
}

.item-image {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  background-color: #f0f4f7;
  display: block;
}

.item-image-placeholder {
  background-color: #f0f4f7;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 5px;
}

.item-description {
  font-size: 14px;
  color: rgba(44, 62, 80, 0.65);
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

</style>
