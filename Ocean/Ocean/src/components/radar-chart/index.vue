<template>
  <view class="radar-wrap">
    <canvas class="radar-canvas" :canvas-id="canvasId" :id="canvasId"></canvas>
    <view class="radar-labels">
      <view v-for="(t, i) in labels" :key="i" class="radar-label">
        <text class="label-name">{{ t }}</text>
        <text class="label-val">{{ values[i] || 0 }}/5</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    values: {
      type: Array,
      default: () => [0, 0, 0, 0, 0]
    },
    labels: {
      type: Array,
      default: () => ['视觉', '听觉', '触觉', '嗅觉', '味觉']
    },
    sizeRpx: {
      type: Number,
      default: 520
    },
    strokeColor: {
      type: String,
      default: '#4276FC'
    },
    fillColor: {
      type: String,
      default: 'rgba(66, 118, 252, 0.18)'
    }
  },
  data() {
    return {
      canvasId: 'radar_' + Math.random().toString(36).slice(2, 10)
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.draw();
    });
  },
  watch: {
    values: {
      deep: true,
      handler() {
        this.$nextTick(() => {
          this.draw();
        });
      }
    }
  },
  methods: {
    draw() {
      const sizePx = typeof uni.upx2px === 'function' ? uni.upx2px(this.sizeRpx) : this.sizeRpx;
      const scope = this.$scope || this;
      const ctx = uni.createCanvasContext(this.canvasId, scope);
      const count = 5;
      const center = sizePx / 2;
      const radius = Math.max(0, center - 10);
      const levels = 4;
      const angleStep = (Math.PI * 2) / count;

      ctx.clearRect(0, 0, sizePx, sizePx);

      ctx.setStrokeStyle('rgba(44, 62, 80, 0.16)');
      ctx.setLineWidth(1);
      for (let l = 1; l <= levels; l++) {
        const r = (radius * l) / levels;
        ctx.beginPath();
        for (let i = 0; i < count; i++) {
          const a = -Math.PI / 2 + angleStep * i;
          const x = center + r * Math.cos(a);
          const y = center + r * Math.sin(a);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }

      ctx.beginPath();
      for (let i = 0; i < count; i++) {
        const a = -Math.PI / 2 + angleStep * i;
        const x = center + radius * Math.cos(a);
        const y = center + radius * Math.sin(a);
        ctx.moveTo(center, center);
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      const vs = Array.isArray(this.values) ? this.values : [];
      ctx.setFillStyle(this.fillColor);
      ctx.setStrokeStyle(this.strokeColor);
      ctx.setLineWidth(2);
      ctx.beginPath();
      for (let i = 0; i < count; i++) {
        const raw = Number(vs[i] || 0);
        const v = Math.max(0, Math.min(5, raw));
        const r = (radius * v) / 5;
        const a = -Math.PI / 2 + angleStep * i;
        const x = center + r * Math.cos(a);
        const y = center + r * Math.sin(a);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.draw();
    }
  }
};
</script>

<style lang="scss">
@import '@/uni.scss';

.radar-wrap {
  width: 100%;
}

.radar-canvas {
  width: 520rpx;
  height: 520rpx;
  margin: 0 auto;
  display: block;
}

.radar-labels {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.radar-label {
  flex: 1;
  min-width: 44%;
  border-radius: 14px;
  background-color: rgba(44, 62, 80, 0.06);
  padding: 10px 12px;
}

.label-name {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #2C3E50;
}

.label-val {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: rgba(44, 62, 80, 0.72);
}
</style>
