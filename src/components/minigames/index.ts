// src/components/minigames/index.ts

import type { Component } from 'vue';

// Import all minigame components once
import BalloonPop from './01_BalloonPop.vue';       // Mission 1: 풍선 터트리기
import FruitSlice from './02_FruitSlice.vue';       // Mission 2: 과일 자르기
import WhackAMole from './03_WhackAMole.vue';       // Mission 3: 두더지 잡기
import PerfectJump from './04_PerfectJump.vue';     // Mission 4: 타이밍 점프
import RhythmTap from './05_RhythmTap.vue';         // Mission 5: 리듬 탭
import ColorMatch from './06_ColorMatch.vue';       // Mission 6: 색깔 매칭
import SpeedClick from './07_SpeedClick.vue';       // Mission 7: 빠른 클릭
import ReactionTest from './08_ReactionTest.vue';   // Mission 8: 반응 테스트
import CatchBall from './09_CatchBall.vue';         // Mission 9: 공 받기
import QuickShoot from './10_QuickShoot.vue';       // Mission 10: 슈팅 게임
import NumberMatch from './11_NumberMatch.vue';     // Mission 11: 숫자 맞추기
import FindPair from './12_FindPair.vue';           // Mission 12: 같은 그림 찾기
import MemorySequence from './13_MemorySequence.vue'; // Mission 13: 순서 기억
import ColorWord from './14_ColorWord.vue';         // Mission 14: 색깔 이름
import QuickMath from './15_QuickMath.vue';         // Mission 15: 빠른 계산
import PatternCopy from './16_PatternCopy.vue';     // Mission 16: 패턴 따라하기
import HiddenObject from './17_HiddenObject.vue';   // Mission 17: 숨은 그림
import SlidePuzzle from './18_SlidePuzzle.vue';     // Mission 18: 퍼즐 슬라이드
import CoinCollector from './19_CoinCollector.vue'; // Mission 19: 동전 모으기
import DodgeIt from './20_DodgeIt.vue';             // Mission 20: 장애물 피하기
import LadderClimb from './21_LadderClimb.vue';     // Mission 21: 사다리 오르기
import MazeEscape from './22_MazeEscape.vue';       // Mission 22: 미로 탈출
import StarGather from './23_StarGather.vue';       // Mission 23: 별 수집
import JumpUp from './24_JumpUp.vue';               // Mission 24: 점프 게임
import SpeedRun from './25_SpeedRun.vue';           // Mission 25: 스피드 런
import DrawLine from './26_DrawLine.vue';           // Mission 26: 선 긋기
import RotateObject from './27_RotateObject.vue';   // Mission 27: 물체 회전
import SizeMatch from './28_SizeMatch.vue';         // Mission 28: 크기 맞추기
import BalanceIt from './29_BalanceIt.vue';         // Mission 29: 균형 잡기
import SortIt from './30_SortIt.vue';               // Mission 30: 순서 나열

// Named exports for direct component usage
export {
  BalloonPop,
  FruitSlice,
  WhackAMole,
  PerfectJump,
  RhythmTap,
  ColorMatch,
  SpeedClick,
  ReactionTest,
  CatchBall,
  QuickShoot,
  NumberMatch,
  FindPair,
  MemorySequence,
  ColorWord,
  QuickMath,
  PatternCopy,
  HiddenObject,
  SlidePuzzle,
  CoinCollector,
  DodgeIt,
  LadderClimb,
  MazeEscape,
  StarGather,
  JumpUp,
  SpeedRun,
  DrawLine,
  RotateObject,
  SizeMatch,
  BalanceIt,
  SortIt,
};

/**
 * 미니게임 ID를 컴포넌트와 매핑
 */
export const MINIGAME_COMPONENTS: Record<number, Component> = {
  1: BalloonPop,
  2: FruitSlice,
  3: WhackAMole,
  4: PerfectJump,
  5: RhythmTap,
  6: ColorMatch,
  7: SpeedClick,
  8: ReactionTest,
  9: CatchBall,
  10: QuickShoot,
  11: NumberMatch,
  12: FindPair,
  13: MemorySequence,
  14: ColorWord,
  15: QuickMath,
  16: PatternCopy,
  17: HiddenObject,
  18: SlidePuzzle,
  19: CoinCollector,
  20: DodgeIt,
  21: LadderClimb,
  22: MazeEscape,
  23: StarGather,
  24: JumpUp,
  25: SpeedRun,
  26: DrawLine,
  27: RotateObject,
  28: SizeMatch,
  29: BalanceIt,
  30: SortIt,
};

/**
 * ID로 미니게임 컴포넌트 가져오기
 */
export function getMinigameComponent(id: number): Component | null {
  return MINIGAME_COMPONENTS[id] || null;
}

/**
 * 구현된 미니게임 ID 목록 (1-30 전체!)
 */
export const IMPLEMENTED_MINIGAME_IDS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
];
