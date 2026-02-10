<template>
  <div ref="containerRef" class="minigame arrow-dash">
    <canvas
      ref="canvasRef"
      @touchstart.prevent="handleTouchStart"
      @touchmove.prevent="handleTouchMove"
      @touchend.prevent="handleTouchEnd"
    ></canvas>

    <!-- Score Popups -->
    <ScorePopup :popups="scorePopups" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import type { MiniGameProps, MiniGameResult } from '@/types/minigame'
import { useCanvas, useCleanupTimers, useJuicyFeedback } from '@/composables'
import { ScorePopup } from '@/components/common'
import type { Particle } from '@/utils/canvas'

const props = defineProps<MiniGameProps>()
const emit = defineEmits<{
  complete: [result: MiniGameResult]
}>()

// Refs
const containerRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

// Canvas setup
const { ctx, helper, width, height, clear, getCanvasCoordinates } = useCanvas(canvasRef, {
  width: 400,
  height: 600,
  backgroundColor: '#1A1A2E',
})

// Timer utilities
const {
  safeSetTimeout,
  safeSetInterval,
  safeRequestAnimationFrame,
  clearInterval,
  cancelAnimationFrame,
} = useCleanupTimers()

// Juicy feedback
const { scorePopups, createScorePopup, createParticles, shake } = useJuicyFeedback()

// 방향 정의
interface Direction {
  name: string
  emoji: string
  dx: number
  dy: number
  color: string
}

const DIRECTIONS_4: Direction[] = [
  { name: 'up', emoji: '⬆️', dx: 0, dy: -1, color: '#4CAF50' },
  { name: 'down', emoji: '⬇️', dx: 0, dy: 1, color: '#FF9800' },
  { name: 'left', emoji: '⬅️', dx: -1, dy: 0, color: '#2196F3' },
  { name: 'right', emoji: '➡️', dx: 1, dy: 0, color: '#F44336' },
]

const DIRECTIONS_8: Direction[] = [
  ...DIRECTIONS_4,
  { name: 'up-right', emoji: '↗️', dx: 1, dy: -1, color: '#8BC34A' },
  { name: 'down-right', emoji: '↘️', dx: 1, dy: 1, color: '#FF5722' },
  { name: 'down-left', emoji: '↙️', dx: -1, dy: 1, color: '#9C27B0' },
  { name: 'up-left', emoji: '↖️', dx: -1, dy: -1, color: '#00BCD4' },
]

// Game state
const score = ref(0)
const combo = ref(0)
const maxCombo = ref(0)
const timeRemainingMs = ref(props.timeLimit * 1000)
const isGameOver = ref(false)
const currentArrow = ref<Direction | null>(null)
const nextArrows = ref<Direction[]>([])
const particles = ref<Particle[]>([])
const successCount = ref(0)
const attempts = ref(0)

// 스와이프 추적
const touchStartX = ref(0)
const touchStartY = ref(0)
const isSwiping = ref(false)

// 애니메이션 상태
const arrowScale = ref(1)
const arrowShake = ref(0)
const feedbackText = ref<{ text: string; color: string; life: number } | null>(null)

// Difficulty settings
const DEFAULT_SETTINGS = { use8Dir: false, minSwipeDist: 50 }
const difficultySettings = computed(() => {
  const settings = [
    { use8Dir: false, minSwipeDist: 50 }, // Lv.1
    { use8Dir: false, minSwipeDist: 50 }, // Lv.2
    { use8Dir: false, minSwipeDist: 45 }, // Lv.3
    { use8Dir: true, minSwipeDist: 45 }, // Lv.4: 8방향
    { use8Dir: true, minSwipeDist: 40 }, // Lv.5
    { use8Dir: true, minSwipeDist: 35 }, // Lv.6
  ]
  const index = Math.max(0, Math.min(props.difficulty - 1, 5))
  return settings[index] ?? DEFAULT_SETTINGS
})

let animationId: number = 0
let timerInterval: number = 0

// 방향 리스트 가져오기
function getDirections(): Direction[] {
  return difficultySettings.value.use8Dir ? DIRECTIONS_8 : DIRECTIONS_4
}

// 랜덤 방향
function randomDirection(): Direction {
  const dirs = getDirections()
  return dirs[Math.floor(Math.random() * dirs.length)]!
}

// 다음 화살표 생성
function generateNextArrow() {
  if (nextArrows.value.length < 3) {
    while (nextArrows.value.length < 3) {
      nextArrows.value.push(randomDirection())
    }
  }

  currentArrow.value = nextArrows.value.shift()!
  nextArrows.value.push(randomDirection())
  arrowScale.value = 1.5 // 팝인 효과
}

// 스와이프 방향 판정
function getSwipeDirection(dx: number, dy: number): Direction | null {
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist < difficultySettings.value.minSwipeDist) return null

  const angle = Math.atan2(dy, dx)
  const dirs = getDirections()

  // 가장 가까운 방향 찾기
  let bestDir: Direction | null = null
  let bestDot = -Infinity

  for (const dir of dirs) {
    const dirAngle = Math.atan2(dir.dy, dir.dx)
    const dot = Math.cos(angle - dirAngle)
    if (dot > bestDot) {
      bestDot = dot
      bestDir = dir
    }
  }

  // 8방향일 때 threshold: cos(22.5°) ≈ 0.924, 4방향일 때: cos(45°) ≈ 0.707
  const threshold = difficultySettings.value.use8Dir ? 0.85 : 0.6
  return bestDot >= threshold ? bestDir : null
}

// 콤보 배율
function getComboMultiplier(): number {
  if (combo.value >= 7) return 2.5
  if (combo.value >= 5) return 2.0
  if (combo.value >= 3) return 1.5
  return 1.0
}

// 터치 시작
function handleTouchStart(event: TouchEvent) {
  if (isGameOver.value) return
  const touch = event.touches[0]
  if (!touch) return
  const coords = getCanvasCoordinates(touch)
  touchStartX.value = coords.x
  touchStartY.value = coords.y
  isSwiping.value = true
}

// 터치 이동
function handleTouchMove(event: TouchEvent) {
  // 추적만 함 (실시간 처리 없음)
}

// 터치 종료
function handleTouchEnd(event: TouchEvent) {
  if (!isSwiping.value || isGameOver.value || !currentArrow.value) return
  isSwiping.value = false

  const touch = event.changedTouches[0]
  if (!touch) return
  const coords = getCanvasCoordinates(touch)

  const dx = coords.x - touchStartX.value
  const dy = coords.y - touchStartY.value

  const swipeDir = getSwipeDirection(dx, dy)
  if (!swipeDir) return // 스와이프 거리 부족 → 무시

  attempts.value++

  const rect = canvasRef.value?.getBoundingClientRect()
  const screenX = rect ? rect.left + rect.width / 2 : width / 2
  const screenY = rect ? rect.top + height / 3 : height / 3

  if (swipeDir.name === currentArrow.value.name) {
    // 정답
    combo.value++
    if (combo.value > maxCombo.value) maxCombo.value = combo.value
    successCount.value++

    const multiplier = getComboMultiplier()
    const points = Math.round(10 * multiplier)
    score.value += points

    // 파티클
    if (helper.value) {
      const newParticles = helper.value.createParticles(
        width / 2,
        height / 3,
        currentArrow.value.color,
        12,
      )
      particles.value.push(...newParticles)
    }

    // 피드백
    if (combo.value >= 5) {
      feedbackText.value = { text: `x${multiplier} COMBO!`, color: '#FFD700', life: 1 }
      createScorePopup(screenX, screenY - 40, `+${points} x${combo.value}!`, 'combo')
      shake(containerRef.value, 'light')
      if (navigator.vibrate) navigator.vibrate([20, 10, 20])
    } else if (combo.value >= 3) {
      feedbackText.value = { text: 'COMBO!', color: '#FF9800', life: 1 }
      createScorePopup(screenX, screenY - 40, `+${points} COMBO!`, 'score')
      if (navigator.vibrate) navigator.vibrate(20)
    } else {
      createScorePopup(screenX, screenY - 40, `+${points}`, 'score')
      if (navigator.vibrate) navigator.vibrate(15)
    }

    createParticles(containerRef.value, screenX, screenY, currentArrow.value.color, 8)
    generateNextArrow()
  } else {
    // 오답
    combo.value = 0
    arrowShake.value = 10
    feedbackText.value = { text: 'MISS!', color: '#F44336', life: 1 }
    createScorePopup(screenX, screenY - 40, 'MISS', 'miss')
    shake(containerRef.value, 'strong')
    if (navigator.vibrate) navigator.vibrate(50)
  }
}

// 업데이트
function update() {
  if (isGameOver.value) return

  // 화살표 스케일 애니메이션
  arrowScale.value += (1 - arrowScale.value) * 0.15

  // 흔들림 감소
  if (arrowShake.value > 0) {
    arrowShake.value *= 0.85
    if (arrowShake.value < 0.5) arrowShake.value = 0
  }

  // 피드백 감소
  if (feedbackText.value) {
    feedbackText.value.life -= 0.03
    if (feedbackText.value.life <= 0) {
      feedbackText.value = null
    }
  }
}

// 렌더링
function render() {
  if (!helper.value || !ctx.value) return

  clear()

  // 배경
  const bgGradient = ctx.value.createLinearGradient(0, 0, 0, height)
  bgGradient.addColorStop(0, '#0F0C29')
  bgGradient.addColorStop(0.5, '#302B63')
  bgGradient.addColorStop(1, '#24243E')
  ctx.value.fillStyle = bgGradient
  ctx.value.fillRect(0, 0, width, height)

  // 점수 & 콤보
  ctx.value.font = 'bold 22px Arial'
  ctx.value.fillStyle = '#FFF'
  ctx.value.textAlign = 'left'
  ctx.value.fillText(`점수: ${score.value}`, 16, 35)

  if (combo.value >= 2) {
    ctx.value.font = 'bold 18px Arial'
    ctx.value.fillStyle = '#FFD700'
    ctx.value.textAlign = 'right'
    ctx.value.fillText(`${combo.value} COMBO`, width - 16, 35)
  }

  // 콤보 배율 바
  if (combo.value >= 3) {
    const mult = getComboMultiplier()
    const barWidth = Math.min(combo.value / 7, 1) * (width - 40)
    helper.value.drawRoundRect(20, 50, width - 40, 6, 3, '#333')
    helper.value.drawRoundRect(20, 50, barWidth, 6, 3, '#FFD700')

    ctx.value.font = 'bold 14px Arial'
    ctx.value.fillStyle = '#FFD700'
    ctx.value.textAlign = 'center'
    ctx.value.fillText(`x${mult}`, width / 2, 72)
  }

  // 다음 화살표 미리보기 (상단)
  ctx.value.font = '14px Arial'
  ctx.value.fillStyle = '#888'
  ctx.value.textAlign = 'center'
  ctx.value.fillText('NEXT', width / 2, 110)

  nextArrows.value.forEach((dir, i) => {
    const x = width / 2 - 50 + i * 50
    const alpha = 1 - i * 0.25
    ctx.value!.globalAlpha = alpha
    ctx.value!.font = '28px Arial'
    ctx.value!.textAlign = 'center'
    ctx.value!.textBaseline = 'middle'
    ctx.value!.fillText(dir.emoji, x, 140)
  })
  ctx.value.globalAlpha = 1

  // 현재 화살표 (중앙, 크게)
  if (currentArrow.value) {
    const centerX = width / 2 + (arrowShake.value > 0 ? (Math.random() - 0.5) * arrowShake.value : 0)
    const centerY = height / 3

    // 배경 원
    const bgRadius = 80 * arrowScale.value
    ctx.value.beginPath()
    ctx.value.arc(centerX, centerY, bgRadius, 0, Math.PI * 2)
    ctx.value.fillStyle = currentArrow.value.color + '33'
    ctx.value.fill()
    ctx.value.strokeStyle = currentArrow.value.color + '88'
    ctx.value.lineWidth = 3
    ctx.value.stroke()

    // 화살표 이모지
    const emojiSize = 64 * arrowScale.value
    ctx.value.font = `${emojiSize}px Arial`
    ctx.value.textAlign = 'center'
    ctx.value.textBaseline = 'middle'
    ctx.value.fillText(currentArrow.value.emoji, centerX, centerY)

    // 방향 텍스트 (8방향일 때)
    if (difficultySettings.value.use8Dir) {
      ctx.value.font = '14px Arial'
      ctx.value.fillStyle = '#AAA'
      ctx.value.fillText(currentArrow.value.name.toUpperCase(), centerX, centerY + bgRadius + 20)
    }
  }

  // 스와이프 안내
  ctx.value.font = '16px Arial'
  ctx.value.fillStyle = '#666'
  ctx.value.textAlign = 'center'
  ctx.value.fillText('화살표 방향으로 스와이프!', width / 2, height - 80)

  // 스와이프 시각적 가이드
  const guideY = height - 140
  const guideR = 40
  ctx.value.beginPath()
  ctx.value.arc(width / 2, guideY, guideR, 0, Math.PI * 2)
  ctx.value.strokeStyle = 'rgba(255,255,255,0.15)'
  ctx.value.lineWidth = 2
  ctx.value.stroke()

  // 4방향 점선 가이드
  const guideDirs = difficultySettings.value.use8Dir ? DIRECTIONS_8 : DIRECTIONS_4
  guideDirs.forEach((dir) => {
    ctx.value!.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.value!.lineWidth = 1
    ctx.value!.setLineDash([3, 5])
    ctx.value!.beginPath()
    ctx.value!.moveTo(width / 2, guideY)
    ctx.value!.lineTo(width / 2 + dir.dx * guideR, guideY + dir.dy * guideR)
    ctx.value!.stroke()
    ctx.value!.setLineDash([])
  })

  // 피드백 텍스트
  if (feedbackText.value && feedbackText.value.life > 0) {
    ctx.value.globalAlpha = feedbackText.value.life
    ctx.value.font = 'bold 36px Arial'
    ctx.value.fillStyle = feedbackText.value.color
    ctx.value.textAlign = 'center'
    ctx.value.textBaseline = 'middle'
    ctx.value.fillText(feedbackText.value.text, width / 2, height / 2 + 40)
    ctx.value.globalAlpha = 1
  }

  // 파티클
  if (helper.value) {
    particles.value = helper.value.updateAndDrawParticles(particles.value)
  }
}

// 게임 루프
function gameLoop() {
  if (isGameOver.value) return
  update()
  render()
  animationId = safeRequestAnimationFrame(gameLoop)
}

// 게임 종료
function endGame() {
  isGameOver.value = true
  cancelAnimationFrame(animationId)
  clearInterval(timerInterval)

  const accuracy =
    attempts.value > 0 ? Math.round((successCount.value / attempts.value) * 100) : 0

  const result: MiniGameResult = {
    success: score.value >= props.targetScore,
    score: score.value,
    timeRemaining: timeRemainingMs.value / 1000,
    accuracy,
    count: successCount.value,
    attempts: attempts.value,
    perfect: accuracy === 100 && attempts.value >= 5,
  }

  if (result.success) {
    shake(containerRef.value, 'light')
  } else {
    shake(containerRef.value, 'strong')
  }

  safeSetTimeout(() => {
    emit('complete', result)
  }, 300)
}

// 게임 시작
function startGame() {
  // 미리보기 초기화 및 첫 화살표
  nextArrows.value = [randomDirection(), randomDirection(), randomDirection()]
  generateNextArrow()

  timerInterval = safeSetInterval(() => {
    timeRemainingMs.value -= 100
    if (timeRemainingMs.value <= 0) {
      timeRemainingMs.value = 0
      endGame()
    }
  }, 100)

  gameLoop()
}

onMounted(() => {
  if (containerRef.value) {
    containerRef.value.classList.add('juicy-pop')
  }

  safeSetTimeout(() => {
    startGame()
  }, 100)
})

onUnmounted(() => {
  isGameOver.value = true
})
</script>

<style scoped>
.minigame {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  position: relative;
  overflow: hidden;
}

canvas {
  max-width: 100%;
  max-height: 100%;
  touch-action: none;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background: #ffffff;
}
</style>
