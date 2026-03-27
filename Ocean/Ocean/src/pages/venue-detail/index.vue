<template>
  <view class="venue-detail-page">
    <scroll-view class="content" :style="{ height: contentHeight + 'px' }" :scroll-y="true" :show-scrollbar="false">
      <view class="section">
        <text class="section-title">{{ venue.name }}</text>
        <image class="hero" :src="venue.image" mode="aspectFill"></image>
        <text class="paragraph">{{ venue.description }}</text>

        <text class="section-subtitle">感官友好度提醒</text>
        <view class="sensory-row" v-for="sense in venue.sensory" :key="sense.key">
          <view class="sensory-bar">
            <view class="sensory-fill" :class="{ warn: sense.level >= sensoryWarnThreshold }" :style="{ width: Math.round(sense.level * 100) + '%' }"></view>
          </view>
          <text class="sensory-label">{{ sense.label }}</text>
        </view>

        <view class="tips-card">
          <text class="tips-title">Tips：</text>
          <text class="tips-text">{{ venue.tips }}</text>
        </view>

        <text class="section-subtitle">社交故事</text>
        <swiper class="story-swiper" :current="currentStory" :autoplay="false" @change="onStoryChange">
          <swiper-item v-for="card in venue.socialStories" :key="card.id">
            <view class="story-card">
              <image class="story-card-image" :src="card.image" mode="aspectFill"></image>
              <view class="story-card-body">
                <text class="story-card-title">{{ card.title }}</text>
                <text class="story-card-text">{{ card.text }}</text>
              </view>
            </view>
          </swiper-item>
        </swiper>
        <view class="story-controls">
          <button class="story-nav prev" @click="prevStory" :disabled="currentStory === 0">
            <image class="story-nav-icon" src="/static/icons/chevron-left.png" mode="aspectFit" />
          </button>
          <text class="story-progress">{{ currentStory + 1 }} / {{ venue.socialStories.length }}</text>
          <button class="story-nav next" @click="nextStory" :disabled="currentStory === venue.socialStories.length - 1">
            <image class="story-nav-icon" src="/static/icons/chevron-right.png" mode="aspectFit" />
          </button>
        </view>
        <text class="paragraph">{{ venue.storyIntro }}</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
      windowHeight: uni.getSystemInfoSync().windowHeight,
      currentStory: 0,
      sensoryWarnThreshold: 0.6,
      venue: {
        id: '',
        name: '场馆',
        image: '/static/images/beluga.png',
        description: '这里是场馆介绍内容示例。你可以在这里放置更详细的场馆说明，让游客在浏览前做好预期。',
        tips: '如感到不适，可随时离开并寻找安静区域休息。',
        sensory: [
          { key: 'visual', label: '视觉', level: 0.68 },
          { key: 'sound', label: '听觉', level: 0.42 },
          { key: 'touch', label: '触觉', level: 0.35 },
          { key: 'smell', label: '嗅觉', level: 0.28 }
        ],
        accessibility: [1, 2, 3, 4],
        storyIntro: '社交故事用于帮助你提前了解这里会发生什么，以及可以怎么做。向左或向右拖动卡片进行浏览。',
        socialStories: [
          {
            id: 's1',
            title: '进入场馆',
            text: '我会看到工作人员和值得注意的提示标识。我可以跟随人流慢慢进入。',
            image: '/static/images/map-background.png'
          },
          {
            id: 's2',
            title: '寻找座位',
            text: '如果人多，我可以先找一个不拥挤的位置，保持和他人的距离。',
            image: '/static/images/restaurant.png'
          },
          {
            id: 's3',
            title: '观看互动',
            text: '如果声音或灯光让我不舒服，我可以捂住耳朵或暂时移开视线。',
            image: '/static/images/sea-lion.png'
          },
          {
            id: 's4',
            title: '结束离开',
            text: '参观结束后我可以沿着出口指示离开，并告诉同伴我的感受。',
            image: '/static/images/jellyfish.png'
          }
        ]
      }
    }
  },
  computed: {
    contentHeight() {
      return Math.max(0, this.windowHeight);
    }
  },
  methods: {
    onStoryChange(e) {
      this.currentStory = e.detail.current;
    },
    prevStory() {
      if (this.currentStory > 0) this.currentStory--;
    },
    nextStory() {
      if (this.currentStory < this.venue.socialStories.length - 1) this.currentStory++;
    }
  },
  onLoad(query) {
    const id = query && query.id ? String(query.id) : '';
    const name = query && query.name ? decodeURIComponent(String(query.name)) : '';

    if (id) this.venue.id = id;
    if (name) this.venue.name = name;

    if (name && name.includes('白鲸')) {
      this.venue.image = '/static/images/beluga.png';
    }
    if (this.venue.name) {
      uni.setNavigationBarTitle({
        title: this.venue.name
      });
    }
  }
}
</script>

<style lang="scss">
@import '@/uni.scss';

page {
  width: 100%;
  height: 100%;
  background-color: #faf8f5;
  overflow: hidden;
}

.venue-detail-page {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #faf8f5;
}

.content {
  flex: 1;
  padding: 16px 16px 24px;
}

.section-title {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #2C3E50;
  text-align: center;
}

.section-subtitle {
  display: block;
  margin-top: 18px;
  font-size: 18px;
  font-weight: 700;
  color: #2C3E50;
  text-align: center;
}

.hero {
  margin-top: 12px;
  width: 100%;
  height: 160px;
  border-radius: 18px;
  background-color: #b9b9b9;
}

.paragraph {
  display: block;
  margin-top: 12px;
  font-size: 14px;
  line-height: 20px;
  color: rgba(44, 62, 80, 0.75);
}

.sensory-row {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 0.86);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.06);
}

.sensory-bar {
  flex: 1;
  height: 14px;
  border-radius: 999px;
  background-color: rgba(44, 62, 80, 0.1);
  overflow: hidden;
}

.sensory-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(66, 118, 252, 0.65), #4276fc);
}

.sensory-fill.warn {
  background: linear-gradient(90deg, rgba(255, 159, 74, 0.7), #ff9f4a);
}

.sensory-label {
  order: -1;
  width: 56px;
  text-align: left;
  font-size: 13px;
  color: rgba(44, 62, 80, 0.78);
}

.tips-card {
  width: 100%;
  border-radius: 18px;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.06);
  padding: 14px 14px 16px;
  margin-top: 14px;
}

.tips-title {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: #2C3E50;
}

.tips-text {
  display: block;
  margin-top: 8px;
  font-size: 13px;
  line-height: 18px;
  color: rgba(44, 62, 80, 0.75);
}


.story-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.story-item {
  border-radius: 18px;
  background-color: rgba(44, 62, 80, 0.06);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.story-item-image {
  width: 100%;
  height: 160px;
  background-color: #b9b9b9;
}

.story-item-title {
  display: block;
  padding: 12px 12px 0;
  font-size: 16px;
  font-weight: 700;
  color: #2C3E50;
}

.story-item-desc {
  display: block;
  padding: 8px 12px 14px;
  font-size: 13px;
  line-height: 18px;
  color: rgba(44, 62, 80, 0.72);
}

.story-swiper {
  margin-top: 12px;
  height: 420px;
}

.story-card {
  height: 100%;
  border-radius: 18px;
  overflow: hidden;
  background-color: rgba(44, 62, 80, 0.06);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

.story-card-image {
  width: 100%;
  height: 240px;
  background-color: #b9b9b9;
}

.story-card-body {
  padding: 14px 14px 16px;
}

.story-card-title {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: #2C3E50;
}

.story-card-text {
  display: block;
  margin-top: 10px;
  font-size: 14px;
  line-height: 20px;
  color: rgba(44, 62, 80, 0.75);
}

.story-controls {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
}

.story-nav {
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background-color: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.story-nav::after {
  border: none;
}

.story-nav[disabled] {
  opacity: 0.45;
}

.story-nav-icon {
  width: 22px;
  height: 22px;
}

.story-progress {
  font-size: 14px;
  color: rgba(44, 62, 80, 0.7);
}
</style>
