// src/config/colors.ts

/**
 * 게임 색상 팔레트
 */

// 메인 색상
export const PRIMARY_COLORS = {
  primary: '#FF6B6B',      // 빨강
  secondary: '#4ECDC4',    // 청록
  accent: '#FFE66D',       // 노랑
  success: '#4CAF50',      // 초록
  warning: '#FFC107',      // 주황
  error: '#F44336',        // 진한 빨강
  info: '#2196F3',         // 파랑
} as const;

// 배경 색상
export const BACKGROUND_COLORS = {
  main: '#F7FFF7',         // 메인 배경
  card: '#FFFFFF',         // 카드 배경
  overlay: 'rgba(0, 0, 0, 0.5)',  // 오버레이
  canvas: '#F7FFF7',       // 캔버스 배경
} as const;

// 텍스트 색상
export const TEXT_COLORS = {
  primary: '#2C3E50',      // 주 텍스트
  secondary: '#7F8C8D',    // 보조 텍스트
  light: '#FFFFFF',        // 밝은 텍스트
  dark: '#000000',         // 어두운 텍스트
} as const;

// 난이도 색상
export const DIFFICULTY_COLORS = {
  1: '#4CAF50',            // 초록 (쉬움)
  2: '#8BC34A',            // 연두
  3: '#FFC107',            // 노랑 (보통)
  4: '#FF9800',            // 주황
  5: '#FF5722',            // 빨강 (어려움)
  6: '#F44336',            // 진한 빨강 (극한)
} as const;

// 등급 색상
export const GRADE_COLORS = {
  S: '#FFD700',            // 금색
  A: '#4CAF50',            // 초록
  B: '#2196F3',            // 파랑
  C: '#FFC107',            // 노랑
  F: '#F44336',            // 빨강
} as const;

// 게임 오브젝트 색상
export const GAME_COLORS = {
  balloon: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#45B7D1', '#F7DC6F'],
  fruit: ['#FF6B6B', '#FFA500', '#FFEB3B', '#4CAF50', '#9C27B0'],
  obstacle: ['#F44336', '#E91E63', '#9C27B0'],
  collectible: ['#FFD700', '#4CAF50', '#2196F3'],
  platform: ['#8B4513', '#A0522D', '#D2691E'],
} as const;

// 밝은 색상 (랜덤 선택용)
export const BRIGHT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  '#F8B739', '#52B788', '#E63946', '#457B9D',
] as const;

// 파스텔 색상
export const PASTEL_COLORS = [
  '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9',
  '#BAE1FF', '#E0BBE4', '#FEC8D8', '#FFDFD3',
] as const;

// 그라데이션
export const GRADIENTS = {
  primary: 'linear-gradient(135deg, #FF6B6B, #4ECDC4)',
  success: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
  warning: 'linear-gradient(135deg, #FFC107, #FF9800)',
  error: 'linear-gradient(135deg, #F44336, #E91E63)',
  rainbow: 'linear-gradient(135deg, #FF6B6B, #FFE66D, #4ECDC4, #45B7D1)',
} as const;

// UI 색상
export const UI_COLORS = {
  buttonPrimary: '#FF6B6B',
  buttonSecondary: '#4ECDC4',
  buttonDisabled: '#CCCCCC',
  border: '#E0E0E0',
  divider: '#EEEEEE',
  shadow: 'rgba(0, 0, 0, 0.1)',
} as const;

// 상태 색상
export const STATE_COLORS = {
  normal: '#4CAF50',
  warning: '#FFC107',
  danger: '#F44336',
  disabled: '#9E9E9E',
  active: '#2196F3',
} as const;

// 색상 유틸리티 함수
export function hexToRgba(hex: string, alpha: number = 1): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getRandomBrightColor(): string {
  return BRIGHT_COLORS[Math.floor(Math.random() * BRIGHT_COLORS.length)];
}

export function getRandomPastelColor(): string {
  return PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)];
}
