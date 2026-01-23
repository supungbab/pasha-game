// src/composables/useGameState.ts

import { ref, computed, readonly } from 'vue';
import type { GameState, GameSession, GameQueue, GamePhase, ContinueState } from '@/types/game';
import type { MiniGame, MiniGameResult } from '@/types/minigame';
import { GAME_CONSTANTS, INITIAL_GAME_STATE } from '@/types/game';
import { getDifficultyFromStage, shouldActivateHardMode } from '@/utils/difficulty';
import { shuffle } from '@/utils/random';

/**
 * 게임 상태 관리 Composable
 */
export function useGameState() {
  // 게임 상태
  const state = ref<GameState>({ ...INITIAL_GAME_STATE });

  // 게임 큐
  const queue = ref<GameQueue>({
    remaining: [],
    completed: [],
    current: null
  });

  // 게임 히스토리
  const history = ref<MiniGameResult[]>([]);

  // 컨티뉴 상태
  const continueState = ref<ContinueState>({
    available: true,
    countdown: GAME_CONSTANTS.CONTINUE_COUNTDOWN,
    isActive: false
  });

  // 게임 시작 시간
  const startTime = ref<Date | null>(null);

  // Computed
  const isGameActive = computed(() => {
    return state.value.phase === 'playing' || state.value.phase === 'instruction';
  });

  const canContinue = computed(() => {
    return continueState.value.available && !state.value.continueUsed;
  });

  const progress = computed(() => {
    return Math.round((state.value.currentStage / GAME_CONSTANTS.TOTAL_STAGES) * 100);
  });

  const remainingStages = computed(() => {
    return GAME_CONSTANTS.TOTAL_STAGES - state.value.currentStage;
  });

  // 게임 세션 데이터
  const session = computed<GameSession>(() => ({
    state: state.value,
    queue: queue.value,
    history: history.value,
    startTime: startTime.value || new Date(),
    endTime: state.value.phase === 'gameover' || state.value.phase === 'complete'
      ? new Date()
      : undefined
  }));

  /**
   * 게임 초기화
   */
  function initGame(miniGames: MiniGame[]) {
    // 상태 초기화
    state.value = { ...INITIAL_GAME_STATE };
    history.value = [];
    startTime.value = new Date();

    // 미니게임 섞기
    const shuffled = shuffle(miniGames);
    queue.value = {
      remaining: shuffled,
      completed: [],
      current: null
    };

    // 컨티뉴 초기화
    continueState.value = {
      available: true,
      countdown: GAME_CONSTANTS.CONTINUE_COUNTDOWN,
      isActive: false
    };

    // 첫 게임 준비
    state.value.phase = 'menu';
  }

  /**
   * 게임 시작
   */
  function startGame() {
    if (queue.value.remaining.length === 0) return;

    state.value.phase = 'instruction';
    state.value.currentStage = 1;
    state.value.lives = GAME_CONSTANTS.MAX_LIVES;
    state.value.score = 0;

    nextMiniGame();
  }

  /**
   * 다음 미니게임 로드
   */
  function nextMiniGame() {
    if (queue.value.remaining.length === 0) {
      // 모든 게임 완료
      state.value.phase = 'complete';
      return;
    }

    // 다음 게임 가져오기
    const next = queue.value.remaining.shift()!;
    queue.value.current = next;

    // 난이도 계산
    state.value.currentDifficulty = getDifficultyFromStage(state.value.currentStage);

    // 하드모드 판정
    state.value.isHardMode = shouldActivateHardMode();

    // 최고 난이도 업데이트
    if (state.value.currentDifficulty > state.value.maxDifficultyReached) {
      state.value.maxDifficultyReached = state.value.currentDifficulty;
    }

    state.value.phase = 'instruction';
  }

  /**
   * 미니게임 시작
   */
  function startMiniGame() {
    state.value.phase = 'playing';
  }

  /**
   * 미니게임 결과 처리
   */
  function completeMiniGame(result: MiniGameResult) {
    // 히스토리에 추가
    history.value.push(result);

    // 점수 추가
    state.value.score += result.score;

    // 현재 게임을 완료 목록에 추가
    if (queue.value.current) {
      queue.value.completed.push(queue.value.current);
      queue.value.current = null;
    }

    // 성공/실패 처리
    if (result.success) {
      // 하드모드 성공 시 카운트
      if (state.value.isHardMode) {
        state.value.hardModeCleared++;
      }
    } else {
      // 실패 시 목숨 감소
      loseLife();
    }

    // 판 증가
    state.value.currentStage++;

    // 결과 표시
    state.value.phase = 'result';
  }

  /**
   * 결과 확인 후 다음 진행
   */
  function proceedToNext() {
    if (state.value.lives <= 0) {
      // 게임 오버
      gameOver();
    } else if (state.value.currentStage > GAME_CONSTANTS.TOTAL_STAGES) {
      // 게임 완료
      state.value.phase = 'complete';
    } else {
      // 다음 게임
      nextMiniGame();
    }
  }

  /**
   * 목숨 감소
   */
  function loseLife() {
    if (state.value.lives > 0) {
      state.value.lives--;
    }
  }

  /**
   * 게임 오버
   */
  function gameOver() {
    state.value.phase = 'gameover';

    // 컨티뉴 가능하면 카운트다운 시작
    if (canContinue.value) {
      startContinueCountdown();
    }
  }

  /**
   * 컨티뉴 카운트다운 시작
   */
  function startContinueCountdown() {
    continueState.value.isActive = true;
    continueState.value.countdown = GAME_CONSTANTS.CONTINUE_COUNTDOWN;

    const interval = setInterval(() => {
      continueState.value.countdown--;

      if (continueState.value.countdown <= 0) {
        clearInterval(interval);
        continueState.value.isActive = false;
      }
    }, 1000);
  }

  /**
   * 컨티뉴 사용
   */
  function useContinue() {
    if (!canContinue.value) return false;

    // 컨티뉴 사용 표시
    state.value.continueUsed = true;
    continueState.value.available = false;
    continueState.value.isActive = false;

    // 목숨 충전
    state.value.lives = GAME_CONSTANTS.MAX_LIVES;

    // 현재 판부터 재개
    state.value.phase = 'instruction';

    return true;
  }

  /**
   * 컨티뉴 거부
   */
  function declineContinue() {
    continueState.value.isActive = false;
  }

  /**
   * 게임 재시작
   */
  function restartGame(miniGames: MiniGame[]) {
    initGame(miniGames);
    startGame();
  }

  /**
   * 메뉴로 돌아가기
   */
  function returnToMenu() {
    state.value.phase = 'menu';
  }

  /**
   * 플레이 시간 업데이트
   */
  function updatePlayTime() {
    if (startTime.value) {
      const now = new Date();
      state.value.playTime = Math.floor((now.getTime() - startTime.value.getTime()) / 1000);
    }
  }

  return {
    // State (readonly)
    state: readonly(state),
    queue: readonly(queue),
    history: readonly(history),
    continueState: readonly(continueState),
    session,

    // Computed
    isGameActive,
    canContinue,
    progress,
    remainingStages,

    // Methods
    initGame,
    startGame,
    nextMiniGame,
    startMiniGame,
    completeMiniGame,
    proceedToNext,
    loseLife,
    gameOver,
    useContinue,
    declineContinue,
    restartGame,
    returnToMenu,
    updatePlayTime
  };
}
