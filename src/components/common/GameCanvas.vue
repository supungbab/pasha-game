<script setup lang="ts">
import { ref, onMounted, defineEmits } from 'vue';

interface Props {
  width?: number;
  height?: number;
  backgroundColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  width: 400,
  height: 600,
  backgroundColor: '#F7FFF7'
});

const emit = defineEmits<{
  tap: [x: number, y: number];
  swipe: [direction: 'up' | 'down' | 'left' | 'right', startX: number, startY: number, endX: number, endY: number];
  drag: [x: number, y: number];
  dragStart: [x: number, y: number];
  dragEnd: [x: number, y: number];
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);

// Touch tracking
let touchStartX = 0;
let touchStartY = 0;
let isDragging = false;

defineExpose({
  canvas: canvasRef,
  ctx
});

onMounted(() => {
  if (canvasRef.value) {
    ctx.value = canvasRef.value.getContext('2d');

    // Set canvas size with device pixel ratio
    const pixelRatio = window.devicePixelRatio || 1;
    canvasRef.value.width = props.width * pixelRatio;
    canvasRef.value.height = props.height * pixelRatio;
    canvasRef.value.style.width = `${props.width}px`;
    canvasRef.value.style.height = `${props.height}px`;

    if (ctx.value) {
      ctx.value.scale(pixelRatio, pixelRatio);

      // Fill background
      ctx.value.fillStyle = props.backgroundColor;
      ctx.value.fillRect(0, 0, props.width, props.height);
    }
  }
});

function getCanvasCoordinates(event: TouchEvent | MouseEvent): { x: number; y: number } {
  if (!canvasRef.value) return { x: 0, y: 0 };

  const rect = canvasRef.value.getBoundingClientRect();
  let clientX: number, clientY: number;

  if ('touches' in event && event.touches.length > 0) {
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  } else if ('clientX' in event) {
    clientX = event.clientX;
    clientY = event.clientY;
  } else {
    return { x: 0, y: 0 };
  }

  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

function handleTouchStart(event: TouchEvent | MouseEvent) {
  event.preventDefault();
  const coords = getCanvasCoordinates(event);
  touchStartX = coords.x;
  touchStartY = coords.y;
  isDragging = true;

  emit('dragStart', coords.x, coords.y);
}

function handleTouchMove(event: TouchEvent | MouseEvent) {
  if (!isDragging) return;
  event.preventDefault();

  const coords = getCanvasCoordinates(event);
  emit('drag', coords.x, coords.y);
}

function handleTouchEnd(event: TouchEvent | MouseEvent) {
  event.preventDefault();

  const coords = getCanvasCoordinates(event);
  const dx = coords.x - touchStartX;
  const dy = coords.y - touchStartY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  isDragging = false;
  emit('dragEnd', coords.x, coords.y);

  // Detect tap (small movement)
  if (distance < 10) {
    emit('tap', coords.x, coords.y);
  }
  // Detect swipe (larger movement)
  else if (distance > 50) {
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    let direction: 'up' | 'down' | 'left' | 'right';

    if (angle >= -45 && angle < 45) direction = 'right';
    else if (angle >= 45 && angle < 135) direction = 'down';
    else if (angle >= 135 || angle < -135) direction = 'left';
    else direction = 'up';

    emit('swipe', direction, touchStartX, touchStartY, coords.x, coords.y);
  }
}
</script>

<template>
  <canvas
    ref="canvasRef"
    class="game-canvas"
    :style="{ width: `${width}px`, height: `${height}px` }"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @mousedown="handleTouchStart"
    @mousemove="handleTouchMove"
    @mouseup="handleTouchEnd"
  />
</template>

<style scoped>
.game-canvas {
  display: block;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  cursor: pointer;
}
</style>
