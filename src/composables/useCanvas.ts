// src/composables/useCanvas.ts

import { ref, onMounted, onUnmounted, type Ref } from 'vue';
import { CanvasHelper } from '@/utils/canvas';

export interface CanvasOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
  pixelRatio?: number;
}

export interface TouchEvent {
  x: number;
  y: number;
  type: 'start' | 'move' | 'end';
}

/**
 * Canvas 관리 Composable
 */
export function useCanvas(canvasRef: Ref<HTMLCanvasElement | null>, options: CanvasOptions = {}) {
  const ctx = ref<CanvasRenderingContext2D | null>(null);
  const helper = ref<CanvasHelper | null>(null);
  const isReady = ref(false);

  const {
    width = 400,
    height = 600,
    backgroundColor = '#F7FFF7',
    pixelRatio = window.devicePixelRatio || 1
  } = options;

  // Touch/Mouse 이벤트
  const touchStart = ref<TouchEvent | null>(null);
  const touchCurrent = ref<TouchEvent | null>(null);

  /**
   * Canvas 초기화
   */
  function init() {
    if (!canvasRef.value) return;

    const canvas = canvasRef.value;
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('Failed to get canvas context');
      return;
    }

    // 캔버스 크기 설정 (레티나 대응)
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Context 스케일 조정
    context.scale(pixelRatio, pixelRatio);

    ctx.value = context;
    helper.value = new CanvasHelper(context);
    isReady.value = true;

    // 배경색 초기화
    if (backgroundColor) {
      helper.value.fillBackground(backgroundColor);
    }
  }

  /**
   * Canvas 클리어
   */
  function clear() {
    if (!helper.value) return;
    helper.value.clear();
    if (backgroundColor) {
      helper.value.fillBackground(backgroundColor);
    }
  }

  /**
   * Canvas 좌표 가져오기 (이벤트 → 캔버스 좌표)
   */
  function getCanvasCoordinates(event: MouseEvent | Touch): { x: number; y: number } {
    if (!canvasRef.value) return { x: 0, y: 0 };

    const rect = canvasRef.value.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  /**
   * Touch Start 핸들러
   */
  function handleTouchStart(event: MouseEvent | TouchEvent) {
    event.preventDefault();

    const touch = 'touches' in event ? event.touches[0] : event;
    const coords = getCanvasCoordinates(touch);

    touchStart.value = { ...coords, type: 'start' };
    touchCurrent.value = { ...coords, type: 'start' };
  }

  /**
   * Touch Move 핸들러
   */
  function handleTouchMove(event: MouseEvent | TouchEvent) {
    event.preventDefault();

    if (!touchStart.value) return;

    const touch = 'touches' in event ? event.touches[0] : event;
    const coords = getCanvasCoordinates(touch);

    touchCurrent.value = { ...coords, type: 'move' };
  }

  /**
   * Touch End 핸들러
   */
  function handleTouchEnd(event: MouseEvent | TouchEvent) {
    event.preventDefault();

    if (!touchStart.value) return;

    const touch = 'changedTouches' in event ? event.changedTouches[0] : event;
    const coords = getCanvasCoordinates(touch);

    touchCurrent.value = { ...coords, type: 'end' };

    // 터치 정보 초기화
    setTimeout(() => {
      touchStart.value = null;
      touchCurrent.value = null;
    }, 50);
  }

  /**
   * 이벤트 리스너 등록
   */
  function attachEventListeners() {
    if (!canvasRef.value) return;

    const canvas = canvasRef.value;

    // Touch events
    canvas.addEventListener('touchstart', handleTouchStart as any, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove as any, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd as any, { passive: false });

    // Mouse events (desktop)
    canvas.addEventListener('mousedown', handleTouchStart as any);
    canvas.addEventListener('mousemove', handleTouchMove as any);
    canvas.addEventListener('mouseup', handleTouchEnd as any);
  }

  /**
   * 이벤트 리스너 제거
   */
  function detachEventListeners() {
    if (!canvasRef.value) return;

    const canvas = canvasRef.value;

    canvas.removeEventListener('touchstart', handleTouchStart as any);
    canvas.removeEventListener('touchmove', handleTouchMove as any);
    canvas.removeEventListener('touchend', handleTouchEnd as any);
    canvas.removeEventListener('mousedown', handleTouchStart as any);
    canvas.removeEventListener('mousemove', handleTouchMove as any);
    canvas.removeEventListener('mouseup', handleTouchEnd as any);
  }

  /**
   * 스와이프 감지
   */
  function getSwipeDirection(): 'up' | 'down' | 'left' | 'right' | null {
    if (!touchStart.value || !touchCurrent.value) return null;

    const dx = touchCurrent.value.x - touchStart.value.x;
    const dy = touchCurrent.value.y - touchStart.value.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 최소 거리 체크
    if (distance < 30) return null;

    // 각도로 방향 판단
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    if (angle >= -45 && angle < 45) return 'right';
    if (angle >= 45 && angle < 135) return 'down';
    if (angle >= 135 || angle < -135) return 'left';
    if (angle >= -135 && angle < -45) return 'up';

    return null;
  }

  /**
   * 탭 여부 확인
   */
  function isTap(): boolean {
    if (!touchStart.value || !touchCurrent.value) return false;

    const dx = touchCurrent.value.x - touchStart.value.x;
    const dy = touchCurrent.value.y - touchStart.value.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 이동 거리가 작으면 탭으로 간주
    return distance < 10;
  }

  // Lifecycle
  onMounted(() => {
    init();
    attachEventListeners();
  });

  onUnmounted(() => {
    detachEventListeners();
  });

  return {
    ctx,
    helper,
    isReady,
    touchStart,
    touchCurrent,
    width,
    height,
    clear,
    getCanvasCoordinates,
    getSwipeDirection,
    isTap,
    init
  };
}
