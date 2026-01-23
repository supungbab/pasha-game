// src/utils/difficulty.ts

import type { DifficultyLevel, DifficultyMultipliers } from '@/types/game';
import { GAME_CONSTANTS, DIFFICULTY_TIERS, DIFFICULTY_MULTIPLIERS } from '@/types/game';

/**
 * 판 번호로부터 난이도 레벨 계산
 */
export function getDifficultyFromStage(stage: number): DifficultyLevel {
  if (stage <= 0) return 1;
  if (stage > GAME_CONSTANTS.TOTAL_STAGES) return 6;

  const tier = DIFFICULTY_TIERS.find(
    tier => stage >= tier.stageRange[0] && stage <= tier.stageRange[1]
  );

  return tier?.level ?? 1;
}

/**
 * 난이도 정보 가져오기
 */
export function getDifficultyInfo(level: DifficultyLevel) {
  return DIFFICULTY_TIERS.find(tier => tier.level === level) ?? DIFFICULTY_TIERS[0];
}

/**
 * 난이도 배율 가져오기
 */
export function getDifficultyMultipliers(level: DifficultyLevel): DifficultyMultipliers {
  return DIFFICULTY_MULTIPLIERS[level];
}

/**
 * 하드 모드 출현 여부 계산
 */
export function shouldActivateHardMode(): boolean {
  return Math.random() < GAME_CONSTANTS.HARD_MODE_PROBABILITY;
}

/**
 * 하드 모드 적용된 난이도 계산
 */
export function getHardModeDifficulty(baseDifficulty: DifficultyLevel): number {
  return Math.min(6, baseDifficulty + 1.5);
}

/**
 * 목표 점수 계산
 * @param baseTargetScore 미니게임의 기본 목표점수
 * @param difficulty 현재 난이도 레벨
 * @param isHardMode 하드모드 여부
 */
export function calculateTargetScore(
  baseTargetScore: number,
  difficulty: DifficultyLevel,
  isHardMode: boolean = false
): number {
  const multiplier = DIFFICULTY_MULTIPLIERS[difficulty].targetScore;
  let target = Math.round(baseTargetScore * multiplier);

  if (isHardMode) {
    target = Math.round(target * GAME_CONSTANTS.HARD_MODE_DIFFICULTY_BOOST);
  }

  return target;
}

/**
 * 제한 시간 계산
 * @param baseTimeLimit 미니게임의 기본 제한시간 (초)
 * @param difficulty 현재 난이도 레벨
 * @param isHardMode 하드모드 여부
 */
export function calculateTimeLimit(
  baseTimeLimit: number,
  difficulty: DifficultyLevel,
  isHardMode: boolean = false
): number {
  const multiplier = DIFFICULTY_MULTIPLIERS[difficulty].timeLimit;
  let time = baseTimeLimit * multiplier;

  if (isHardMode) {
    time = time * 0.85; // 하드모드는 15% 시간 감소
  }

  return Math.max(3, Number(time.toFixed(1))); // 최소 3초
}

/**
 * 속도 배율 계산
 * @param difficulty 현재 난이도 레벨
 * @param isHardMode 하드모드 여부
 */
export function calculateSpeedMultiplier(
  difficulty: DifficultyLevel,
  isHardMode: boolean = false
): number {
  const multiplier = DIFFICULTY_MULTIPLIERS[difficulty].speed;

  if (isHardMode) {
    return multiplier * 1.3; // 하드모드는 30% 더 빠름
  }

  return multiplier;
}

/**
 * 복잡도 배율 계산 (오브젝트 수 등)
 * @param difficulty 현재 난이도 레벨
 * @param isHardMode 하드모드 여부
 */
export function calculateComplexityMultiplier(
  difficulty: DifficultyLevel,
  isHardMode: boolean = false
): number {
  const multiplier = DIFFICULTY_MULTIPLIERS[difficulty].complexity;

  if (isHardMode) {
    return multiplier * 1.2; // 하드모드는 20% 더 복잡
  }

  return multiplier;
}

/**
 * 난이도 보너스 계산
 */
export function calculateDifficultyBonus(maxDifficulty: number): number {
  return maxDifficulty * GAME_CONSTANTS.DIFFICULTY_BONUS_PER_LEVEL;
}

/**
 * 하드 모드 보너스 계산
 */
export function calculateHardModeBonus(hardModeCount: number): number {
  return hardModeCount * GAME_CONSTANTS.HARD_MODE_BONUS;
}

/**
 * 최종 점수 계산
 */
export function calculateFinalScore(
  baseScore: number,
  maxDifficulty: number,
  hardModeCount: number
): number {
  const difficultyBonus = calculateDifficultyBonus(maxDifficulty);
  const hardModeBonus = calculateHardModeBonus(hardModeCount);

  return baseScore + difficultyBonus + hardModeBonus;
}

/**
 * 진행률 계산 (0-100)
 */
export function calculateProgress(currentStage: number): number {
  return Math.min(100, Math.round((currentStage / GAME_CONSTANTS.TOTAL_STAGES) * 100));
}

/**
 * 난이도 색상 가져오기
 */
export function getDifficultyColor(level: DifficultyLevel): string {
  const colors: Record<DifficultyLevel, string> = {
    1: '#4CAF50',  // 초록
    2: '#8BC34A',  // 연두
    3: '#FFC107',  // 노랑
    4: '#FF9800',  // 주황
    5: '#FF5722',  // 빨강
    6: '#F44336'   // 진한 빨강
  };

  return colors[level];
}

/**
 * 난이도 이모지 반복 (⭐⭐⭐)
 */
export function getDifficultyEmoji(level: DifficultyLevel): string {
  if (level === 6) return '🔥';
  return '⭐'.repeat(level);
}

/**
 * 성공 여부 판정
 */
export function isGameSuccess(score: number, targetScore: number): boolean {
  return score >= targetScore;
}

/**
 * 퍼펙트 클리어 판정 (목표의 150% 이상)
 */
export function isPerfectClear(score: number, targetScore: number): boolean {
  return score >= targetScore * 1.5;
}

/**
 * 등급 계산 (S, A, B, C, F)
 */
export function calculateGrade(score: number, targetScore: number): string {
  const ratio = score / targetScore;

  if (ratio >= 1.5) return 'S';
  if (ratio >= 1.2) return 'A';
  if (ratio >= 1.0) return 'B';
  if (ratio >= 0.8) return 'C';
  return 'F';
}

/**
 * 등급 색상 가져오기
 */
export function getGradeColor(grade: string): string {
  const colors: Record<string, string> = {
    S: '#FFD700',  // 금색
    A: '#4CAF50',  // 초록
    B: '#2196F3',  // 파랑
    C: '#FFC107',  // 노랑
    F: '#F44336'   // 빨강
  };

  return colors[grade] ?? '#9E9E9E';
}
