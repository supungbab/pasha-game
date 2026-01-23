// src/minigames/index.ts

// Mission 1: 풍선 터트리기 (Balloon Pop)
export { default as BalloonPop } from './BalloonPop.vue';

// Mission 2: 과일 자르기 (Fruit Slice)
export { default as FruitSlice } from './FruitSlice.vue';

// Mission 3: 두더지 잡기 (Whack-a-Mole)
export { default as WhackAMole } from './WhackAMole.vue';

// Mission 6: 색깔 매칭 (Color Match)
export { default as ColorMatch } from './ColorMatch.vue';

// Mission 9: 공 받기 (Catch the Ball)
export { default as CatchBall } from './CatchBall.vue';

// Mission 11: 숫자 맞추기 (Number Match)
export { default as NumberMatch } from './NumberMatch.vue';

// Mission 19: 동전 모으기 (Coin Collector)
export { default as CoinCollector } from './CoinCollector.vue';

// Mission 20: 장애물 피하기 (Dodge It)
export { default as DodgeIt } from './DodgeIt.vue';

// Mission 23: 별 수집 (Star Gather)
export { default as StarGather } from './StarGather.vue';

// Mission 26: 선 긋기 (Draw Line)
export { default as DrawLine } from './DrawLine.vue';

// Mission 30: 순서 나열 (Sort It)
export { default as SortIt } from './SortIt.vue';

/**
 * 미니게임 ID를 컴포넌트와 매핑
 */
import BalloonPopComponent from './BalloonPop.vue';
import FruitSliceComponent from './FruitSlice.vue';
import WhackAMoleComponent from './WhackAMole.vue';
import ColorMatchComponent from './ColorMatch.vue';
import CatchBallComponent from './CatchBall.vue';
import NumberMatchComponent from './NumberMatch.vue';
import CoinCollectorComponent from './CoinCollector.vue';
import DodgeItComponent from './DodgeIt.vue';
import StarGatherComponent from './StarGather.vue';
import DrawLineComponent from './DrawLine.vue';
import SortItComponent from './SortIt.vue';

import type { Component } from 'vue';

export const MINIGAME_COMPONENTS: Record<number, Component> = {
  1: BalloonPopComponent,
  2: FruitSliceComponent,
  3: WhackAMoleComponent,
  6: ColorMatchComponent,
  9: CatchBallComponent,
  11: NumberMatchComponent,
  19: CoinCollectorComponent,
  20: DodgeItComponent,
  23: StarGatherComponent,
  26: DrawLineComponent,
  30: SortItComponent,
};

/**
 * ID로 미니게임 컴포넌트 가져오기
 */
export function getMinigameComponent(id: number): Component | null {
  return MINIGAME_COMPONENTS[id] || null;
}

/**
 * 구현된 미니게임 ID 목록
 */
export const IMPLEMENTED_MINIGAME_IDS = [1, 2, 3, 6, 9, 11, 19, 20, 23, 26, 30];
