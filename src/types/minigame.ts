// src/types/minigame.ts

import type { Component } from 'vue';

/**
 * 점수 계산 타입
 */
export type ScoreType = 
  | 'speed'      // 속도 기반 (남은 시간 × 배율)
  | 'accuracy'   // 정확도 기반 (성공률 × 100)
  | 'count'      // 횟수 기반 (성공 횟수 × 점수)
  | 'hybrid';    // 복합 (여러 요소 조합)

/**
 * 미니게임 정의
 */
export interface MiniGame {
  id: number;
  name: string;
  nameEn: string;              // 영문 이름
  category: string;            // 카테고리
  instruction: string;         // 시작 전 지시문 ("탭하세요!")
  instructionEmoji: string;    // 지시문 이모지 ("👆")
  scoreType: ScoreType;
  baseTimeLimit: number;       // 기본 제한시간 (초)
  baseTargetScore: number;     // 기본 목표점수
  component: Component;        // Vue 컴포넌트
  difficulty: 1 | 2 | 3 | 4 | 5; // 기본 난이도
}

/**
 * 미니게임 Props
 */
export interface MiniGameProps {
  difficulty: number;          // 현재 난이도 (1-6)
  timeLimit: number;           // 제한시간 (초)
  targetScore: number;         // 목표 점수
  isHardMode: boolean;         // 하드모드 여부
}

/**
 * 미니게임 결과
 */
export interface MiniGameResult {
  success: boolean;            // 목표 달성 여부
  score: number;              // 획득 점수
  timeRemaining: number;      // 남은 시간 (초)
  accuracy?: number;          // 정확도 (0-100, 옵션)
  count?: number;             // 성공 횟수 (옵션)
  attempts?: number;          // 시도 횟수 (옵션)
  perfect?: boolean;          // 완벽한 클리어 (옵션)
}

/**
 * 미니게임 통계
 */
export interface MiniGameStats {
  gameId: number;
  playCount: number;          // 플레이 횟수
  successCount: number;       // 성공 횟수
  bestScore: number;          // 최고 점수
  averageScore: number;       // 평균 점수
  fastestTime: number;        // 최단 시간
  successRate: number;        // 성공률 (0-100)
}

/**
 * 게임 카테고리
 */
export type GameCategory = 
  | 'action'         // 액션/반사신경
  | 'puzzle'         // 퍼즐/인지
  | 'timing'         // 타이밍
  | 'memory'         // 기억력
  | 'collection'     // 수집
  | 'precision';     // 정밀도

/**
 * 입력 타입
 */
export type InputType = 
  | 'tap'            // 탭
  | 'swipe'          // 스와이프
  | 'drag'           // 드래그
  | 'tilt'           // 기울이기
  | 'multi-tap';     // 여러 곳 탭
