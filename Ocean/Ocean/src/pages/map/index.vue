<template>
  <view class="map-page">
    <movable-area class="map-movable-area">
        <movable-view
          class="map-movable-view"
          direction="all"
          :x="x"
          :y="y"
          :style="mapMovableViewStyle"
          :out-of-bounds="false"
          :inertia="false"
          :damping="55"
          :friction="8"
          @change="onDrag"
        >
            <view class="map-stage" @click="handleStageTap">
              <image src="/static/images/map-background.jpg" mode="widthFix" class="map-background-image" @load="onMapImageLoad"></image>
              <view class="hotspot-layer">
                <view
                  v-for="zone in hotspots"
                  :key="zone.id"
                  class="hotspot-zone"
                  :class="{ active: selectedPoiId === zone.id }"
                  :style="{ left: zone.x + '%', top: zone.y + '%', width: zone.w + '%', height: zone.h + '%' }"
                  @click.stop="handleZoneTap(zone)"
                >
                </view>
              </view>
              <view class="hotspot-tag-layer">
                <view
                  v-for="tag in hotspotTags"
                  :key="tag.id"
                  class="hotspot-tag"
                  :class="{ 'in-itinerary': isInItinerary(tag.id) }"
                  :style="{ left: tag.left + '%', top: tag.top + '%' }"
                >
                  <text class="hotspot-tag-name">{{ tag.name }}</text>
                  <text v-if="tag.showFriendly" class="hotspot-tag-caption">友好度</text>
                  <view v-if="tag.showFriendly" class="hotspot-tag-bar">
                    <view class="hotspot-tag-bar-inner" :class="{ low: tag.isLow }" :style="{ width: tag.percent + '%' }"></view>
                  </view>
                </view>
              </view>
            </view>
        </movable-view>
    </movable-area>

    <view class="bottom-bubble-slot" :style="{ bottom: bubbleSlotBottom + 'px' }">
      <view v-if="selectedPoi" class="poi-card">
        <view class="poi-card-top">
          <view class="poi-card-media">
            <image v-if="poiCardImage" class="poi-card-image" :src="poiCardImage" mode="aspectFill" />
            <view v-else class="poi-card-image-placeholder"></view>
          </view>
          <view class="poi-card-info">
            <text class="poi-card-title">{{ selectedPoi.name }}</text>
            <text class="poi-card-desc">{{ poiCardDesc }}</text>
          </view>
        </view>
        <view class="poi-card-actions">
          <button class="poi-btn add-trip" :disabled="!canAddSelectedPoi" @click.stop="handlePoiAction">{{ addTripButtonText }}</button>
          <button class="poi-btn guide" @click.stop="goPoiDetail">场馆指引</button>
        </view>
      </view>

      <view v-else-if="isChatBubbleExpanded" class="assistant-bubble">
        <text class="assistant-bubble-text">我是小白！遇到游览问题可以点击我来询问哦~</text>
        <button class="assistant-bubble-btn" @click.stop="handleChatSubmit">
          <text class="assistant-bubble-btn-text">点击进入对话</text>
        </button>
      </view>
    </view>

    <view class="mascot-container" :style="{ '--mascot-bottom': mascotBottom + 'px' }" @click="toggleChatBubble">
      <image class="mascot-image" src="/static/icons/assistance.png" mode="aspectFit" />
    </view>

  </view>
</template>

<script>
export default {
  data() {
    return {
      statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
      windowHeight: uni.getSystemInfoSync().windowHeight,
      x: -100,
      y: -100,
      hasLoadedMapState: false,
      areaWidth: 0,
      areaHeight: 0,
      viewWidth: 0,
      viewHeight: 0,
      isChatBubbleExpanded: false,
      activeZone: null,
      selectedPoiId: null,
      friendlyThreshold: 45,
      isLoggedIn: false,
      hasProfileReady: false,
      backendFriendlyMap: {},
      itineraryIds: [],
      plannerDisabled: true,
      pois: [
        {
          id: '1',
          name: '钱塘江流域',
          description: 'XXXXXXXXXXXXXXXXXXXXXXXX',
          friendly: 72
        },
        {
          id: '2',
          name: '梦幻水母宫',
          description: '梦幻水母宫是一个专门展示各种水母的室内场馆。馆内整体较暗，主要由展缸内彩色灯光照明，视觉刺激较丰富。若觉得光线晃眼可戴太阳镜；遇到镜面反射区域时，建议放慢脚步确认通道方向。',
          image: '/static/Jellyfish%20Pavilion/Enter%20the%20Jelly%20Palace.png',
          friendly: 58
        },
        {
          id: '3',
          name: '海象剧场',
          description: 'XXXXXXXXXXXXXXXXXXXXXXXX',
          friendly: 36
        },
        {
          id: '4',
          name: '海牛湾',
          description: 'XXXXXXXXXXXXXXXXXXXXXXXX',
          friendly: 64
        },
        {
          id: '5',
          name: '水豚部落',
          description: 'XXXXXXXXXXXXXXXXXXXXXXXX',
          friendly: 80
        },
        {
          id: '6',
          name: '北极狼谷',
          description: 'XXXXXXXXXXXXXXXXXXXXXXXX',
          friendly: 42
        },
        {
          id: '7',
          name: '水獭 海狸鼠',
          description: 'XXXXXXXXXXXXXXXXXXXXXXXX',
          friendly: 55
        },
        {
          id: '8',
          name: '海象馆',
          description: 'XXXXXXXXXXXXXXXXXXXXXXXX',
          friendly: 78
        },
        {
          id: '9',
          name: '雨林海豚湾',
          description: '热带雨林馆模拟温暖潮湿环境，植物茂密并伴有自然气味。馆内温度较高且湿度明显，可能会播放鸟叫或流水声；若感到闷热，可前往空调休息区稍作调整。',
          image: '/static/images/Rainforest%20Pavilion.jpg',
          friendly: 61
        },
        {
          id: '10',
          name: '海狮剧场',
          description: 'XXXXXXXXXXXXXXXXXXXXXXXX',
          friendly: 48
        },
        {
          id: '11',
          name: '北海狮馆',
          description: 'XXXXXXXXXXXXXXXXXXXXXXXX',
          friendly: 67
        },
        {
          id: '12',
          name: '白鲸海',
          description: '白鲸海可以近距离观察白鲸，环境整体较昏暗，水面与玻璃可能出现反光。场馆通常较安静，但人多时会有回响。若对光线或声音敏感，可佩戴太阳镜与降噪耳机，并沿隧道匀速前行。',
          image: '/static/Beluge%20Whale%20Pavilion/enter.jpg',
          friendly: 83
        },
        {
          id: '13',
          name: '企鹅岛',
          description: '企鹅馆温度较低，可看到企鹅在冰块和冷水中活动。场馆光线较亮且可能有反光，进入前建议穿好外套；若对鱼腥味敏感，可佩戴口罩减轻不适。',
          image: '/static/images/Penguin%20Island.jpg',
          friendly: 59
        },
        {
          id: '14',
          name: '棕熊馆,北极熊馆,海豹馆',
          description: 'XXXXXXXXXXXXXXXXXXXXXXXX',
          friendly: 33
        }
      ],
      hotspots: [
        { id: '1', x: 19.5, y: 55, w: 8, h: 10 },
        { id: '2', x: 34, y: 67, w: 10.5, h: 6.5 },
        { id: '3', x: 33.5, y: 52, w: 8, h: 7.5 },
        { id: '4', x: 44.5, y: 58, w: 11.5, h: 7 },
        { id: '5', x: 38, y: 40, w: 12.5, h: 10 },
        { id: '6', x: 23, y: 34, w: 8.5, h: 9.5 },
        { id: '7', x: 31.5, y: 26, w: 10, h: 8 },
        { id: '8', x: 52, y: 28, w: 10, h: 6.5 },
        { id: '9', x: 40.5, y: 11.5, w: 12, h: 6.5 },
        { id: '10', x: 60.5, y: 19, w: 9.5, h: 6 },
        { id: '11', x: 74, y: 26, w: 12, h: 8 },
        { id: '12', x: 82.5, y: 16.5, w: 14, h: 8 },
        { id: '13', x: 74, y: 7, w: 10.5, h: 7.5 },
        { id: '14', x: 57.5, y: 4, w: 14, h: 7 }
      ]
    }
  },
  computed: {
    mascotBottom() {
      const baseBottom = 5;
      return baseBottom;
    },
    mapMovableViewStyle() {
      if (!this.viewWidth || !this.viewHeight) return {};
      return {
        width: this.viewWidth + 'px',
        height: this.viewHeight + 'px'
      };
    },
    bubbleSlotBottom() {
      return this.selectedPoi ? 110 : 90;
    },
    selectedPoi() {
      return this.pois.find(p => p.id === this.selectedPoiId) || null;
    },
    hotspotTags() {
      const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
      const canShowFriendly = this.hasProfileReady && Object.keys(this.backendFriendlyMap || {}).length > 0;
      return this.hotspots
        .map(z => {
          const poi = this.pois.find(p => String(p.id) === String(z.id));
          if (!poi) return null;
          const rawName = typeof poi.name === 'string' ? poi.name.trim() : '';
          const name = rawName.length > 5 ? rawName.slice(0, 5) + '…' : rawName || '未命名';
          const rawScore = this.getBackendFriendlyScore(String(z.id));
          const hasFriendly = canShowFriendly && Number.isFinite(rawScore);
          const score = hasFriendly ? clamp(Number(rawScore), 0, 100) : 0;
          return {
            id: String(z.id),
            left: z.x + z.w / 2,
            top: z.y + z.h / 2,
            name,
            showFriendly: hasFriendly,
            percent: score,
            isLow: score < this.friendlyThreshold
          };
        })
        .filter(Boolean);
    },
    poiCardImage() {
      const src = this.selectedPoi && typeof this.selectedPoi.image === 'string' ? this.selectedPoi.image.trim() : '';
      return src || '';
    },
    poiCardDesc() {
      const raw = this.selectedPoi && typeof this.selectedPoi.description === 'string' ? this.selectedPoi.description.trim() : '';
      return raw || '暂无介绍';
    },
    selectedPoiInItinerary() {
      if (!this.selectedPoi) return false;
      return this.isInItinerary(this.selectedPoi.id);
    },
    canAddSelectedPoi() {
      if (!this.selectedPoi) return false;
      if (this.plannerDisabled) return false;
      if (this.itineraryIds.length === 0) return false;
      if (this.selectedPoiInItinerary) return false;
      return true;
    },
    addTripButtonText() {
      if (this.plannerDisabled) return '不可添加';
      if (this.itineraryIds.length === 0) return '先去规划';
      if (this.selectedPoiInItinerary) return '已在行程';
      return '加入行程';
    }
  },
  onReady() {
    this.refreshMapLayout();
  },
  onShow() {
    this.loadMapState();
    this.loadFriendlyState();
    this.loadPlannerAccessState();
    this.loadItineraryIds();
    this.bindStorageChange();
  },
  onHide() {
    this.saveMapState();
    if (typeof uni.offStorageChange === 'function') {
      uni.offStorageChange(this.handleStorageChange);
    }
  },
  methods: {
    bindStorageChange() {
      if (typeof uni.onStorageChange !== 'function') return;
      uni.onStorageChange(this.handleStorageChange);
    },
    handleStorageChange(e) {
      if (!e) return;
      if (e.key === 'ocean:itinerary') {
        this.loadItineraryIds();
      }
      if (e.key === 'ocean:auth') {
        this.loadFriendlyState();
        this.loadPlannerAccessState();
        this.loadItineraryIds();
      }
      if (e.key === 'ocean:backend:venue_friendly_scores') {
        this.loadFriendlyState();
      }
      if (e.key === 'ocean:userdata:lastUpdatedAt' || e.key === 'ocean:sensory_matrix' || e.key === 'ocean:userdata') {
        this.loadFriendlyState();
      }
    },
    normalizeItineraryId(v) {
      return String(v || '').trim();
    },
    isInItinerary(id) {
      if (this.plannerDisabled) return false;
      const target = this.normalizeItineraryId(id);
      if (!target) return false;
      return this.itineraryIds.includes(target);
    },
    loadItineraryIds() {
      let list = [];
      try {
        const raw = uni.getStorageSync('ocean:itinerary');
        const parsed = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
        list = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        list = [];
      }
      const ids = [];
      list.forEach(item => {
        const id = this.normalizeItineraryId(item && item.id);
        if (id && !ids.includes(id)) ids.push(id);
      });
      this.itineraryIds = ids;
    },
    loadPlannerAccessState() {
      this.plannerDisabled = true;
      try {
        const raw = uni.getStorageSync('ocean:auth');
        const auth = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null;
        if (!auth || !auth.loggedIn) return;
        const isCompanion = auth.role === 'companion';
        const hasBoundCode = !!(auth.boundCode && String(auth.boundCode).trim());
        this.plannerDisabled = isCompanion ? !hasBoundCode : false;
      } catch (e) {
        this.plannerDisabled = true;
      }
    },
    loadFriendlyState() {
      this.isLoggedIn = false;
      this.hasProfileReady = false;
      this.backendFriendlyMap = {};
      const parse = (raw) => {
        try {
          return raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null;
        } catch (e) {
          return null;
        }
      };
      const auth = parse(uni.getStorageSync('ocean:auth'));
      this.isLoggedIn = !!(auth && auth.loggedIn);
      const lastUpdatedAt = Number(uni.getStorageSync('ocean:userdata:lastUpdatedAt') || 0);
      const sensory = parse(uni.getStorageSync('ocean:sensory_matrix')) || parse(uni.getStorageSync('ocean:userdata'));
      this.hasProfileReady = !!lastUpdatedAt && !!sensory;
      if (!this.hasProfileReady) return;
      const backend = parse(uni.getStorageSync('ocean:backend:venue_friendly_scores'));
      if (!backend) return;
      const map = {};
      if (Array.isArray(backend)) {
        backend.forEach(item => {
          const id = String(item && (item.id || item.poi_id || '')).trim();
          const val = Number(item && (item.friendly || item.score || item.percent));
          if (!id || !Number.isFinite(val)) return;
          map[id] = val;
        });
      } else if (typeof backend === 'object') {
        Object.keys(backend).forEach(key => {
          const val = Number(backend[key]);
          if (Number.isFinite(val)) map[String(key).trim()] = val;
        });
      }
      this.backendFriendlyMap = map;
    },
    getBackendFriendlyScore(id) {
      const key = String(id || '').trim();
      if (!key) return NaN;
      return Number(this.backendFriendlyMap[key]);
    },
    loadMapState() {
      const raw = uni.getStorageSync('ocean:mapState');
      if (!raw) {
        this.hasLoadedMapState = false;
        return;
      }

      try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (!parsed || typeof parsed !== 'object') return;

        if (typeof parsed.x === 'number') this.x = parsed.x;
        if (typeof parsed.y === 'number') this.y = parsed.y;
        this.hasLoadedMapState = true;
      } catch (e) {
      }
    },
    saveMapState() {
      uni.setStorageSync('ocean:mapState', JSON.stringify({ x: this.x, y: this.y }));
    },
    onMapImageLoad() {
      this.$nextTick(() => {
        this.refreshMapLayout();
      });
    },
    refreshMapLayout() {
      const query = uni.createSelectorQuery().in(this);

      query.select('.map-movable-area').boundingClientRect();
      query.select('.map-stage').boundingClientRect();

      query.exec(res => {
        const areaRect = res && res[0];
        const viewRect = res && res[1];

        if (areaRect) {
          this.areaWidth = areaRect.width;
          this.areaHeight = areaRect.height;
        }

        if (viewRect) {
          this.viewWidth = viewRect.width;
          this.viewHeight = viewRect.height;
        }

        if (this.areaWidth && this.viewWidth) {
          if (!this.hasLoadedMapState && this.x === -100 && this.y === -100) {
            this.x = (this.areaWidth - this.viewWidth) / 2;
            this.y = (this.areaHeight - this.viewHeight) / 2;
          }
          this.handleInteraction({ detail: { x: this.x, y: this.y } });
        }
      });
    },
    toggleChatBubble() {
      if (this.selectedPoi) {
        this.closePoiSheet();
        this.isChatBubbleExpanded = true;
        return;
      }
      this.isChatBubbleExpanded = !this.isChatBubbleExpanded;
    },
    handleChatSubmit() {
      uni.navigateTo({
        url: '/pages/assistant/index'
      });
    },
    handleStageTap() {
      this.closePoiSheet();
      this.isChatBubbleExpanded = false;
    },
    handleZoneTap(zone) {
      this.activeZone = zone.id;
      this.selectedPoiId = zone.id;
      this.isChatBubbleExpanded = false;
    },
    closePoiSheet() {
      this.activeZone = null;
      this.selectedPoiId = null;
    },
    handlePoiAction() {
      if (!this.selectedPoi) return;
      if (this.plannerDisabled) {
        uni.showToast({ title: '请先登录后使用此功能', icon: 'none' });
        return;
      }
      if (this.itineraryIds.length === 0) {
        uni.showToast({ title: '请先在行程页规划行程', icon: 'none' });
        return;
      }
      const nextItem = {
        id: this.selectedPoi.id,
        name: this.selectedPoi.name,
        note: this.selectedPoi.description,
        image: '/static/images/beluga.png'
      };

      let list = [];
      try {
        const raw = uni.getStorageSync('ocean:itinerary');
        if (raw) {
          const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (Array.isArray(parsed)) list = parsed;
        }
      } catch (e) {}

      const targetId = this.normalizeItineraryId(nextItem.id);
      if (list.some(i => this.normalizeItineraryId(i && i.id) === targetId)) {
        uni.showToast({ title: '行程中已有该地点', icon: 'none' });
        this.loadItineraryIds();
        return;
      }

      list.push(nextItem);
      const normalized = list.map(item => ({
        id: String(item && item.id ? item.id : '').trim(),
        name: item && (item.name || item.title) ? String(item.name || item.title).trim() : '',
        note: item && (item.note || item.description) ? String(item.note || item.description).trim() : '',
        image: item && item.image ? String(item.image).trim() : ''
      })).filter(item => item.id);
      const rank = (id) => {
        const n = Number(String(id || '').trim());
        return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
      };
      normalized.sort((a, b) => rank(a.id) - rank(b.id));
      uni.setStorageSync('ocean:itinerary', JSON.stringify(normalized));
      uni.setStorageSync('ocean:backend:pre_trip', JSON.stringify({
        itinerary: normalized.map((item, index) => ({
          id: index + 1,
          name: item.name,
          note: item.note
        }))
      }));
      this.loadItineraryIds();
      uni.showToast({ title: '已加入行程', icon: 'none' });
    },
    goPoiDetail() {
      if (!this.selectedPoi) return;
      const id = encodeURIComponent(this.selectedPoi.id);
      const name = encodeURIComponent(this.selectedPoi.name);
      uni.navigateTo({
        url: `/pages/venue-detail/index?id=${id}&name=${name}`
      });
    },
    handleInteraction(e) {
      if (!this.areaWidth || !this.viewWidth || !this.areaHeight || !this.viewHeight) {
        return;
      }

      const { x: rawX, y: rawY } = e.detail;

      let finalX = rawX;
      let finalY = rawY;

      const scaledWidth = this.viewWidth;
      const scaledHeight = this.viewHeight;

      if (scaledWidth <= this.areaWidth) {
        finalX = (this.areaWidth - scaledWidth) / 2;
      } else {
        const minX = this.areaWidth - scaledWidth;
        finalX = Math.max(minX, Math.min(0, rawX));
      }

      if (scaledHeight <= this.areaHeight) {
        finalY = (this.areaHeight - scaledHeight) / 2;
      } else {
        const minY = this.areaHeight - scaledHeight;
        finalY = Math.max(minY, Math.min(0, rawY));
      }

      this.x = finalX;
      this.y = finalY;
    },
    onDrag(e) {
      if (!e || !e.detail) return;
      if (e.detail.source === 'update') return;
      const nextX = Number(e.detail.x);
      const nextY = Number(e.detail.y);
      const hasNextPos = Number.isFinite(nextX) && Number.isFinite(nextY);

      if (this.selectedPoiId && hasNextPos) {
        const dx = Math.abs(nextX - this.x);
        const dy = Math.abs(nextY - this.y);
        if (dx + dy >= 6) {
          this.closePoiSheet();
        }
      }

      if (this.isChatBubbleExpanded) {
        this.isChatBubbleExpanded = false;
      }
      if (hasNextPos) {
        this.x = nextX;
        this.y = nextY;
      }
    }
  }
}
</script>

<style lang="scss">
@import '@/uni.scss';

.map-page {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.map-movable-area {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.map-page {
  display: flex;
  flex-direction: column;
  background-color: #f7f9f9; 
}

.map-movable-view {
  width: 1680rpx;
  height: 1344rpx;
}

.map-stage {
  position: relative;
  width: 1680rpx;
}

.map-background-image {
  width: 1680rpx;
  display: block;
}

.hotspot-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.hotspot-tag-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.hotspot-tag {
  position: absolute;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  border-radius: 22rpx;
  border: 2rpx solid transparent;
  background: rgba(255, 255, 255, 0.7);
  padding: 14rpx 14rpx 14rpx 16rpx;
  overflow: hidden;
  transform: translate(-50%, -50%) translateY(-20px);
}

.hotspot-tag.in-itinerary {
  border-width: 4rpx;
  border-color: #2a73ca;
  background: linear-gradient(135deg, rgba(42, 115, 202, 0.24), rgba(104, 176, 255, 0.16)), rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 0 2rpx rgba(42, 115, 202, 0.28), 0 0 18rpx rgba(42, 115, 202, 0.45), 0 0 30rpx rgba(104, 176, 255, 0.24);
}

.hotspot-tag-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #000000;
  line-height: 38rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 96rpx;
}

.hotspot-tag-caption {
  margin-top: 2rpx;
  font-size: 20rpx;
  color: #929292;
  line-height: 28rpx;
}

.hotspot-tag-bar {
  margin-top: 2rpx;
  width: 96rpx;
  border-radius: 10rpx;
  background: #b6b6b6;
  overflow: hidden;
}

.hotspot-tag-bar-inner {
  height: 20rpx;
  border-radius: 10rpx;
  background: #2eca6f;
}

.hotspot-tag-bar-inner.low {
  background: $warning-color-soft-orange;
}

.hotspot-zone {
  position: absolute;
  background: transparent;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hotspot-zone.active {
  border-color: rgba(42, 115, 202, 0.95);
  background: rgba(42, 115, 202, 0.14);
}

.mascot-container {
    position: fixed;
    right: -12px;
    bottom: var(--mascot-bottom, 8px);
    z-index: 2000;
    width: 92px;
    height: 92px;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    overflow: visible;
}

.mascot-image {
    width: 156px;
    height: 156px;
    pointer-events: none;
}

.bottom-bubble-slot {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  z-index: 900;
  pointer-events: auto;
  width: 596rpx;
}

.assistant-bubble {
  pointer-events: auto;
  background-color: #d9effa;
  border-radius: 34rpx;
  box-shadow: 0 8rpx 8rpx rgba(0, 0, 0, 0.25);
  padding: 20rpx 28rpx 22rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.assistant-bubble-text {
  width: 540rpx;
  font-size: 26rpx;
  line-height: 36rpx;
  color: #3d3d3d;
  text-align: center;
}

.assistant-bubble-btn {
  margin-top: 18rpx;
  width: 320rpx;
  height: 88rpx;
  border-radius: 50rpx;
  background-color: #2a73ca;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.assistant-bubble-btn::after {
  border: none;
}

.assistant-bubble-btn-text {
  color: #ffffff;
  font-size: 26rpx;
}

.poi-card {
  pointer-events: auto;
  background-color: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 6rpx 18rpx rgba(0, 0, 0, 0.08);
  overflow: hidden;
  padding: 26rpx 22rpx 26rpx 26rpx;
  width: 574rpx;
}

.poi-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.poi-card-media {
  width: 256rpx;
  height: 174rpx;
  flex-shrink: 0;
}

.poi-card-image {
  width: 100%;
  height: 100%;
  border-radius: 18rpx;
}

.poi-card-image-placeholder {
  width: 100%;
  height: 100%;
  background-color: #f0f4f7;
  border-radius: 18rpx;
}

.poi-card-info {
  width: 248rpx;
  margin-left: 22rpx;
  display: flex;
  flex-direction: column;
}

.poi-card-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #2c3e50;
  line-height: 54rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.poi-card-desc {
  margin-top: 12rpx;
  font-size: 28rpx;
  color: rgba(44, 62, 80, 0.65);
  line-height: 40rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.poi-card-actions {
  margin: 18rpx 6rpx 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
}

.poi-btn {
  width: 226rpx;
  height: 88rpx;
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  color: #ffffff;
  margin: 0;
  padding: 0;
  
  &::after {
    border: none;
  }

  &.add-trip {
    background-color: #4d96a9;
  }

  &.guide {
    background-color: #2a73ca;
  }
}

.poi-btn[disabled] {
  background-color: #9fb4be !important;
  color: rgba(255, 255, 255, 0.85);
}


</style>
