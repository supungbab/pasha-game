// src/utils/random.ts

/**
 * 배열 섞기 (Fisher-Yates shuffle)
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/**
 * 범위 내 랜덤 정수 (min 이상 max 이하)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 범위 내 랜덤 실수
 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * 배열에서 랜덤 요소 선택
 */
export function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * 배열에서 중복 없이 N개 랜덤 선택
 */
export function randomChoices<T>(array: T[], count: number): T[] {
  const shuffled = shuffle(array);
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * 확률에 따라 true/false 반환
 */
export function randomBool(probability: number = 0.5): boolean {
  return Math.random() < probability;
}

/**
 * 가중치 배열에 따라 인덱스 선택
 */
export function weightedRandom(weights: number[]): number {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * total;

  for (let i = 0; i < weights.length; i++) {
    random -= weights[i];
    if (random <= 0) return i;
  }

  return weights.length - 1;
}

/**
 * 랜덤 색상 생성 (hex)
 */
export function randomColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}

/**
 * 밝은 랜덤 색상 생성
 */
export function randomBrightColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    '#F8B739', '#52B788', '#E63946', '#457B9D'
  ];
  return randomChoice(colors);
}

/**
 * 랜덤 위치 생성 (캔버스 영역 내)
 */
export function randomPosition(
  width: number,
  height: number,
  margin: number = 0
): { x: number; y: number } {
  return {
    x: randomInt(margin, width - margin),
    y: randomInt(margin, height - margin)
  };
}

/**
 * 랜덤 각도 (라디안)
 */
export function randomAngle(): number {
  return Math.random() * Math.PI * 2;
}

/**
 * 범위 내 랜덤 각도 (도)
 */
export function randomAngleDegrees(min: number = 0, max: number = 360): number {
  return randomFloat(min, max);
}

/**
 * 랜덤 방향 벡터
 */
export function randomDirection(): { x: number; y: number } {
  const angle = randomAngle();
  return {
    x: Math.cos(angle),
    y: Math.sin(angle)
  };
}

/**
 * 범위 내 랜덤 속도 벡터
 */
export function randomVelocity(minSpeed: number, maxSpeed: number): { vx: number; vy: number } {
  const angle = randomAngle();
  const speed = randomFloat(minSpeed, maxSpeed);
  return {
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed
  };
}

/**
 * UUID 생성 (간단한 버전)
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * 랜덤 지연 (Promise)
 */
export function randomDelay(minMs: number, maxMs: number): Promise<void> {
  const delay = randomInt(minMs, maxMs);
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * 정규분포 랜덤 (Box-Muller transform)
 */
export function randomNormal(mean: number = 0, stdDev: number = 1): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
}

/**
 * 원 안의 랜덤 위치
 */
export function randomPointInCircle(
  centerX: number,
  centerY: number,
  radius: number
): { x: number; y: number } {
  const angle = randomAngle();
  const r = Math.sqrt(Math.random()) * radius; // sqrt for uniform distribution
  return {
    x: centerX + r * Math.cos(angle),
    y: centerY + r * Math.sin(angle)
  };
}

/**
 * 사각형 안의 랜덤 위치
 */
export function randomPointInRect(
  x: number,
  y: number,
  width: number,
  height: number
): { x: number; y: number } {
  return {
    x: randomFloat(x, x + width),
    y: randomFloat(y, y + height)
  };
}

/**
 * 시드를 사용한 랜덤 생성기 클래스
 */
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  /**
   * 다음 랜덤 값 (0-1)
   */
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  /**
   * 범위 내 랜덤 정수
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * 범위 내 랜덤 실수
   */
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /**
   * 확률에 따라 true/false
   */
  nextBool(probability: number = 0.5): boolean {
    return this.next() < probability;
  }

  /**
   * 배열에서 랜덤 선택
   */
  choice<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }

  /**
   * 배열 섞기
   */
  shuffle<T>(array: T[]): T[] {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
  }
}

/**
 * 범위를 벗어나지 않도록 값 제한
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 값을 범위 내로 래핑 (순환)
 */
export function wrap(value: number, min: number, max: number): number {
  const range = max - min;
  return ((value - min) % range + range) % range + min;
}

/**
 * 선형 보간
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * 역선형 보간 (값으로부터 t 계산)
 */
export function inverseLerp(start: number, end: number, value: number): number {
  return (value - start) / (end - start);
}

/**
 * 값을 한 범위에서 다른 범위로 매핑
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return lerp(outMin, outMax, inverseLerp(inMin, inMax, value));
}
