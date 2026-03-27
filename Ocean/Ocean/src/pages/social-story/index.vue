<template>
  <view class="social-story-page">
    <view class="subtitle-bar">
      <text class="subtitle-text">白鲸馆</text>
    </view>

    <swiper class="swiper" :current="currentCard" :autoplay="false" @change="onSwiperChange">
      <swiper-item v-for="(card, index) in storyCards" :key="index">
        <view class="swiper-card">
          <view class="card-image-placeholder"></view>
          <text class="card-description">{{ card.description }}</text>
        </view>
      </swiper-item>
    </swiper>
    <view class="navigation-controls">
        <button class="nav-button prev" @click="prevCard" :disabled="currentCard === 0">
            <uni-icons type="arrow-left" size="24" color="#333"></uni-icons>
        </button>
        <text class="progress-text">{{ currentCard + 1 }} / {{ storyCards.length }}</text>
        <button class="nav-button next" @click="nextCard" :disabled="currentCard === storyCards.length - 1">
            <uni-icons type="arrow-right" size="24" color="#333"></uni-icons>
        </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentCard: 0,
      storyCards: [
        { description: '我们首先会看到一个长长的蓝色通道。' },
        { description: '然后，我们会进入一个很宽阔、很明亮的大厅。' },
        { description: '在这里，我们可以看到巨大的白鲸在水里游泳。' },
        { description: '参观结束啦，准备好回家吧。' }
      ]
    }
  },
  methods: {
    onSwiperChange(e) {
      this.currentCard = e.detail.current;
    },
    prevCard() {
      if (this.currentCard > 0) {
        this.currentCard--;
      }
    },
    nextCard() {
      if (this.currentCard < this.storyCards.length - 1) {
        this.currentCard++;
      }
    },
    navigateBack() {}
  }
}
</script>

<style lang="scss">
@import '@/uni.scss';

.social-story-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg-color-warm-sand;
}

.subtitle-bar {
  padding: 10px 15px;
  text-align: center;
}

.subtitle-text {
  font-size: 14px;
  font-weight: 700;
  color: #2C3E50;
}

.swiper {
  flex: 1;
  padding: 0 20px;
}

.swiper-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-bottom: 20px; /* space for nav */
}

.card-image-placeholder {
  height: 60%;
  width: 100%;
  background-color: #e0e0e0;
  border-radius: 15px;
  margin-bottom: 20px;
}

.card-description {
  font-size: 20px;
  line-height: 1.6;
  text-align: center;
}

.navigation-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 40px 40px;
}

.progress-text {
    font-size: 16px;
    color: $aux-color-blue-gray;
}

.nav-button {
    width: 50px;
    height: 50px;
    border-radius: 25px;
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #eee;
    padding: 0;

    &[disabled] {
        opacity: 0.5;
    }
}
</style>
