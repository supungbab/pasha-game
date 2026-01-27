// src/composables/useCleanupTimers.ts

import { onUnmounted } from 'vue';

/**
 * 타이머/인터벌 자동 정리 Composable
 *
 * 컴포넌트에서 setTimeout/setInterval을 사용할 때
 * 언마운트 시 자동으로 정리되도록 합니다.
 *
 * @example
 * const { safeSetTimeout, safeSetInterval, clearAllTimers } = useCleanupTimers();
 *
 * // 자동으로 정리됨
 * safeSetTimeout(() => console.log('hello'), 1000);
 * safeSetInterval(() => console.log('tick'), 100);
 */
export function useCleanupTimers() {
  const timeoutIds: number[] = [];
  const intervalIds: number[] = [];
  const animationIds: number[] = [];

  /**
   * 자동 정리되는 setTimeout
   */
  function safeSetTimeout(fn: () => void, ms: number): number {
    const id = window.setTimeout(() => {
      // 실행 후 목록에서 제거
      const index = timeoutIds.indexOf(id);
      if (index > -1) {
        timeoutIds.splice(index, 1);
      }
      fn();
    }, ms);
    timeoutIds.push(id);
    return id;
  }

  /**
   * 자동 정리되는 setInterval
   */
  function safeSetInterval(fn: () => void, ms: number): number {
    const id = window.setInterval(fn, ms);
    intervalIds.push(id);
    return id;
  }

  /**
   * 자동 정리되는 requestAnimationFrame
   */
  function safeRequestAnimationFrame(fn: FrameRequestCallback): number {
    const id = window.requestAnimationFrame((time) => {
      // 실행 후 목록에서 제거
      const index = animationIds.indexOf(id);
      if (index > -1) {
        animationIds.splice(index, 1);
      }
      fn(time);
    });
    animationIds.push(id);
    return id;
  }

  /**
   * 특정 타이머 취소
   */
  function clearTimeout(id: number): void {
    window.clearTimeout(id);
    const index = timeoutIds.indexOf(id);
    if (index > -1) {
      timeoutIds.splice(index, 1);
    }
  }

  /**
   * 특정 인터벌 취소
   */
  function clearInterval(id: number): void {
    window.clearInterval(id);
    const index = intervalIds.indexOf(id);
    if (index > -1) {
      intervalIds.splice(index, 1);
    }
  }

  /**
   * 특정 애니메이션 프레임 취소
   */
  function cancelAnimationFrame(id: number): void {
    window.cancelAnimationFrame(id);
    const index = animationIds.indexOf(id);
    if (index > -1) {
      animationIds.splice(index, 1);
    }
  }

  /**
   * 모든 타이머 정리
   */
  function clearAllTimers(): void {
    timeoutIds.forEach(id => window.clearTimeout(id));
    intervalIds.forEach(id => window.clearInterval(id));
    animationIds.forEach(id => window.cancelAnimationFrame(id));
    timeoutIds.length = 0;
    intervalIds.length = 0;
    animationIds.length = 0;
  }

  // 컴포넌트 언마운트 시 자동 정리
  onUnmounted(() => {
    clearAllTimers();
  });

  return {
    safeSetTimeout,
    safeSetInterval,
    safeRequestAnimationFrame,
    clearTimeout,
    clearInterval,
    cancelAnimationFrame,
    clearAllTimers
  };
}
