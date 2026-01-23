// src/config/constants.ts

/**
 * 게임 상수 모음
 */

// 게임 시스템
export const GAME_CONFIG = {
  MAX_LIVES: 3,
  TOTAL_STAGES: 30,
  CONTINUE_COUNTDOWN: 10,
  INSTRUCTION_DURATION: 1.5,
  RESULT_DISPLAY_DURATION: 2,
  STAGES_PER_DIFFICULTY: 5,
} as const;

// 보너스 점수
export const BONUS_CONFIG = {
  DIFFICULTY_BONUS_PER_LEVEL: 500,
  HARD_MODE_BONUS: 200,
  PERFECT_CLEAR_MULTIPLIER: 1.5,
} as const;

// 하드 모드
export const HARD_MODE_CONFIG = {
  PROBABILITY: 0.12,
  DIFFICULTY_BOOST: 1.5,
  TIME_REDUCTION: 0.85,
  SPEED_INCREASE: 1.3,
  COMPLEXITY_INCREASE: 1.2,
} as const;

// 난이도 배율
export const DIFFICULTY_MULTIPLIERS = {
  1: { targetScore: 1.0, timeLimit: 1.0, speed: 1.0, complexity: 1.0 },
  2: { targetScore: 1.2, timeLimit: 0.95, speed: 1.1, complexity: 1.2 },
  3: { targetScore: 1.5, timeLimit: 0.9, speed: 1.3, complexity: 1.4 },
  4: { targetScore: 1.8, timeLimit: 0.85, speed: 1.5, complexity: 1.6 },
  5: { targetScore: 2.2, timeLimit: 0.8, speed: 1.8, complexity: 1.9 },
  6: { targetScore: 2.5, timeLimit: 0.75, speed: 2.0, complexity: 2.2 },
} as const;

// 캔버스 설정
export const CANVAS_CONFIG = {
  DEFAULT_WIDTH: 400,
  DEFAULT_HEIGHT: 600,
  BACKGROUND_COLOR: '#F7FFF7',
  MIN_SWIPE_DISTANCE: 50,
  TAP_THRESHOLD: 10,
} as const;

// 타이머 설정
export const TIMER_CONFIG = {
  WARNING_THRESHOLD: 3,
  TICK_INTERVAL: 100,
} as const;

// 오디오 설정
export const AUDIO_CONFIG = {
  DEFAULT_VOLUME: 80,
  MIN_VOLUME: 0,
  MAX_VOLUME: 100,
  SOUND_EFFECT_VOLUME: 0.3,
} as const;

// 로컬 스토리지 키
export const STORAGE_KEYS = {
  HIGH_SCORE: 'pasha-high-score',
  SETTINGS: 'pasha-settings',
  LOCAL_RANKINGS: 'pasha-local-rankings',
  PLAYER_NAME: 'pasha-player-name',
  PLAYER_DATA: 'pasha-player-data',
  GAME_STATS: 'pasha-game-stats',
} as const;

// 랭킹 설정
export const RANKING_CONFIG = {
  LOCAL_RANKING_LIMIT: 100,
  DISPLAY_LIMIT: 10,
} as const;

// 애니메이션 시간 (ms)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  SCORE_COUNT_UP: 500,
  RESULT_DISPLAY: 2000,
  INSTRUCTION_DISPLAY: 1500,
} as const;

// 진동 패턴
export const VIBRATION_PATTERNS = {
  TAP: 20,
  SUCCESS: [50, 30, 50],
  FAIL: 200,
  WARNING: [100, 50, 100],
  COMPLETE: [50, 50, 50, 50, 100],
} as const;

// 점수 등급
export const GRADE_THRESHOLDS = {
  S: 1.5,
  A: 1.2,
  B: 1.0,
  C: 0.8,
  F: 0,
} as const;

// 개발 모드
export const DEV_CONFIG = {
  ENABLE_DEBUG: import.meta.env.DEV,
  SKIP_INSTRUCTION: false,
  INFINITE_LIVES: false,
  START_STAGE: 1,
} as const;
