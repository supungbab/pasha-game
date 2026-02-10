<template>
  <div ref="containerRef" class="minigame bomb-defuse">
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

// 와이어 색상 정의
const WIRE_COLORS = [
  { name: '빨강', color: '#FF4444', light: '#FF8888' },
  { name: '파랑', color: '#4488FF', light: '#88BBFF' },
  { name: '초록', color: '#44CC44', light: '#88EE88' },
  { name: '노랑', color: '#FFCC00', light: '#FFEE66' },
  { name: '보라', color: '#AA44FF', light: '#CC88FF' },
]

// Game state
const score = ref(0)
const timeRemainingMs = ref(props.timeLimit * 1000)
const isGameOver = ref(false)
const roundCount = ref(0)
const successCount = ref(0)
const attempts = ref(0)
const particles = ref<Particle[]>([])

// Bomb state
const wires = ref<Wire[]>([])
const cutOrder = ref<number[]>([]) // 올바른 절단 순서 (wire index)
const nextCutIndex = ref(0) // 다음에 잘라야 할 순서
const hintVisible = ref(true)
const bombShakeAmount = ref(0)
const feedbackText = ref<{ text: string; color: string; life: number } | null>(null)
const bombPulse = ref(0)

// 스와이프 추적
const touchPoints = ref<{ x: number; y: number }[]>([])

interface Wire {
  startX: number
  startY: number
  endX: number
  endY: number
  color: (typeof WIRE_COLORS)[number]
  cut: boolean
  cutAnimation: number // 0~1 잘리는 애니메이션
}

// Difficulty settings
const DEFAULT_SETTINGS = { wireCount: 3, hintDuration: 99999, showNumbers: true }
const difficultySettings = computed(() => {
  const settings = [
    { wireCount: 3, hintDuration: 99999, showNumbers: true }, // Lv.1: 힌트 항상 표시
    { wireCount: 3, hintDuration: 4000, showNumbers: true }, // Lv.2
    { wireCount: 4, hintDuration: 2500, showNumbers: false }, // Lv.3: 힌트 사라짐
    { wireCount: 4, hintDuration: 1800, showNumbers: false }, // Lv.4
    { wireCount: 5, hintDuration: 1500, showNumbers: false }, // Lv.5
    { wireCount: 5, hintDuration: 1000, showNumbers: false }, // Lv.6
  ]
  const index = Math.max(0, Math.min(props.difficulty - 1, 5))
  return settings[index] ?? DEFAULT_SETTINGS
})

let animationId: number = 0
let timerInterval: number = 0
let hintTimeout: number = 0

// 폭탄 중심
const BOMB_X = width / 2
const BOMB_Y = 300

// 새 라운드 생성
function generateBomb() {
  const { wireCount, hintDuration } = difficultySettings.value
  const actualWireCount = props.isHardMode ? Math.min(wireCount + 1, 5) : wireCount

  // 색상 랜덤 선택 (중복 없이)
  const shuffledColors = [...WIRE_COLORS].sort(() => Math.random() - 0.5)
  const selectedColors = shuffledColors.slice(0, actualWireCount)

  // 와이어 생성 (폭탄에서 양쪽으로 뻗어나감)
  const newWires: Wire[] = []
  const wireSpacing = 300 / (actualWireCount + 1)

  for (let i = 0; i < actualWireCount; i++) {
    const y = 180 + (i + 1) * wireSpacing
    newWires.push({
      startX: 40,
      startY: y + (Math.random() - 0.5) * 15,
      endX: width - 40,
      endY: y + (Math.random() - 0.5) * 15,
      color: selectedColors[i]!,
      cut: false,
      cutAnimation: 0,
    })
  }

  wires.value = newWires

  // 절단 순서 (랜덤)
  const indices = Array.from({ length: actualWireCount }, (_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j]!, indices[i]!]
  }
  cutOrder.value = indices
  nextCutIndex.value = 0

  // 힌트 표시
  hintVisible.value = true
  roundCount.value++

  if (hintDuration < 99999) {
    hintTimeout = safeSetTimeout(() => {
      hintVisible.value = false
    }, hintDuration)
  }
}

// 스와이프가 와이어와 교차하는지 확인
function checkSwipeCrossesWire(
  wire: Wire,
  points: { x: number; y: number }[],
): boolean {
  if (points.length < 2) return false

  for (let i = 1; i < points.length; i++) {
    const p1 = points[i - 1]!
    const p2 = points[i]!
    if (segmentsIntersect(p1.x, p1.y, p2.x, p2.y, wire.startX, wire.startY, wire.endX, wire.endY)) {
      return true
    }
  }
  return false
}

// 두 선분의 교차 판정
function segmentsIntersect(
  ax: number, ay: number, bx: number, by: number,
  cx: number, cy: number, dx: number, dy: number,
): boolean {
  const denom = (bx - ax) * (dy - cy) - (by - ay) * (dx - cx)
  if (Math.abs(denom) < 0.001) return false

  const t = ((cx - ax) * (dy - cy) - (cy - ay) * (dx - cx)) / denom
  const u = ((cx - ax) * (by - ay) - (cy - ay) * (bx - ax)) / denom

  return t >= 0 && t <= 1 && u >= 0 && u <= 1
}

// 터치 시작
function handleTouchStart(event: TouchEvent) {
  if (isGameOver.value) return
  const touch = event.touches[0]
  if (!touch) return
  const coords = getCanvasCoordinates(touch)
  touchPoints.value = [coords]
}

// 터치 이동
function handleTouchMove(event: TouchEvent) {
  if (isGameOver.value) return
  const touch = event.touches[0]
  if (!touch) return
  const coords = getCanvasCoordinates(touch)
  touchPoints.value.push(coords)
}

// 터치 종료 → 와이어 절단 판정
function handleTouchEnd() {
  if (isGameOver.value || touchPoints.value.length < 2) {
    touchPoints.value = []
    return
  }

  const points = touchPoints.value
  touchPoints.value = []

  // 어떤 와이어를 잘랐는지 확인
  let cutWireIndex = -1
  for (let i = 0; i < wires.value.length; i++) {
    const wire = wires.value[i]!
    if (wire.cut) continue
    if (checkSwipeCrossesWire(wire, points)) {
      cutWireIndex = i
      break
    }
  }

  if (cutWireIndex === -1) return // 와이어를 자르지 않음

  attempts.value++

  const rect = canvasRef.value?.getBoundingClientRect()
  const screenX = rect ? rect.left + rect.width / 2 : width / 2
  const screenY = rect ? rect.top + height / 2 : height / 2

  const correctIndex = cutOrder.value[nextCutIndex.value]

  if (cutWireIndex === correctIndex) {
    // 정답
    const wire = wires.value[cutWireIndex]!
    wire.cut = true
    wire.cutAnimation = 1
    nextCutIndex.value++
    score.value += 10
    successCount.value++

    // 파티클
    const midX = (wire.startX + wire.endX) / 2
    const midY = (wire.startY + wire.endY) / 2
    if (helper.value) {
      const newParticles = helper.value.createParticles(midX, midY, wire.color.color, 10)
      particles.value.push(...newParticles)
    }

    createScorePopup(screenX, screenY - 20, '+10 ✂️', 'score')
    createParticles(containerRef.value, screenX, screenY, wire.color.color, 6)

    if (navigator.vibrate) navigator.vibrate(20)

    // 모든 와이어 절단 완료?
    if (nextCutIndex.value >= cutOrder.value.length) {
      // 폭탄 해제 성공!
      feedbackText.value = { text: '해제 성공! 💥→✅', color: '#4CAF50', life: 1.2 }
      shake(containerRef.value, 'light')
      if (navigator.vibrate) navigator.vibrate([20, 10, 20, 10, 20])

      safeSetTimeout(() => {
        if (!isGameOver.value) generateBomb()
      }, 800)
    }
  } else {
    // 오답 - 잘못된 와이어
    bombShakeAmount.value = 15
    feedbackText.value = { text: '잘못된 와이어! 💥', color: '#FF4444', life: 1 }
    shake(containerRef.value, 'strong')

    if (navigator.vibrate) navigator.vibrate([50, 30, 50])

    createScorePopup(screenX, screenY - 20, 'WRONG!', 'miss')
  }
}

// 업데이트
function update() {
  if (isGameOver.value) return

  // 폭탄 흔들림 감소
  if (bombShakeAmount.value > 0) {
    bombShakeAmount.value *= 0.9
    if (bombShakeAmount.value < 0.3) bombShakeAmount.value = 0
  }

  // 폭탄 펄스
  bombPulse.value += 0.05
  if (bombPulse.value > Math.PI * 2) bombPulse.value -= Math.PI * 2

  // 와이어 절단 애니메이션
  wires.value.forEach((w) => {
    if (w.cut && w.cutAnimation > 0) {
      w.cutAnimation -= 0.03
      if (w.cutAnimation < 0) w.cutAnimation = 0
    }
  })

  // 피드백 감소
  if (feedbackText.value) {
    feedbackText.value.life -= 0.025
    if (feedbackText.value.life <= 0) feedbackText.value = null
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

  // 경고 패턴 (줄무늬)
  ctx.value.fillStyle = 'rgba(255, 200, 0, 0.03)'
  for (let i = 0; i < width + height; i += 40) {
    ctx.value.beginPath()
    ctx.value.moveTo(i, 0)
    ctx.value.lineTo(i - height, height)
    ctx.value.lineTo(i - height + 20, height)
    ctx.value.lineTo(i + 20, 0)
    ctx.value.closePath()
    ctx.value.fill()
  }

  // 점수
  ctx.value.font = 'bold 22px Arial'
  ctx.value.fillStyle = '#FFF'
  ctx.value.textAlign = 'left'
  ctx.value.fillText(`점수: ${score.value}`, 16, 35)

  ctx.value.font = '16px Arial'
  ctx.value.fillStyle = '#AAA'
  ctx.value.textAlign = 'right'
  ctx.value.fillText(`ROUND ${roundCount.value}`, width - 16, 35)

  // 절단 순서 힌트
  const hintY = 70
  if (hintVisible.value || difficultySettings.value.showNumbers) {
    ctx.value.font = '14px Arial'
    ctx.value.fillStyle = '#888'
    ctx.value.textAlign = 'center'
    ctx.value.fillText('절단 순서:', width / 2, hintY)

    const totalWidth = cutOrder.value.length * 40
    const startX = (width - totalWidth) / 2 + 20

    cutOrder.value.forEach((wireIdx, orderIdx) => {
      const wire = wires.value[wireIdx]
      if (!wire) return

      const x = startX + orderIdx * 40
      const y = hintY + 25

      // 이미 자른 와이어는 체크 표시
      if (orderIdx < nextCutIndex.value) {
        ctx.value!.globalAlpha = 0.4
        helper.value!.drawCircle(x, y, 14, wire.color.color)
        ctx.value!.globalAlpha = 1
        ctx.value!.font = '16px Arial'
        ctx.value!.fillStyle = '#FFF'
        ctx.value!.textAlign = 'center'
        ctx.value!.textBaseline = 'middle'
        ctx.value!.fillText('✓', x, y)
      } else {
        // 현재/미래
        const isCurrent = orderIdx === nextCutIndex.value
        const alpha = hintVisible.value ? 1 : 0.3
        ctx.value!.globalAlpha = alpha

        helper.value!.drawCircle(x, y, 14, wire.color.color)
        if (isCurrent) {
          ctx.value!.strokeStyle = '#FFF'
          ctx.value!.lineWidth = 2
          ctx.value!.beginPath()
          ctx.value!.arc(x, y, 16, 0, Math.PI * 2)
          ctx.value!.stroke()
        }

        // 순서 번호
        if (difficultySettings.value.showNumbers || hintVisible.value) {
          ctx.value!.font = 'bold 14px Arial'
          ctx.value!.fillStyle = '#FFF'
          ctx.value!.textAlign = 'center'
          ctx.value!.textBaseline = 'middle'
          ctx.value!.fillText(`${orderIdx + 1}`, x, y)
        }

        ctx.value!.globalAlpha = 1
      }
    })
  }

  // 와이어
  const shakeX = bombShakeAmount.value > 0 ? (Math.random() - 0.5) * bombShakeAmount.value : 0
  const shakeY = bombShakeAmount.value > 0 ? (Math.random() - 0.5) * bombShakeAmount.value : 0

  wires.value.forEach((wire) => {
    if (wire.cut) {
      // 잘린 와이어: 양쪽이 처짐
      const midX = (wire.startX + wire.endX) / 2
      const midY = (wire.startY + wire.endY) / 2
      const droop = 20 * (1 - wire.cutAnimation)

      // 왼쪽 절반
      ctx.value!.strokeStyle = wire.color.color + '88'
      ctx.value!.lineWidth = 4
      ctx.value!.setLineDash([])
      ctx.value!.beginPath()
      ctx.value!.moveTo(wire.startX + shakeX, wire.startY + shakeY)
      ctx.value!.quadraticCurveTo(
        (wire.startX + midX) / 2 + shakeX,
        wire.startY + droop + shakeY,
        midX - 5 + shakeX,
        midY + droop + shakeY,
      )
      ctx.value!.stroke()

      // 오른쪽 절반
      ctx.value!.beginPath()
      ctx.value!.moveTo(midX + 5 + shakeX, midY + droop + shakeY)
      ctx.value!.quadraticCurveTo(
        (midX + wire.endX) / 2 + shakeX,
        wire.endY + droop + shakeY,
        wire.endX + shakeX,
        wire.endY + shakeY,
      )
      ctx.value!.stroke()

      // 스파크
      if (wire.cutAnimation > 0.5) {
        ctx.value!.fillStyle = '#FFD700'
        ctx.value!.beginPath()
        ctx.value!.arc(midX + shakeX, midY + shakeY, 4, 0, Math.PI * 2)
        ctx.value!.fill()
      }
    } else {
      // 온전한 와이어
      ctx.value!.strokeStyle = wire.color.color
      ctx.value!.lineWidth = 6
      ctx.value!.lineCap = 'round'
      ctx.value!.setLineDash([])
      ctx.value!.beginPath()
      ctx.value!.moveTo(wire.startX + shakeX, wire.startY + shakeY)

      // 살짝 곡선
      const midY = (wire.startY + wire.endY) / 2 + 10
      ctx.value!.quadraticCurveTo(
        width / 2 + shakeX,
        midY + shakeY,
        wire.endX + shakeX,
        wire.endY + shakeY,
      )
      ctx.value!.stroke()

      // 하이라이트
      ctx.value!.strokeStyle = wire.color.light
      ctx.value!.lineWidth = 2
      ctx.value!.beginPath()
      ctx.value!.moveTo(wire.startX + shakeX, wire.startY - 2 + shakeY)
      ctx.value!.quadraticCurveTo(
        width / 2 + shakeX,
        midY - 2 + shakeY,
        wire.endX + shakeX,
        wire.endY - 2 + shakeY,
      )
      ctx.value!.stroke()

      // 와이어 색 라벨 (양쪽 끝)
      ctx.value!.font = '12px Arial'
      ctx.value!.fillStyle = wire.color.color
      ctx.value!.textAlign = 'right'
      ctx.value!.fillText(wire.color.name, wire.startX - 5 + shakeX, wire.startY + 4 + shakeY)
    }
  })

  // 폭탄 본체 (중앙)
  const pulseScale = 1 + Math.sin(bombPulse.value) * 0.03
  const bx = BOMB_X + shakeX
  const by = BOMB_Y + shakeY

  // 폭탄 그림자
  helper.value.drawCircle(bx + 3, by + 3, 45 * pulseScale, 'rgba(0,0,0,0.3)')
  // 폭탄 본체
  helper.value.drawCircle(bx, by, 45 * pulseScale, '#333')
  helper.value.drawCircle(bx, by, 40 * pulseScale, '#444')
  // 하이라이트
  helper.value.drawCircle(bx - 12, by - 12, 10 * pulseScale, 'rgba(255,255,255,0.15)')

  // 폭탄 이모지
  ctx.value.font = `${50 * pulseScale}px Arial`
  ctx.value.textAlign = 'center'
  ctx.value.textBaseline = 'middle'
  ctx.value.fillText('💣', bx, by)

  // 심지 불꽃 애니메이션
  const sparkY = by - 50 * pulseScale
  const sparkFlicker = Math.sin(Date.now() / 80) * 3
  ctx.value.font = '20px Arial'
  ctx.value.fillText('🔥', bx + 15 + sparkFlicker, sparkY)

  // 스와이프 트레일
  if (touchPoints.value.length > 1) {
    ctx.value.strokeStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.value.lineWidth = 3
    ctx.value.setLineDash([5, 5])
    ctx.value.beginPath()
    ctx.value.moveTo(touchPoints.value[0]!.x, touchPoints.value[0]!.y)
    for (let i = 1; i < touchPoints.value.length; i++) {
      ctx.value.lineTo(touchPoints.value[i]!.x, touchPoints.value[i]!.y)
    }
    ctx.value.stroke()
    ctx.value.setLineDash([])

    // 가위 이모지 at touch point
    const last = touchPoints.value[touchPoints.value.length - 1]!
    ctx.value.font = '24px Arial'
    ctx.value.textAlign = 'center'
    ctx.value.textBaseline = 'middle'
    ctx.value.fillText('✂️', last.x, last.y)
  }

  // 안내
  ctx.value.font = '15px Arial'
  ctx.value.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.value.textAlign = 'center'
  ctx.value.fillText('와이어를 순서대로 스와이프해서 잘라라!', width / 2, height - 40)

  // 파티클
  if (helper.value) {
    particles.value = helper.value.updateAndDrawParticles(particles.value)
  }

  // 피드백 텍스트
  if (feedbackText.value && feedbackText.value.life > 0) {
    ctx.value.globalAlpha = Math.min(feedbackText.value.life, 1)
    ctx.value.font = 'bold 36px Arial'
    ctx.value.fillStyle = feedbackText.value.color
    ctx.value.textAlign = 'center'
    ctx.value.textBaseline = 'middle'
    ctx.value.fillText(feedbackText.value.text, width / 2, height - 100)
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

  const result: MiniGameResult = {
    success: score.value >= props.targetScore,
    score: score.value,
    timeRemaining: timeRemainingMs.value / 1000,
    count: successCount.value,
    attempts: attempts.value,
    accuracy: attempts.value > 0 ? Math.round((successCount.value / attempts.value) * 100) : 0,
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
  generateBomb()

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
