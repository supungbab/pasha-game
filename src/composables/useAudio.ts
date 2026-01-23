// src/composables/useAudio.ts

import { ref, watch } from 'vue';
import type { GameSettings } from '@/types/game';
import { getSettings, saveSettings } from '@/utils/storage';

/**
 * 사운드 타입
 */
export type SoundEffect =
  | 'tap'         // 탭/클릭
  | 'success'     // 성공
  | 'fail'        // 실패
  | 'popup'       // 풍선 터지는 소리
  | 'slice'       // 자르기
  | 'collect'     // 수집
  | 'warning'     // 경고
  | 'countdown'   // 카운트다운
  | 'complete';   // 완료

/**
 * 오디오 관리 Composable
 */
export function useAudio() {
  const settings = ref<GameSettings>(getSettings());

  // Audio Context
  let audioContext: AudioContext | null = null;

  /**
   * Audio Context 초기화
   */
  function initAudioContext() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
  }

  /**
   * 사운드 이펙트 재생 (Web Audio API로 프로시저럴 생성)
   */
  function playSoundEffect(type: SoundEffect) {
    if (!settings.value.sound) return;

    const ctx = initAudioContext();
    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // 볼륨 조절
    const volume = settings.value.volume / 100 * 0.3;

    switch (type) {
      case 'tap':
        // 짧은 클릭 소리
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(volume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        oscillator.start(now);
        oscillator.stop(now + 0.05);
        break;

      case 'success':
        // 상승하는 소리
        oscillator.frequency.setValueAtTime(440, now);
        oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.2);
        gainNode.gain.setValueAtTime(volume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        oscillator.start(now);
        oscillator.stop(now + 0.2);
        break;

      case 'fail':
        // 하강하는 소리
        oscillator.frequency.setValueAtTime(440, now);
        oscillator.frequency.exponentialRampToValueAtTime(220, now + 0.3);
        gainNode.gain.setValueAtTime(volume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        oscillator.type = 'sawtooth';
        oscillator.start(now);
        oscillator.stop(now + 0.3);
        break;

      case 'popup':
        // 풍선 터지는 소리
        oscillator.frequency.value = 300;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(volume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
        break;

      case 'slice':
        // 자르는 소리
        oscillator.frequency.setValueAtTime(1200, now);
        oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.1);
        oscillator.type = 'sawtooth';
        gainNode.gain.setValueAtTime(volume * 0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
        break;

      case 'collect':
        // 수집 소리
        oscillator.frequency.setValueAtTime(600, now);
        oscillator.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(volume * 0.8, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
        break;

      case 'warning':
        // 경고음
        oscillator.frequency.value = 800;
        oscillator.type = 'square';
        gainNode.gain.setValueAtTime(volume * 0.5, now);
        gainNode.gain.setValueAtTime(0, now + 0.05);
        gainNode.gain.setValueAtTime(volume * 0.5, now + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        oscillator.start(now);
        oscillator.stop(now + 0.15);
        break;

      case 'countdown':
        // 카운트다운 틱
        oscillator.frequency.value = 1000;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(volume * 0.6, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
        break;

      case 'complete':
        // 완료 멜로디
        const frequencies = [523, 659, 784, 1047]; // C, E, G, C (한 옥타브 위)
        frequencies.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          osc.type = 'sine';
          const startTime = now + i * 0.1;
          gain.gain.setValueAtTime(volume * 0.5, startTime);
          gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
          osc.start(startTime);
          osc.stop(startTime + 0.2);
        });
        return; // 이미 oscillator들을 시작했으므로 return
    }
  }

  /**
   * 설정 업데이트
   */
  function updateSettings(newSettings: Partial<GameSettings>) {
    settings.value = { ...settings.value, ...newSettings };
    saveSettings(settings.value);
  }

  /**
   * 사운드 토글
   */
  function toggleSound() {
    updateSettings({ sound: !settings.value.sound });
  }

  /**
   * 진동 토글
   */
  function toggleVibration() {
    updateSettings({ vibration: !settings.value.vibration });
  }

  /**
   * 볼륨 설정
   */
  function setVolume(volume: number) {
    updateSettings({ volume: Math.max(0, Math.min(100, volume)) });
  }

  /**
   * 진동 재생
   */
  function vibrate(pattern?: number | number[]) {
    if (!settings.value.vibration) return;
    if (!navigator.vibrate) return;

    if (pattern) {
      navigator.vibrate(pattern);
    } else {
      navigator.vibrate(50); // 기본 50ms
    }
  }

  /**
   * 탭 피드백
   */
  function tapFeedback() {
    playSoundEffect('tap');
    vibrate(20);
  }

  /**
   * 성공 피드백
   */
  function successFeedback() {
    playSoundEffect('success');
    vibrate([50, 30, 50]);
  }

  /**
   * 실패 피드백
   */
  function failFeedback() {
    playSoundEffect('fail');
    vibrate(200);
  }

  /**
   * 경고 피드백
   */
  function warningFeedback() {
    playSoundEffect('warning');
    vibrate([100, 50, 100]);
  }

  // 설정 변경 시 저장
  watch(settings, (newSettings) => {
    saveSettings(newSettings);
  }, { deep: true });

  return {
    settings,
    playSoundEffect,
    updateSettings,
    toggleSound,
    toggleVibration,
    setVolume,
    vibrate,
    tapFeedback,
    successFeedback,
    failFeedback,
    warningFeedback
  };
}
