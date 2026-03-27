# 微信小程序页面设计与无障碍规范（桌面 H5 仅用于调试预览）

## Global Styles（全局）
### Layout
- **主端形态**：微信小程序移动端优先；H5 仅用于开发调试，不作为交付验收主端。
- **单位**：布局与触控区域优先 `rpx`；可交互元素最小触控热区 ≥ `88rpx`（约 44pt）。
- **安全区**：底部预留 `safe-area-inset-bottom`（并提供 JS 计算兜底）；顶部自定义导航栏避让微信胶囊按钮。

### Meta Information
- 小程序侧以页面 `navigationBarTitleText` / 自定义导航栏标题为准；H5 调试可复用同名标题与描述。

### Global Design Tokens（建议）
- Background：`#F7F9F9` / `#FAF8F5`（禁止纯白大底）
- Text：深蓝灰（如 `#2C3E50`）
- Primary：低饱和蓝绿（如 `#4D96A9`）
- Corner radius：14–22
- Motion：仅允许用户触发的 150–260ms 过渡（禁止自动播放/闪烁）
- Icon + Text：所有图标按钮必须同位文字或可读说明（含无障碍 label/可读文本）

## Page：导览地图页（/pages/map/index）
### Layout
- 叠层结构：自定义导航栏（顶部） + 地图交互层（movable-view） + 右侧控制按钮 + 小白入口 + 地点卡片 + 自定义 TabBar。

### Page Structure & Components
1. 自定义导航栏
   - 标题居中；右侧操作区与胶囊按钮保持安全间距。
   - 图标按钮提供文字说明（可用小字标签或可聚焦的读屏文本）。
2. 地图交互层
   - 支持拖动与双指缩放；地图保持比例不变形。
3. 点位标记
   - 标记直径 ≥ 88rpx；选中态使用柔和描边/阴影，不使用高频闪烁。
4. 地点卡片（底部浮层）
   - 信息层级：名称 > 描述 > 操作按钮（查看详情/开始导航）。
   - 操作按钮高度 ≥ 88rpx。
5. 小白入口与提问面板
   - 默认态气泡文案更具体、可预测；点击后展开输入与发送。

### Interaction Notes（小程序关键）
- 避免依赖 `backdrop-filter`；需要磨砂效果时改为半透明底色 + 轻阴影。

## Page：AI 无障碍助手对话页（/pages/assistant/index）
### Layout
- 上：消息列表（scroll-view）
- 下：固定输入栏（需适配键盘顶起 + 底部安全区）

### Sections & Components
1. 消息气泡
   - 文本行高 1.5；长回复分点展示；对比度满足可读。
2. 输入栏
   - 输入框 + 发送按钮；空输入禁用发送。
   - 失败/加载只用消息气泡提示，不弹 Modal。

### Compatibility Notes
- 禁用滚动条伪类与 hover 相关样式；避免 `100vh` 引发机型高度抖动（可用页面容器撑满 + 固定底栏）。

## Page：行程规划页（/pages/planner/index）
### Layout
- 地图背景（可缩放拖动） + 底部行程面板（可拖拽展开/收起） + 自定义 TabBar。

### Sections & Components
1. 行程面板手柄区
   - 手柄可触控区域 ≥ 88rpx；拖拽过程无突兀动画。
2. 行程列表
   - 卡片包含图片 + 标题 + 描述；编辑模式提供拖拽排序与删除。

### Compatibility Notes
- 小程序端不支持鼠标拖拽：交互必须基于 touch；H5 鼠标增强仅可选且需条件编译隔离。

## Page：场馆详情页（/pages/venue-detail/index）
- 结构：自定义/系统导航栏 + 内容区（标题/图文信息） + 返回。
- 重点：字体层级清晰、段落留白足够、避免高对比强刺激。

## Page：我的页（/pages/profile/index）
- 结构：顶部信息区 + 功能入口列表（社交故事/授权引导）。
- 列表项：图标 + 文本 + 右箭头（均需可点击热区）。

## Page：社交故事页（/pages/social-story/index）
- 结构：章节/卡片列表 → 内容阅读。
- 内容排版：短句优先、分段明确、避免一次性长屏密集文本。

## Page：授权引导页（/pages/permission-guide/index）
- 结构：解释说明（为什么需要）+ 按钮（去设置/重新尝试）。
- 反馈：授权失败以页面内提示说明下一步，不使用弹窗。
