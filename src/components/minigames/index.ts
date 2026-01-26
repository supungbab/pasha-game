// src/minigames/index.ts

// Mission 1: 풍선 터트리기 (Balloon Pop)
export { default as BalloonPop } from './BalloonPop.vue';

// Mission 2: 과일 자르기 (Fruit Slice)
export { default as FruitSlice } from './FruitSlice.vue';

// Mission 3: 두더지 잡기 (Whack-a-Mole)
export { default as WhackAMole } from './WhackAMole.vue';

// Mission 4: 타이밍 점프 (Perfect Jump)
export { default as PerfectJump } from './PerfectJump.vue';

// Mission 5: 리듬 탭 (Rhythm Tap)
export { default as RhythmTap } from './RhythmTap.vue';

// Mission 6: 색깔 매칭 (Color Match)
export { default as ColorMatch } from './ColorMatch.vue';

// Mission 7: 빠른 클릭 (Speed Click)
export { default as SpeedClick } from './SpeedClick.vue';

// Mission 8: 반응 테스트 (Reaction Test)
export { default as ReactionTest } from './ReactionTest.vue';

// Mission 9: 공 받기 (Catch the Ball)
export { default as CatchBall } from './CatchBall.vue';

// Mission 10: 슈팅 게임 (Quick Shoot)
export { default as QuickShoot } from './QuickShoot.vue';

// Mission 11: 숫자 맞추기 (Number Match)
export { default as NumberMatch } from './NumberMatch.vue';

// Mission 12: 같은 그림 찾기 (Find Pair)
export { default as FindPair } from './FindPair.vue';

// Mission 13: 순서 기억 (Memory Sequence)
export { default as MemorySequence } from './MemorySequence.vue';

// Mission 14: 색깔 이름 (Color Word)
export { default as ColorWord } from './ColorWord.vue';

// Mission 15: 빠른 계산 (Quick Math)
export { default as QuickMath } from './QuickMath.vue';

// Mission 16: 패턴 따라하기 (Pattern Copy)
export { default as PatternCopy } from './PatternCopy.vue';

// Mission 17: 숨은 그림 (Hidden Object)
export { default as HiddenObject } from './HiddenObject.vue';

// Mission 18: 퍼즐 슬라이드 (Slide Puzzle)
export { default as SlidePuzzle } from './SlidePuzzle.vue';

// Mission 19: 동전 모으기 (Coin Collector)
export { default as CoinCollector } from './CoinCollector.vue';

// Mission 20: 장애물 피하기 (Dodge It)
export { default as DodgeIt } from './DodgeIt.vue';

// Mission 21: 사다리 오르기 (Ladder Climb)
export { default as LadderClimb } from './LadderClimb.vue';

// Mission 22: 미로 탈출 (Maze Escape)
export { default as MazeEscape } from './MazeEscape.vue';

// Mission 23: 별 수집 (Star Gather)
export { default as StarGather } from './StarGather.vue';

// Mission 24: 점프 게임 (Jump Up)
export { default as JumpUp } from './JumpUp.vue';

// Mission 25: 스피드 런 (Speed Run)
export { default as SpeedRun } from './SpeedRun.vue';

// Mission 26: 선 긋기 (Draw Line)
export { default as DrawLine } from './DrawLine.vue';

// Mission 27: 물체 회전 (Rotate Object)
export { default as RotateObject } from './RotateObject.vue';

// Mission 28: 크기 맞추기 (Size Match)
export { default as SizeMatch } from './SizeMatch.vue';

// Mission 29: 균형 잡기 (Balance It)
export { default as BalanceIt } from './BalanceIt.vue';

// Mission 30: 순서 나열 (Sort It)
export { default as SortIt } from './SortIt.vue';

/**
 * 미니게임 ID를 컴포넌트와 매핑
 */
import BalloonPopComponent from './BalloonPop.vue';
import FruitSliceComponent from './FruitSlice.vue';
import WhackAMoleComponent from './WhackAMole.vue';
import PerfectJumpComponent from './PerfectJump.vue';
import RhythmTapComponent from './RhythmTap.vue';
import ColorMatchComponent from './ColorMatch.vue';
import SpeedClickComponent from './SpeedClick.vue';
import ReactionTestComponent from './ReactionTest.vue';
import CatchBallComponent from './CatchBall.vue';
import QuickShootComponent from './QuickShoot.vue';
import NumberMatchComponent from './NumberMatch.vue';
import FindPairComponent from './FindPair.vue';
import MemorySequenceComponent from './MemorySequence.vue';
import ColorWordComponent from './ColorWord.vue';
import QuickMathComponent from './QuickMath.vue';
import PatternCopyComponent from './PatternCopy.vue';
import HiddenObjectComponent from './HiddenObject.vue';
import SlidePuzzleComponent from './SlidePuzzle.vue';
import CoinCollectorComponent from './CoinCollector.vue';
import DodgeItComponent from './DodgeIt.vue';
import LadderClimbComponent from './LadderClimb.vue';
import MazeEscapeComponent from './MazeEscape.vue';
import StarGatherComponent from './StarGather.vue';
import JumpUpComponent from './JumpUp.vue';
import SpeedRunComponent from './SpeedRun.vue';
import DrawLineComponent from './DrawLine.vue';
import RotateObjectComponent from './RotateObject.vue';
import SizeMatchComponent from './SizeMatch.vue';
import BalanceItComponent from './BalanceIt.vue';
import SortItComponent from './SortIt.vue';

import type { Component } from 'vue';

export const MINIGAME_COMPONENTS: Record<number, Component> = {
  1: BalloonPopComponent,
  2: FruitSliceComponent,
  3: WhackAMoleComponent,
  4: PerfectJumpComponent,
  5: RhythmTapComponent,
  6: ColorMatchComponent,
  7: SpeedClickComponent,
  8: ReactionTestComponent,
  9: CatchBallComponent,
  10: QuickShootComponent,
  11: NumberMatchComponent,
  12: FindPairComponent,
  13: MemorySequenceComponent,
  14: ColorWordComponent,
  15: QuickMathComponent,
  16: PatternCopyComponent,
  17: HiddenObjectComponent,
  18: SlidePuzzleComponent,
  19: CoinCollectorComponent,
  20: DodgeItComponent,
  21: LadderClimbComponent,
  22: MazeEscapeComponent,
  23: StarGatherComponent,
  24: JumpUpComponent,
  25: SpeedRunComponent,
  26: DrawLineComponent,
  27: RotateObjectComponent,
  28: SizeMatchComponent,
  29: BalanceItComponent,
  30: SortItComponent,
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
  21, 22, 23, 24, 25, 26, 27, 28, 29, 30
];
