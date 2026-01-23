// src/types/ranking.ts

/**
 * 랭킹 엔트리
 */
export interface RankingEntry {
  rank: number;
  playerName: string;
  score: number;
  clearedStages: number;      // 클리어한 판 수
  maxDifficulty: number;      // 도달한 최고 난이도
  playDate: Date;
  isHardModeCleared: boolean; // 하드모드 1개 이상 클리어 여부
  hardModeCount?: number;     // 클리어한 하드모드 수
  playTime?: number;          // 플레이 시간 (초)
}

/**
 * 랭킹 타입
 */
export type RankingType = 'global' | 'local';

/**
 * 랭킹 필터
 */
export interface RankingFilter {
  type: RankingType;
  period?: 'all' | 'daily' | 'weekly' | 'monthly';
  limit?: number;             // 가져올 개수 (기본: 100)
}

/**
 * 랭킹 응답
 */
export interface RankingResponse {
  entries: RankingEntry[];
  myRank?: number;            // 현재 사용자 순위
  myEntry?: RankingEntry;     // 현재 사용자 엔트리
  totalPlayers: number;       // 전체 플레이어 수
  lastUpdated: Date;          // 마지막 업데이트 시간
}
