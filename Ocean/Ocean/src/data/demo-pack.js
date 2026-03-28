export const demoVisitorProfile = {
  name: '林沐沐',
  age: 9,
  gender: '女',
  intro: '我喜欢先看路线图再出发，遇到人多和噪音时会先做深呼吸，再慢慢继续。',
  senses: [3.6, 2.9, 3.2, 2.4, 2.1]
}

export const demoSensoryMatrix = {
  visual: [
    { q: 'Q1:灯光亮度', raw: 4, u: 0.33 },
    { q: 'Q2:反光刺激', raw: 3, u: 0.22 },
    { q: 'Q3:色彩变化', raw: 4, u: 0.33 }
  ],
  auditory: [
    { q: 'Q1:人群噪音', raw: 3, u: 0.22 },
    { q: 'Q2:突发声响', raw: 3, u: 0.22 },
    { q: 'Q3:背景音乐', raw: 2.7, u: 0.19 }
  ],
  tactile: [
    { q: 'Q1:温度变化', raw: 3, u: 0.22 },
    { q: 'Q2:拥挤触碰', raw: 3.5, u: 0.28 },
    { q: 'Q3:环境湿度', raw: 3.1, u: 0.23 }
  ],
  olfactory: [
    { q: 'Q1:气味浓度', raw: 2.4, u: 0.16 },
    { q: 'Q2:环境异味', raw: 2.3, u: 0.14 },
    { q: 'Q3:气味波动', raw: 2.5, u: 0.17 }
  ],
  taste: [
    { q: 'Q1:味觉敏感', raw: 2.1, u: 0.12 },
    { q: 'Q2:食物偏好', raw: 2.2, u: 0.13 },
    { q: 'Q3:新口味接受度', raw: 2, u: 0.11 }
  ]
}

export const demoSensoryObject = {
  v: 0.29,
  a: 0.21,
  t: 0.24,
  o: 0.16,
  ta: 0.12
}

export const demoVenueFriendlyScores = {
  '1': 68,
  '2': 84,
  '3': 46,
  '4': 72,
  '5': 81,
  '6': 52,
  '7': 64,
  '8': 76,
  '9': 78,
  '10': 57,
  '11': 73,
  '12': 88,
  '13': 82,
  '14': 44
}

export const demoItinerary = [
  {
    id: '9',
    name: '雨林海豚湾',
    note: '先进入温暖环境适应湿度，感觉闷热时去空调区休息。',
    image: '/static/images/Rainforest%20Pavilion.jpg'
  },
  {
    id: '13',
    name: '企鹅岛',
    note: '进入前补充外套，优先在边缘区域观察，减少冷刺激。',
    image: '/static/images/Penguin%20Island.jpg'
  },
  {
    id: '2',
    name: '梦幻水母宫',
    note: '遇到强反光可戴墨镜，沿固定方向慢慢走。',
    image: '/static/Jellyfish%20Pavilion/Enter%20the%20Jelly%20Palace.png'
  },
  {
    id: '12',
    name: '白鲸海',
    note: '在隧道保持匀速步行，必要时使用降噪耳机。',
    image: '/static/Beluge%20Whale%20Pavilion/enter.jpg'
  }
]

export const demoAssistantFaq = {
  nearestToilet: '离你最近的厕所位于梦幻水母宫与白鲸海连廊中段，沿当前路线前行约120米，看到蓝色导视牌后右转即可到达。'
}
