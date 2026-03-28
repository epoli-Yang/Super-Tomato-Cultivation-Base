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
    const venueProfiles = {
      beluga: {
        id: '12',
        name: '白鲸海',
        image: '/static/Beluge%20Whale%20Pavilion/enter.jpg',
        description: '白鲸馆是一个可以近距离观察极地海洋生物的场所，这里的环境设计旨在为游客提供安全且放松的体验。馆内生活着身体呈白色的白鲸，它们在宽敞的水池中持续游动。为了保护动物并模拟深海环境，馆内的光线通常比较昏暗。水面和玻璃可能会反射出亮闪闪的光斑。虽然场馆内部整体比较安静，但如果游客较多，空气中可能会出现嘈杂的人声和回响。',
        tips: '如果你对光线敏感，可以尝试佩戴太阳镜来过滤反光。如果你对声音比较敏感，佩戴降噪耳机可以帮助你保持心情平静。在隧道内行走时，请保持匀速步行，避免奔跑或大声喧哗，这样可以让你更好地享受这段旅程。',
        sensory: [
          { key: 'visual', label: '视觉', level: 0.8 },
          { key: 'sound', label: '听觉', level: 0.8 },
          { key: 'touch', label: '触觉', level: 0.6 },
          { key: 'smell', label: '嗅觉', level: 0.2 }
        ],
        storyIntro: '社交故事用于帮助你提前了解白鲸馆会发生什么，以及你可以如何更安心地参观。向左或向右拖动卡片进行浏览。',
        socialStories: [
          {
            id: 's1',
            title: '进入场馆',
            text: '这是“白鲸海”的入口处，大门的形状看起来就像蓝色的海浪。你会从这里开始参观行程。进入大门后，你就能见到那些生活在水里的白鲸朋友了，你做好了参观的准备了吗？',
            image: '/static/Beluge%20Whale%20Pavilion/enter.jpg'
          },
          {
            id: 's2',
            title: '光线变化',
            text: '当你抬起头时，你发现水就在我的头顶上方流动。这里的环境比室外要暗一些，光线在水波的折射下会产生晃动。如果你觉得这些光线让眼睛不舒服，我可以闭上眼睛休息一会儿，或者戴上墨镜。',
            image: '/static/Beluge%20Whale%20Pavilion/Change%20of%20light.jpg'
          },
          {
            id: 's3',
            title: '观察白鲸',
            text: '当站在玻璃幕墙前时，你可以看到白鲸在水中缓慢地游过。白鲸的皮肤是纯白色的，它们的动作非常柔和。只需要安静地站在原地观察，就能发现它们非常友好且安全。',
            image: '/static/Beluge%20Whale%20Pavilion/Observing%20Beluga%20Whales.jpg'
          },
          {
            id: 's4',
            title: '在隧道中行走',
            text: '你正在通过一条透明的海底隧道，身体两侧有蓝色的水和粉色的花朵装饰。我会沿着蓝色的地面指引向前行走，并且保持脚步平稳。只要我慢慢地走路而不奔跑，我就能看清周围所有的美景。',
            image: '/static/Beluge%20Whale%20Pavilion/Walking%20in%20the%20tunnel.jpg'
          }
        ]
      },
      jellyfish: {
        id: '2',
        name: '梦幻水母宫',
        image: '/static/Jellyfish%20Pavilion/Enter%20the%20Jelly%20Palace.png',
        description: '梦幻水母宫是一个专门展示各种水母的室内场馆。水母是身体透明、动作缓慢的海洋生物。为了展示水母发光的特性，馆内的环境非常昏暗，主要依靠展缸内五颜六色的灯光来照明。这里是一个视觉色彩非常丰富的地方。',
        tips: '馆内有很多镜面装饰和明亮的彩色灯光。如果你觉得光线太亮或晃眼，可以佩戴太阳镜。部分区域利用镜子营造了宽广的视觉效果，行走时请注意区分镜子和真实的道路，建议慢慢行走。馆内通常会播放轻柔的背景音乐。如果游客较多，密闭空间内可能会产生声音回响。如果你感到嘈杂，可以佩戴降噪耳机。',
        sensory: [
          { key: 'visual', label: '视觉', level: 0.8 },
          { key: 'sound', label: '听觉', level: 0.6 },
          { key: 'touch', label: '触觉', level: 0.4 },
          { key: 'smell', label: '嗅觉', level: 0.2 }
        ],
        storyIntro: '社交故事用于帮助你提前了解梦幻水母宫会发生什么，以及你可以如何更舒适地参观。向左或向右拖动卡片进行浏览。',
        socialStories: [
          {
            id: 's1',
            title: '进入水母宫',
            text: '你现在来到了梦幻水母宫的门口。大门上方有许多彩色的大水母模型，看起来非常醒目。进入大门后，环境会变得比室外暗很多，你需要给眼睛一点时间来适应这里的光线。',
            image: '/static/Jellyfish%20Pavilion/Enter%20the%20Jelly%20Palace.png'
          },
          {
            id: 's2',
            title: '水母实验室',
            text: '这里是“水母育婴室”。在这里，你可以透过玻璃看到许多透明的小盒子，里面生活着不同成长阶段的小水母。这里的环境比较明亮，你可以清楚地观察水母是如何长大的。',
            image: '/static/Jellyfish%20Pavilion/Jellyfish%20Laboratory.png'
          },
          {
            id: 's3',
            title: '彩色水母柱',
            text: '你进入了一个有很多圆柱形展缸的房间。许多水母在这些彩色的圆柱里上下浮动。因为地面也是木质且颜色较深，你需要注意看清脚下的路，保持平稳地走动。',
            image: '/static/Jellyfish%20Pavilion/Colored%20jellyfish%20column.png'
          },
          {
            id: 's4',
            title: '镜面幻境',
            text: '一个光线非常幽蓝的区域。这里的墙壁上有很多镜子，它们反射出更多的水母窗口，让空间看起来非常大。你需要慢下脚步，确认好真实的通道方向再向前走。如果觉得镜子里的反光太杂乱，你要低头看地面或者闭眼休息一会儿。',
            image: '/static/Jellyfish%20Pavilion/Mirror-like%20Illusion.png'
          }
        ]
      },
      rainforest: {
        id: '9',
        name: '雨林海豚湾',
        image: '/static/images/Rainforest%20Pavilion.jpg',
        description: '热带雨林馆是一个模拟温暖、潮湿环境的室内场所。这里生长着许多高大的绿色植物，还有生活在树木和水池里的雨林动物。为了模仿自然界的雨林，馆内的空气会比其他地方更湿润，温度也更高。',
        tips: '这里的空气感觉潮湿且温暖，皮肤可能会有一点黏糊感。如果你感到闷热，可以随时前往带有空调的休息区。由于植物和泥土较多，空气中会有草木与泥土气味。馆内还可能播放鸟叫或流水声，若你觉得不适，可以短暂离开到安静区域休息。',
        sensory: [
          { key: 'visual', label: '视觉', level: 0.5 },
          { key: 'sound', label: '听觉', level: 0.5 },
          { key: 'touch', label: '触觉', level: 0.7 },
          { key: 'smell', label: '嗅觉', level: 0.8 }
        ],
        storyIntro: '社交故事用于帮助你提前了解雨林海豚湾会发生什么，以及你可以如何更舒适地参观。向左或向右拖动卡片进行浏览。',
        socialStories: [
          {
            id: 's1',
            title: '进入雨林馆',
            text: '进入场馆后，你会看到很多高大的绿色植物和水池。这里整体像温暖的雨林环境，你可以先慢慢观察周围，再决定参观路线。',
            image: '/static/images/Rainforest%20Pavilion.jpg'
          },
          {
            id: 's2',
            title: '温度与湿度',
            text: '馆内空气更湿润、温度更高，皮肤可能会有一点黏糊。如果你觉得闷热，可以告诉同伴并前往有空调的休息区。',
            image: '/static/images/Rainforest%20Pavilion.jpg'
          },
          {
            id: 's3',
            title: '气味感官',
            text: '这里有植物和泥土的自然气味，这是雨林环境的一部分。你可以先做几次慢呼吸，逐步适应场馆气味。',
            image: '/static/images/Rainforest%20Pavilion.jpg'
          },
          {
            id: 's4',
            title: '声音环境',
            text: '馆内可能会有鸟叫或流水声，植物茂密时声音会显得较闷。你可以放慢脚步，若感到不适可先去安静区域休息。',
            image: '/static/images/Rainforest%20Pavilion.jpg'
          }
        ]
      },
      penguin: {
        id: '13',
        name: '企鹅岛',
        image: '/static/images/Penguin%20Island.jpg',
        description: '企鹅馆是一个专门为极地企鹅设计的寒冷场所。为了让企鹅生活得舒适，馆内的气温被控制在很低的度数。你会看到企鹅在人造冰块上行走，或者在冰冷的水中快速游泳。',
        tips: '馆内温度非常低，从室外进入会立刻感到寒冷，建议提前穿上外套或长袖衣物。场馆光线通常较明亮，冰块和玻璃可能出现白色反光，可佩戴墨镜。由于企鹅数量较多，可能会有明显鱼腥味，不适时可佩戴口罩。',
        sensory: [
          { key: 'visual', label: '视觉', level: 0.8 },
          { key: 'sound', label: '听觉', level: 0.4 },
          { key: 'touch', label: '触觉', level: 0.9 },
          { key: 'smell', label: '嗅觉', level: 0.7 }
        ],
        storyIntro: '社交故事用于帮助你提前了解企鹅岛会发生什么，以及你可以如何更安心地参观。向左或向右拖动卡片进行浏览。',
        socialStories: [
          {
            id: 's1',
            title: '进入企鹅馆',
            text: '你将进入一个温度很低的场馆。进门后会很快感到寒冷，先确认外套或长袖是否穿好，再继续参观。',
            image: '/static/images/Penguin%20Island.jpg'
          },
          {
            id: 's2',
            title: '观察企鹅',
            text: '你会看到企鹅在冰块上行走，或在冷水中游动。可以站在安全位置安静观察，按自己的节奏前进。',
            image: '/static/images/Penguin%20Island.jpg'
          },
          {
            id: 's3',
            title: '光线与反光',
            text: '场馆光线通常明亮，冰块和玻璃可能反射白光。若眼睛不舒服，可以佩戴墨镜或短暂闭眼休息。',
            image: '/static/images/Penguin%20Island.jpg'
          },
          {
            id: 's4',
            title: '气味适应',
            text: '馆内可能有较明显的鱼腥味，这是正常现象。如果你不喜欢这种味道，可以戴上口罩并前往空气流通处调整。',
            image: '/static/images/Penguin%20Island.jpg'
          }
        ]
      }
    };
    return {
      statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
      windowHeight: uni.getSystemInfoSync().windowHeight,
      currentStory: 0,
      sensoryWarnThreshold: 0.6,
      venueProfiles,
      venue: {
        id: '',
        name: venueProfiles.beluga.name,
        image: venueProfiles.beluga.image,
        description: venueProfiles.beluga.description,
        tips: venueProfiles.beluga.tips,
        sensory: venueProfiles.beluga.sensory,
        accessibility: [1, 2, 3, 4],
        storyIntro: venueProfiles.beluga.storyIntro,
        socialStories: venueProfiles.beluga.socialStories
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
    let profile = this.venueProfiles.beluga;
    if (id === '2' || name.includes('水母')) profile = this.venueProfiles.jellyfish;
    if (id === '9' || name.includes('雨林')) profile = this.venueProfiles.rainforest;
    if (id === '13' || name.includes('企鹅')) profile = this.venueProfiles.penguin;
    this.venue = {
      ...this.venue,
      ...profile,
      id: id || profile.id,
      name: name || profile.name
    };
    this.currentStory = 0;
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
