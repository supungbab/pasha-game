// src/types/game.ts

import type { MiniGame, MiniGameResult } from './minigame';

/**
 * 게임 상태 (게임 진행 단계)
 */
export type GamePhase =
  | 'menu'           // 메인 메뉴
  | 'instruction'    // 미니게임 시작 전 지시문
  | 'playing'        // 미니게임 플레이 중
  | 'result'         // 미니게임 결과 표시
  | 'gameover'       // 게임 오버
  | 'complete';      // 30개 전부 클리어

/**
 * 난이도 레벨
 */
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * 난이도 구간 정보
 */
export interface DifficultyTier {
  level: DifficultyLevel;
  name: string;
  emoji: string;
  stageRange: [number, number];  // [시작판, 끝판]
  multiplier: number;             // 난이도 계수
  description: string;
}

/**
 * 게임 상태
 */
export interface GameState {
  phase: GamePhase;
  lives: number;                  // 남은 목숨 (0-3)
  score: number;                  // 현재 점수
  currentStage: number;           // 현재 판 (1-30)
  currentDifficulty: DifficultyLevel; // 현재 난이도
  isHardMode: boolean;            // 현재 판이 하드모드인지
  hardModeCleared: number;        // 클리어한 하드모드 수
  maxDifficultyReached: number;   // 도달한 최고 난이도
  continueUsed: boolean;          // 컨티뉴 사용 여부
  playTime: number;               // 플레이 시간 (초)
}

/**
 * 미니게임 대기열
 */
export interface GameQueue {
  remaining: MiniGame[];          // 남은 게임들
  completed: MiniGame[];          // 완료한 게임들
  current: MiniGame | null;       // 현재 게임
}

/**
 * 게임 세션 (전체 게임 진행 데이터)
 */
export interface GameSession {
  state: GameState;
  queue: GameQueue;
  history: MiniGameResult[];      // 각 판의 결과 기록
  startTime: Date;
  endTime?: Date;
}

/**
 * 컨티뉴 시스템 상태
 */
export interface ContinueState {
  available: boolean;             // 사용 가능 여부
  countdown: number;              // 남은 시간 (초, 10-0)
  isActive: boolean;              // 카운트다운 진행 중인지
}

/**
 * 게임 설정
 */
export interface GameSettings {
  sound: boolean;                 // 사운드 활성화
  vibration: boolean;             // 진동 활성화
  showTutorial: boolean;          // 튜토리얼 표시 여부
  language: 'ko' | 'en';          // 언어
  volume: number;                 // 볼륨 (0-100)
}

/**
 * 플레이어 데이터
 */
export interface PlayerData {
  name: string;                   // 플레이어 이름
  bestScore: number;              // 최고 점수
  bestStage: number;              // 최대 클리어 판 수
  totalGamesPlayed: number;       // 총 플레이 횟수
  settings: GameSettings;         // 설정
  lastPlayedAt?: Date;            // 마지막 플레이 시간
}

/**
 * 게임 결과 (게임 오버 또는 완료 시)
 */
export interface GameResult {
  finalScore: number;
  clearedStages: number;
  maxDifficulty: DifficultyLevel;
  hardModeCount: number;
  playTime: number;
  continueUsed: boolean;
  history: MiniGameResult[];
  bonusScore: {
    difficulty: number;           // 난이도 보너스
    hardMode: number;             // 하드모드 보너스
  };
}

/**
 * 난이도별 설정 계수
 */
export interface DifficultyMultipliers {
  targetScore: number;            // 목표 점수 배율
  timeLimit: number;              // 시간 제한 배율 (감소)
  speed: number;                  // 속도 배율
  complexity: number;             // 복잡도 배율
}

/**
 * 하드 모드 설정
 */
export interface HardModeConfig {
  probability: number;            // 출현 확률 (0.12 = 12%)
  difficultyBoost: number;        // 난이도 추가 증가 레벨
  bonusMultiplier: number;        // 보너스 점수 배율
}

/**
 * 게임 상수
 */
export const GAME_CONSTANTS = {
  MAX_LIVES: 3,
  TOTAL_STAGES: 30,
  CONTINUE_COUNTDOWN: 10,         // 컨티뉴 카운트다운 (초)
  INSTRUCTION_DURATION: 1.5,      // 지시문 표시 시간 (초)
  RESULT_DISPLAY_DURATION: 2,     // 결과 표시 시간 (초)
  STAGES_PER_DIFFICULTY: 5,       // 난이도당 판 수

  // 보너스 점수
  DIFFICULTY_BONUS_PER_LEVEL: 500,
  HARD_MODE_BONUS: 200,

  // 하드 모드
  HARD_MODE_PROBABILITY: 0.12,
  HARD_MODE_DIFFICULTY_BOOST: 1.5,
} as const;

/**
 * 난이도 구간 데이터
 */
export const DIFFICULTY_TIERS: DifficultyTier[] = [
  {
    level: 1,
    name: '매우 쉬움',
    emoji: '⭐',
    stageRange: [1, 5],
    multiplier: 1.0,
    description: '게임 적응 단계'
  },
  {
    level: 2,
    name: '쉬움',
    emoji: '⭐⭐',
    stageRange: [6, 10],
    multiplier: 1.2,
    description: '기본 실력 테스트'
  },
  {
    level: 3,
    name: '보통',
    emoji: '⭐⭐⭐',
    stageRange: [11, 15],
    multiplier: 1.5,
    description: '집중력 요구'
  },
  {
    level: 4,
    name: '어려움',
    emoji: '⭐⭐⭐⭐',
    stageRange: [16, 20],
    multiplier: 1.8,
    description: '높은 반응속도 필요'
  },
  {
    level: 5,
    name: '매우 어려움',
    emoji: '⭐⭐⭐⭐⭐',
    stageRange: [21, 25],
    multiplier: 2.2,
    description: '전문가 수준'
  },
  {
    level: 6,
    name: '극한',
    emoji: '🔥',
    stageRange: [26, 30],
    multiplier: 2.5,
    description: '최고난이도'
  }
];

/**
 * 난이도 계수 계산
 */
export const DIFFICULTY_MULTIPLIERS: Record<DifficultyLevel, DifficultyMultipliers> = {
  1: { targetScore: 1.0, timeLimit: 1.0, speed: 1.0, complexity: 1.0 },
  2: { targetScore: 1.2, timeLimit: 0.95, speed: 1.1, complexity: 1.2 },
  3: { targetScore: 1.5, timeLimit: 0.9, speed: 1.3, complexity: 1.4 },
  4: { targetScore: 1.8, timeLimit: 0.85, speed: 1.5, complexity: 1.6 },
  5: { targetScore: 2.2, timeLimit: 0.8, speed: 1.8, complexity: 1.9 },
  6: { targetScore: 2.5, timeLimit: 0.75, speed: 2.0, complexity: 2.2 }
};

/**
 * 기본 게임 설정
 */
export const DEFAULT_SETTINGS: GameSettings = {
  sound: true,
  vibration: true,
  showTutorial: true,
  language: 'ko',
  volume: 80
};

/**
 * 초기 게임 상태
 */
export const INITIAL_GAME_STATE: GameState = {
  phase: 'menu',
  lives: GAME_CONSTANTS.MAX_LIVES,
  score: 0,
  currentStage: 0,
  currentDifficulty: 1,
  isHardMode: false,
  hardModeCleared: 0,
  maxDifficultyReached: 1,
  continueUsed: false,
  playTime: 0
};
