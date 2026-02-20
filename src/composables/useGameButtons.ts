// src/composables/useGameButtons.ts
// 미니게임 부모(GameView)가 제공하는 3개 버튼 슬롯 시스템

import { ref, provide, inject, onUnmounted } from 'vue';
import type { Ref } from 'vue';

export interface GameButtonConfig {
  visible: boolean;
  label: string;
  disabled?: boolean;
  /** 버튼 배경 CSS 값 (기본: 노란 그라데이션) */
  bg?: string;
  /** 버튼 테두리 색 */
  border?: string;
  /** 터치 시작 */
  onPress: () => void;
  /** 터치 종료 (선택) */
  onRelease?: () => void;
}

export interface GameButtonsContext {
  buttons: Ref<[GameButtonConfig, GameButtonConfig, GameButtonConfig]>;
  setButton: (index: 0 | 1 | 2, config: Partial<GameButtonConfig>) => void;
  resetButtons: () => void;
  /** 1버튼 모드: 3개 모두 같은 액션 */
  setOneButton: (onPress: () => void, onRelease?: () => void) => void;
  /** 2버튼 모드: 좌(0)·우(2) 활성, 가운데(1) 비활성 */
  setTwoButtons: (
    left: Partial<GameButtonConfig> & { onPress: () => void },
    right: Partial<GameButtonConfig> & { onPress: () => void },
  ) => void;
  /** 3버튼 모드: 전부 활성 */
  setThreeButtons: (
    left: Partial<GameButtonConfig> & { onPress: () => void },
    center: Partial<GameButtonConfig> & { onPress: () => void },
    right: Partial<GameButtonConfig> & { onPress: () => void },
  ) => void;
}

const GAME_BUTTONS_KEY = Symbol('gameButtons');

// 기본값: 항상 visible, disabled(비활성), 빈 라벨
function makeDefault(): GameButtonConfig {
  return { visible: true, label: '', disabled: true, onPress: () => {} };
}

/** GameView에서 호출 - 버튼 상태를 provide */
export function provideGameButtons() {
  const buttons = ref<[GameButtonConfig, GameButtonConfig, GameButtonConfig]>([
    makeDefault(),
    makeDefault(),
    makeDefault(),
  ]);

  const ctx: GameButtonsContext = {
    buttons,
    setButton(index, config) {
      const arr = [...buttons.value] as [GameButtonConfig, GameButtonConfig, GameButtonConfig];
      arr[index] = { ...arr[index], ...config };
      buttons.value = arr;
    },
    resetButtons() {
      buttons.value = [makeDefault(), makeDefault(), makeDefault()];
    },
    setOneButton(onPress, onRelease) {
      const btn: GameButtonConfig = { visible: true, label: '', disabled: false, onPress, onRelease };
      buttons.value = [{ ...btn }, { ...btn }, { ...btn }];
    },
    setTwoButtons(left, right) {
      buttons.value = [
        { ...makeDefault(), disabled: false, ...left },
        makeDefault(), // 가운데는 비활성 유지
        { ...makeDefault(), disabled: false, ...right },
      ];
    },
    setThreeButtons(left, center, right) {
      buttons.value = [
        { ...makeDefault(), disabled: false, ...left },
        { ...makeDefault(), disabled: false, ...center },
        { ...makeDefault(), disabled: false, ...right },
      ];
    },
  };

  provide(GAME_BUTTONS_KEY, ctx);
  return { buttons };
}

/** 미니게임에서 호출 - 버튼 슬롯 제어 */
export function useGameButtons() {
  const ctx = inject<GameButtonsContext>(GAME_BUTTONS_KEY);
  if (!ctx) throw new Error('useGameButtons는 GameView 내부에서만 사용 가능합니다');

  // 게임 언마운트 시 버튼 자동 리셋
  onUnmounted(() => {
    ctx.resetButtons();
  });

  return ctx;
}
