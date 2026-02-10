<template>
  <div ref="containerRef" class="minigame power-gauge">
    <canvas
      ref="canvasRef"
      @touchstart.prevent="handleTouchStart"
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

const props = defineProps<MiniGameProps>()
const emit = defineEmits<{
  complete: [result: MiniGameResult]
}>()

// Refs
const containerRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

// Canvas setup
const { ctx, helper, width, height, clear } = useCanvas(canvasRef, {
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
const { scorePopups, createScorePopup, shake } = useJuicyFeedback()

// Game state
const score = ref(0)
const timeRemainingMs = ref(props.timeLimit * 1000)
const isGameOver = ref(false)
const round = ref(0)
const successCount = ref(0)
const attempts = ref(0)

// Gauge state
const gaugeValue = ref(0) // 0~1
const isHolding = ref(false)
const gaugeDirection = ref(1) // 1: 증가, -1: 감소
const targetZoneStart = ref(0.5)
const targetZoneEnd = ref(0.8)
const roundFeedback = ref<{ text: string; color: string; life: number } | null>(null)
const waitingForInput = ref(true)

// Difficulty settings
const DEFAULT_SETTINGS = { speed: 0.008, zoneSize: 80, oscillate: false, oscSpeed: 0.015 }
const difficultySettings = computed(() => {
  const settings = [
    { speed: 0.008, zoneSize: 80, oscillate: false, oscSpeed: 0.015 }, // Lv.1
    { speed: 0.010, zoneSize: 70, oscillate: false, oscSpeed: 0.018 }, // Lv.2
    { speed: 0.012, zoneSize: 60, oscillate: false, oscSpeed: 0.020 }, // Lv.3
    { speed: 0.014, zoneSize: 50, oscillate: true, oscSpeed: 0.022 }, // Lv.4: 진동 시작
    { speed: 0.016, zoneSize: 40, oscillate: true, oscSpeed: 0.025 }, // Lv.5
    { speed: 0.020, zoneSize: 30, oscillate: true, oscSpeed: 0.030 }, // Lv.6
  ]
  const index = Math.max(0, Math.min(props.difficulty - 1, 5))
  return settings[index] ?? DEFAULT_SETTINGS
})

// 게이지 바 레이아웃
const GAUGE_X = 80
const GAUGE_WIDTH = 240
const GAUGE_Y = 280
const GAUGE_HEIGHT = 40

let animationId: number = 0
let timerInterval: number = 0

// 새 라운드 시작
function startNewRound() {
  const { zoneSize } = difficultySettings.value
  const zoneSizeNorm = zoneSize / GAUGE_WIDTH

  // 목표 구간을 랜덤 위치에 배치
  const margin = zoneSizeNorm / 2 + 0.05
  const center = margin + Math.random() * (1 - margin * 2)
  targetZoneStart.value = center - zoneSizeNorm / 2
  targetZoneEnd.value = center + zoneSizeNorm / 2

  gaugeValue.value = 0
  gaugeDirection.value = 1
  waitingForInput.value = true
  round.value++
}

// 터치 시작 → 게이지 채우기 시작
function handleTouchStart() {
  if (isGameOver.value) return
  if (!waitingForInput.value) return
  isHolding.value = true
  waitingForInput.value = false
}

// 터치 종료 → 판정
function handleTouchEnd() {
  if (isGameOver.value || !isHolding.value) return
  isHolding.value = false

  attempts.value++

  const { oscillate } = difficultySettings.value
  const currentVal = gaugeValue.value
  const zoneCenter = (targetZoneStart.value + targetZoneEnd.value) / 2
  const zoneHalfWidth = (targetZoneEnd.value - targetZoneStart.value) / 2

  const rect = canvasRef.value?.getBoundingClientRect()
  const screenX = rect ? rect.left + rect.width / 2 : width / 2
  const screenY = rect ? rect.top + GAUGE_Y : GAUGE_Y

  if (currentVal >= targetZoneStart.value && currentVal <= targetZoneEnd.value) {
    // 구간 내 - PERFECT or GOOD 판정
    const distFromCenter = Math.abs(currentVal - zoneCenter)
    const perfectThreshold = zoneHalfWidth * 0.3

    if (distFromCenter <= perfectThreshold) {
      // PERFECT
      score.value += 10
      successCount.value++
      roundFeedback.value = { text: 'PERFECT!', color: '#FFD700', life: 1 }
      createScorePopup(screenX, screenY - 30, '+10 PERFECT!', 'combo')
      shake(containerRef.value, 'light')
      if (navigator.vibrate) navigator.vibrate([20, 10, 20])
    } else {
      // GOOD
      score.value += 7
      successCount.value++
      roundFeedback.value = { text: 'GOOD!', color: '#4CAF50', life: 1 }
      createScorePopup(screenX, screenY - 30, '+7', 'score')
      if (navigator.vibrate) navigator.vibrate(15)
    }
  } else {
    // MISS
    roundFeedback.value = { text: 'MISS...', color: '#F44336', life: 1 }
    createScorePopup(screenX, screenY - 30, 'MISS', 'miss')
    shake(containerRef.value, 'strong')
    if (navigator.vibrate) navigator.vibrate(50)
  }

  // 다음 라운드
  safeSetTimeout(() => {
    if (!isGameOver.value) {
      startNewRound()
    }
  }, 600)
}

// 업데이트
function update() {
  if (isGameOver.value) return

  const { speed, oscillate, oscSpeed } = difficultySettings.value
  const actualSpeed = props.isHardMode ? speed * 1.3 : speed

  // 게이지 이동
  if (isHolding.value) {
    if (oscillate) {
      // 진동 모드: 좌우 왕복
      gaugeValue.value += gaugeDirection.value * (props.isHardMode ? oscSpeed * 1.3 : oscSpeed)
      if (gaugeValue.value >= 1) {
        gaugeValue.value = 1
        gaugeDirection.value = -1
      } else if (gaugeValue.value <= 0) {
        gaugeValue.value = 0
        gaugeDirection.value = 1
      }
    } else {
      // 일반 모드: 한 방향
      gaugeValue.value += actualSpeed
      if (gaugeValue.value >= 1) {
        gaugeValue.value = 1
        // 자동 실패 처리
        isHolding.value = false
        attempts.value++
        roundFeedback.value = { text: 'MISS...', color: '#F44336', life: 1 }
        if (navigator.vibrate) navigator.vibrate(50)
        safeSetTimeout(() => {
          if (!isGameOver.value) startNewRound()
        }, 600)
      }
    }
  }

  // 피드백 감소
  if (roundFeedback.value) {
    roundFeedback.value.life -= 0.03
    if (roundFeedback.value.life <= 0) {
      roundFeedback.value = null
    }
  }
}

// 렌더링
function render() {
  if (!helper.value || !ctx.value) return

  clear()

  // 배경
  const bgGradient = ctx.value.createLinearGradient(0, 0, 0, height)
  bgGradient.addColorStop(0, '#1A1A2E')
  bgGradient.addColorStop(1, '#16213E')
  ctx.value.fillStyle = bgGradient
  ctx.value.fillRect(0, 0, width, height)

  // 라운드 번호
  ctx.value.font = 'bold 20px Arial'
  ctx.value.fillStyle = '#AAA'
  ctx.value.textAlign = 'center'
  ctx.value.fillText(`ROUND ${round.value}`, width / 2, 50)

  // 점수
  ctx.value.font = 'bold 28px Arial'
  ctx.value.fillStyle = '#FFD700'
  ctx.value.fillText(`${score.value}`, width / 2, 90)

  // 지시 텍스트
  if (waitingForInput.value) {
    ctx.value.font = 'bold 22px Arial'
    ctx.value.fillStyle = '#FFF'
    ctx.value.fillText('꾹 누르세요!', width / 2, 200)
    ctx.value.font = '16px Arial'
    ctx.value.fillStyle = '#888'
    ctx.value.fillText('초록 구간에서 손을 떼세요', width / 2, 230)
  } else if (isHolding.value) {
    ctx.value.font = 'bold 24px Arial'
    ctx.value.fillStyle = '#4CAF50'
    ctx.value.fillText('지금 떼세요!', width / 2, 210)
  }

  // 게이지 바 배경
  helper.value.drawRoundRect(GAUGE_X - 4, GAUGE_Y - 4, GAUGE_WIDTH + 8, GAUGE_HEIGHT + 8, 12, '#333')

  // 게이지 바 내부 배경
  helper.value.drawRoundRect(GAUGE_X, GAUGE_Y, GAUGE_WIDTH, GAUGE_HEIGHT, 8, '#222')

  // 목표 구간 (초록)
  const zoneStartPx = GAUGE_X + targetZoneStart.value * GAUGE_WIDTH
  const zoneWidthPx = (targetZoneEnd.value - targetZoneStart.value) * GAUGE_WIDTH
  ctx.value.fillStyle = 'rgba(76, 175, 80, 0.4)'
  ctx.value.fillRect(zoneStartPx, GAUGE_Y, zoneWidthPx, GAUGE_HEIGHT)

  // 목표 구간 테두리
  ctx.value.strokeStyle = '#4CAF50'
  ctx.value.lineWidth = 2
  ctx.value.strokeRect(zoneStartPx, GAUGE_Y, zoneWidthPx, GAUGE_HEIGHT)

  // 목표 중심 PERFECT 구간 표시
  const perfectWidth = zoneWidthPx * 0.3
  const perfectStart = zoneStartPx + (zoneWidthPx - perfectWidth) / 2
  ctx.value.fillStyle = 'rgba(255, 215, 0, 0.3)'
  ctx.value.fillRect(perfectStart, GAUGE_Y, perfectWidth, GAUGE_HEIGHT)

  // 게이지 채움
  if (!waitingForInput.value) {
    const fillWidth = gaugeValue.value * GAUGE_WIDTH
    const fillColor =
      gaugeValue.value >= targetZoneStart.value && gaugeValue.value <= targetZoneEnd.value
        ? '#4CAF50'
        : '#FF9800'
    const fillGradient = ctx.value.createLinearGradient(GAUGE_X, 0, GAUGE_X + fillWidth, 0)
    fillGradient.addColorStop(0, fillColor)
    fillGradient.addColorStop(1, fillColor + 'CC')
    ctx.value.fillStyle = fillGradient
    ctx.value.fillRect(GAUGE_X, GAUGE_Y + 2, fillWidth, GAUGE_HEIGHT - 4)

    // 현재 위치 인디케이터
    const indicatorX = GAUGE_X + gaugeValue.value * GAUGE_WIDTH
    ctx.value.fillStyle = '#FFF'
    ctx.value.beginPath()
    ctx.value.moveTo(indicatorX, GAUGE_Y - 8)
    ctx.value.lineTo(indicatorX - 6, GAUGE_Y - 18)
    ctx.value.lineTo(indicatorX + 6, GAUGE_Y - 18)
    ctx.value.closePath()
    ctx.value.fill()

    // 하단 삼각형
    ctx.value.beginPath()
    ctx.value.moveTo(indicatorX, GAUGE_Y + GAUGE_HEIGHT + 8)
    ctx.value.lineTo(indicatorX - 6, GAUGE_Y + GAUGE_HEIGHT + 18)
    ctx.value.lineTo(indicatorX + 6, GAUGE_Y + GAUGE_HEIGHT + 18)
    ctx.value.closePath()
    ctx.value.fill()
  }

  // 파워 미터 시각화 (큰 원형 게이지)
  const centerX = width / 2
  const centerY = 440
  const outerR = 100
  const innerR = 70

  // 원형 배경
  ctx.value.beginPath()
  ctx.value.arc(centerX, centerY, outerR, 0, Math.PI * 2)
  ctx.value.fillStyle = '#222'
  ctx.value.fill()

  // 원형 게이지 채움
  if (!waitingForInput.value) {
    const startAngle = -Math.PI / 2
    const endAngle = startAngle + gaugeValue.value * Math.PI * 2

    ctx.value.beginPath()
    ctx.value.moveTo(centerX, centerY)
    ctx.value.arc(centerX, centerY, outerR - 4, startAngle, endAngle)
    ctx.value.closePath()

    const inZone =
      gaugeValue.value >= targetZoneStart.value && gaugeValue.value <= targetZoneEnd.value
    ctx.value.fillStyle = inZone ? 'rgba(76, 175, 80, 0.7)' : 'rgba(255, 152, 0, 0.5)'
    ctx.value.fill()
  }

  // 내부 원 (덮어쓰기)
  ctx.value.beginPath()
  ctx.value.arc(centerX, centerY, innerR, 0, Math.PI * 2)
  ctx.value.fillStyle = '#1A1A2E'
  ctx.value.fill()

  // 중앙 이모지/텍스트
  ctx.value.font = '40px Arial'
  ctx.value.fillStyle = '#FFF'
  ctx.value.textAlign = 'center'
  ctx.value.textBaseline = 'middle'
  if (waitingForInput.value) {
    ctx.value.fillText('👆', centerX, centerY)
  } else if (isHolding.value) {
    ctx.value.fillText('💪', centerX, centerY)
  } else {
    ctx.value.fillText('✋', centerX, centerY)
  }

  // 피드백
  if (roundFeedback.value && roundFeedback.value.life > 0) {
    ctx.value.globalAlpha = roundFeedback.value.life
    ctx.value.font = 'bold 48px Arial'
    ctx.value.fillStyle = roundFeedback.value.color
    ctx.value.textAlign = 'center'
    ctx.value.textBaseline = 'middle'
    ctx.value.fillText(roundFeedback.value.text, width / 2, 160)
    ctx.value.globalAlpha = 1
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

  const accuracy = attempts.value > 0 ? Math.round((successCount.value / attempts.value) * 100) : 0

  const result: MiniGameResult = {
    success: score.value >= props.targetScore,
    score: score.value,
    timeRemaining: timeRemainingMs.value / 1000,
    accuracy,
    count: successCount.value,
    attempts: attempts.value,
    perfect: accuracy === 100 && attempts.value >= 3,
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
  startNewRound()

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
