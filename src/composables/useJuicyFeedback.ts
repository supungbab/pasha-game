// src/composables/useJuicyFeedback.ts
// "통통 튀는" 게임 피드백을 위한 Juicy Feedback Composable

import { ref, onUnmounted } from 'vue';
import { useAudio } from './useAudio';

export type ScorePopupType = 'score' | 'combo' | 'bonus' | 'miss';
export type ShakeIntensity = 'light' | 'strong';

interface ScorePopup {
  id: number;
  x: number;
  y: number;
  text: string;
  type: ScorePopupType;
}

/**
 * Juicy Feedback Composable
 * 게임에 생동감 있는 피드백 효과를 추가합니다.
 */
export function useJuicyFeedback() {
  const { playSoundEffect, vibrate } = useAudio();

  // 점수 팝업 목록
  const scorePopups = ref<ScorePopup[]>([]);
  let popupIdCounter = 0;

  // 화면 흔들림 상태
  const isShaking = ref(false);
  const shakeIntensity = ref<ShakeIntensity>('light');

  /**
   * 요소에 바운스 효과 적용
   */
  function bounce(element: HTMLElement | null, strong = false) {
    if (!element) return;

    const className = strong ? 'juicy-bounce-strong' : 'juicy-bounce';
    element.classList.remove('juicy-bounce', 'juicy-bounce-strong');

    // Force reflow to restart animation
    void element.offsetWidth;

    element.classList.add(className);

    // 애니메이션 끝나면 클래스 제거
    const duration = strong ? 500 : 400;
    setTimeout(() => {
      element.classList.remove(className);
    }, duration);
  }

  /**
   * 요소에 찌그러짐(press) 효과 적용
   */
  function squish(element: HTMLElement | null) {
    if (!element) return;

    element.classList.remove('juicy-press');
    void element.offsetWidth;
    element.classList.add('juicy-press');

    setTimeout(() => {
      element.classList.remove('juicy-press');
    }, 150);
  }

  /**
   * 요소에 팝 효과 적용 (등장 애니메이션)
   */
  function pop(element: HTMLElement | null, type: 'normal' | 'success' | 'fail' = 'normal') {
    if (!element) return;

    const classNames: Record<string, string> = {
      normal: 'juicy-pop',
      success: 'juicy-success-pop',
      fail: 'juicy-fail-pop',
    };

    const className = classNames[type];
    element.classList.remove('juicy-pop', 'juicy-success-pop', 'juicy-fail-pop');
    void element.offsetWidth;
    element.classList.add(className);

    const durations: Record<string, number> = { normal: 400, success: 500, fail: 300 };
    setTimeout(() => {
      element.classList.remove(className);
    }, durations[type]);
  }

  /**
   * 요소에 발광 효과 적용
   */
  function glow(element: HTMLElement | null, type: 'normal' | 'success' | 'error' = 'normal') {
    if (!element) return;

    const classNames: Record<string, string> = {
      normal: 'juicy-glow',
      success: 'juicy-glow-success',
      error: 'juicy-glow-error',
    };

    const className = classNames[type];
    element.classList.remove('juicy-glow', 'juicy-glow-success', 'juicy-glow-error');
    void element.offsetWidth;
    element.classList.add(className);

    const duration = type === 'error' ? 400 : 600;
    setTimeout(() => {
      element.classList.remove(className);
    }, duration);
  }

  /**
   * 요소에 펄스 효과 적용
   */
  function pulse(element: HTMLElement | null, infinite = false) {
    if (!element) return;

    const className = infinite ? 'juicy-pulse-infinite' : 'juicy-pulse';
    element.classList.add(className);

    if (!infinite) {
      setTimeout(() => {
        element.classList.remove(className);
      }, 500);
    }

    return () => element.classList.remove(className);
  }

  /**
   * 요소에 흔들림 효과 적용
   */
  function wiggle(element: HTMLElement | null, infinite = false) {
    if (!element) return;

    const className = infinite ? 'juicy-wiggle-infinite' : 'juicy-wiggle';
    element.classList.add(className);

    if (!infinite) {
      setTimeout(() => {
        element.classList.remove(className);
      }, 300);
    }

    return () => element.classList.remove(className);
  }

  /**
   * 화면 전체 흔들림 효과
   */
  function shake(container: HTMLElement | null, intensity: ShakeIntensity = 'light') {
    if (!container) return;

    shakeIntensity.value = intensity;
    isShaking.value = true;

    const className = intensity === 'strong' ? 'juicy-shake-strong' : 'juicy-shake-light';
    container.classList.remove('juicy-shake-light', 'juicy-shake-strong');
    void container.offsetWidth;
    container.classList.add(className);

    const duration = intensity === 'strong' ? 500 : 400;
    setTimeout(() => {
      container.classList.remove(className);
      isShaking.value = false;
    }, duration);
  }

  /**
   * 점수 팝업 생성
   */
  function createScorePopup(x: number, y: number, text: string, type: ScorePopupType = 'score'): ScorePopup {
    const popup: ScorePopup = {
      id: ++popupIdCounter,
      x,
      y,
      text,
      type,
    };

    scorePopups.value.push(popup);

    // 자동 제거
    const duration = type === 'bonus' ? 1200 : type === 'combo' ? 1000 : 800;
    setTimeout(() => {
      removeScorePopup(popup.id);
    }, duration);

    return popup;
  }

  /**
   * 점수 팝업 제거
   */
  function removeScorePopup(id: number) {
    const index = scorePopups.value.findIndex(p => p.id === id);
    if (index !== -1) {
      scorePopups.value.splice(index, 1);
    }
  }

  /**
   * 터치 위치에 리플 효과 생성
   */
  function createRipple(container: HTMLElement | null, x: number, y: number, size = 60) {
    if (!container) return;

    const ripple = document.createElement('div');
    ripple.className = 'juicy-ripple';
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${x - size / 2}px`;
    ripple.style.top = `${y - size / 2}px`;

    container.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  /**
   * 파티클 효과 생성
   */
  function createParticles(
    container: HTMLElement | null,
    x: number,
    y: number,
    color: string,
    count = 8
  ) {
    if (!container) return;

    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'juicy-particles';
    particlesContainer.style.left = `${x}px`;
    particlesContainer.style.top = `${y}px`;

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'juicy-particle';

      const angle = (i / count) * Math.PI * 2;
      const distance = 30 + Math.random() * 40;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;

      particle.style.setProperty('--tx', `${tx}px`);
      particle.style.setProperty('--ty', `${ty}px`);
      particle.style.width = `${6 + Math.random() * 6}px`;
      particle.style.height = particle.style.width;
      particle.style.backgroundColor = color;

      particlesContainer.appendChild(particle);
    }

    container.appendChild(particlesContainer);

    setTimeout(() => {
      particlesContainer.remove();
    }, 800);
  }

  /**
   * 탭 피드백 (찌그러짐 + 사운드 + 진동)
   */
  function tapFeedback(element: HTMLElement | null) {
    squish(element);
    playSoundEffect('tap');
    vibrate(20);
  }

  /**
   * 아이템 획득 피드백
   */
  function collectFeedback(
    element: HTMLElement | null,
    container: HTMLElement | null,
    x: number,
    y: number,
    points: number,
    color = '#FFD700'
  ) {
    bounce(element, false);
    createScorePopup(x, y, `+${points}`, 'score');
    createParticles(container, x, y, color, 6);
    playSoundEffect('collect');
    vibrate(30);
  }

  /**
   * 성공 피드백
   */
  function successFeedback(element: HTMLElement | null, container: HTMLElement | null) {
    pop(element, 'success');
    shake(container, 'light');
    glow(element, 'success');
    playSoundEffect('success');
    vibrate([50, 30, 50]);
  }

  /**
   * 실패 피드백
   */
  function failFeedback(element: HTMLElement | null, container: HTMLElement | null) {
    pop(element, 'fail');
    shake(container, 'strong');
    glow(element, 'error');
    playSoundEffect('fail');
    vibrate(200);
  }

  /**
   * 콤보 피드백
   */
  function comboFeedback(
    element: HTMLElement | null,
    container: HTMLElement | null,
    x: number,
    y: number,
    comboCount: number
  ) {
    bounce(element, true);
    createScorePopup(x, y, `${comboCount} COMBO!`, 'combo');
    shake(container, 'light');
    playSoundEffect('collect');
    vibrate([30, 20, 30, 20, 30]);
  }

  /**
   * 보너스 피드백
   */
  function bonusFeedback(
    container: HTMLElement | null,
    x: number,
    y: number,
    text: string
  ) {
    createScorePopup(x, y, text, 'bonus');
    shake(container, 'light');
    playSoundEffect('complete');
    vibrate([50, 50, 50]);
  }

  /**
   * 축하 효과 (게임 완료)
   */
  function celebrateFeedback(element: HTMLElement | null) {
    if (!element) return;

    element.classList.add('juicy-celebrate');
    playSoundEffect('complete');
    vibrate([100, 50, 100, 50, 100]);

    setTimeout(() => {
      element.classList.remove('juicy-celebrate');
    }, 800);
  }

  /**
   * 경고 피드백
   */
  function warningFeedback(element: HTMLElement | null) {
    wiggle(element);
    glow(element, 'error');
    playSoundEffect('warning');
    vibrate([100, 50, 100]);
  }

  // Cleanup
  onUnmounted(() => {
    scorePopups.value = [];
  });

  return {
    // 상태
    scorePopups,
    isShaking,
    shakeIntensity,

    // 기본 효과
    bounce,
    squish,
    pop,
    glow,
    pulse,
    wiggle,
    shake,

    // 팝업/파티클
    createScorePopup,
    removeScorePopup,
    createRipple,
    createParticles,

    // 복합 피드백
    tapFeedback,
    collectFeedback,
    successFeedback,
    failFeedback,
    comboFeedback,
    bonusFeedback,
    celebrateFeedback,
    warningFeedback,
  };
}
