// src/utils/storage.ts

import type { GameSettings, PlayerData } from '@/types/game';
import type { RankingEntry } from '@/types/ranking';
import { DEFAULT_SETTINGS } from '@/types/game';

const STORAGE_KEYS = {
  HIGH_SCORE: 'pasha-high-score',
  SETTINGS: 'pasha-settings',
  LOCAL_RANKINGS: 'pasha-local-rankings',
  PLAYER_NAME: 'pasha-player-name',
  PLAYER_DATA: 'pasha-player-data',
  GAME_STATS: 'pasha-game-stats',
} as const;

/**
 * 기본 설정값
 */
function getDefaultSettings(): GameSettings {
  return { ...DEFAULT_SETTINGS };
}

/**
 * 최고 점수 저장
 */
export function saveHighScore(score: number): void {
  const current = getHighScore();
  if (score > current) {
    localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, score.toString());
  }
}

/**
 * 최고 점수 가져오기
 */
export function getHighScore(): number {
  const stored = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
  return stored ? parseInt(stored, 10) : 0;
}

/**
 * 설정 저장
 */
export function saveSettings(settings: GameSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

/**
 * 설정 가져오기
 */
export function getSettings(): GameSettings {
  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return stored ? JSON.parse(stored) : getDefaultSettings();
}

/**
 * 로컬 랭킹에 추가
 */
export function saveLocalRanking(entry: Omit<RankingEntry, 'rank'>): void {
  const rankings = getLocalRankings();
  
  // 새 엔트리 추가
  rankings.push({ ...entry, rank: 0 });
  
  // 점수 순으로 정렬
  rankings.sort((a, b) => b.score - a.score);
  
  // 순위 재할당
  rankings.forEach((entry, index) => {
    entry.rank = index + 1;
  });
  
  // 상위 10개만 보관
  const top10 = rankings.slice(0, 10);
  
  localStorage.setItem(STORAGE_KEYS.LOCAL_RANKINGS, JSON.stringify(top10));
}

/**
 * 로컬 랭킹 가져오기
 */
export function getLocalRankings(): RankingEntry[] {
  const stored = localStorage.getItem(STORAGE_KEYS.LOCAL_RANKINGS);
  if (!stored) return [];
  
  const rankings: RankingEntry[] = JSON.parse(stored);
  
  // Date 객체로 변환
  return rankings.map(entry => ({
    ...entry,
    playDate: new Date(entry.playDate)
  }));
}

/**
 * 플레이어 이름 저장
 */
export function savePlayerName(name: string): void {
  localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, name);
}

/**
 * 플레이어 이름 가져오기
 */
export function getPlayerName(): string {
  return localStorage.getItem(STORAGE_KEYS.PLAYER_NAME) || 'Player';
}

/**
 * 게임 통계 저장
 */
export interface GameStats {
  totalPlays: number;
  totalScore: number;
  bestStage: number;
  totalPlayTime: number; // 초
}

export function saveGameStats(stats: GameStats): void {
  localStorage.setItem(STORAGE_KEYS.GAME_STATS, JSON.stringify(stats));
}

export function getGameStats(): GameStats {
  const stored = localStorage.getItem(STORAGE_KEYS.GAME_STATS);
  return stored ? JSON.parse(stored) : {
    totalPlays: 0,
    totalScore: 0,
    bestStage: 0,
    totalPlayTime: 0
  };
}

export function updateGameStats(
  score: number,
  stage: number,
  playTime: number
): void {
  const stats = getGameStats();
  
  stats.totalPlays++;
  stats.totalScore += score;
  stats.bestStage = Math.max(stats.bestStage, stage);
  stats.totalPlayTime += playTime;
  
  saveGameStats(stats);
}

/**
 * 모든 데이터 초기화
 */
export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

/**
 * 진행상황 초기화 (설정은 유지)
 */
export function clearProgress(): void {
  localStorage.removeItem(STORAGE_KEYS.HIGH_SCORE);
  localStorage.removeItem(STORAGE_KEYS.LOCAL_RANKINGS);
  localStorage.removeItem(STORAGE_KEYS.GAME_STATS);
  localStorage.removeItem(STORAGE_KEYS.PLAYER_DATA);
}

/**
 * 플레이어 데이터 저장
 */
export function savePlayerData(data: PlayerData): void {
  localStorage.setItem(STORAGE_KEYS.PLAYER_DATA, JSON.stringify(data));
}

/**
 * 플레이어 데이터 가져오기
 */
export function getPlayerData(): PlayerData | null {
  const stored = localStorage.getItem(STORAGE_KEYS.PLAYER_DATA);
  if (!stored) return null;

  const data: PlayerData = JSON.parse(stored);

  // Date 객체로 변환
  if (data.lastPlayedAt) {
    data.lastPlayedAt = new Date(data.lastPlayedAt);
  }

  return data;
}

/**
 * 플레이어 데이터 업데이트
 */
export function updatePlayerData(updates: Partial<PlayerData>): void {
  const current = getPlayerData();
  if (!current) {
    // 새 플레이어 데이터 생성
    const newData: PlayerData = {
      name: 'Player',
      bestScore: 0,
      bestStage: 0,
      totalGamesPlayed: 0,
      settings: getDefaultSettings(),
      ...updates
    };
    savePlayerData(newData);
  } else {
    // 기존 데이터 업데이트
    const updated = { ...current, ...updates };
    savePlayerData(updated);
  }
}
