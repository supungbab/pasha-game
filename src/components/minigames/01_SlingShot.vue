<template>
  <div ref="containerRef" class="minigame slingshot">
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
  backgroundColor: '#87CEEB',
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

// Game state
const score = ref(0)
const timeRemainingMs = ref(props.timeLimit * 1000)
const isGameOver = ref(false)
const targets = ref<Target[]>([])
const projectiles = ref<Projectile[]>([])
const particles = ref<Particle[]>([])

// Slingshot state
const slingshotBase = { x: 200, y: 520 }
const isDragging = ref(false)
const dragX = ref(slingshotBase.x)
const dragY = ref(slingshotBase.y)
const MAX_PULL = 120

// Difficulty settings
const DEFAULT_SETTINGS = { targetCount: 5, targetSize: 60, targetSpeed: 0 }
const difficultySettings = computed(() => {
  const settings = [
    { targetCount: 5, targetSize: 60, targetSpeed: 0 }, // Lv.1: 정적
    { targetCount: 6, targetSize: 55, targetSpeed: 0.3 }, // Lv.2
    { targetCount: 7, targetSize: 50, targetSpeed: 0.5 }, // Lv.3: 드리프트
    { targetCount: 8, targetSize: 45, targetSpeed: 0.8 }, // Lv.4
    { targetCount: 9, targetSize: 40, targetSpeed: 1.2 }, // Lv.5
    { targetCount: 10, targetSize: 35, targetSpeed: 1.8 }, // Lv.6: 빠르게 이동
  ]
  const index = Math.max(0, Math.min(props.difficulty - 1, 5))
  return settings[index] ?? DEFAULT_SETTINGS
})

interface Target {
  id: number
  x: number
  y: number
  size: number
  hit: boolean
  speedX: number
  emoji: string
}

interface Projectile {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
}

const TARGET_EMOJIS = ['🎯', '🍎', '🎪', '⭐', '💎', '🏮']

let animationId: number = 0
let timerInterval: number = 0
let targetIdCounter = 0

// 타겟 생성
function spawnTargets() {
  const { targetCount, targetSize, targetSpeed } = difficultySettings.value
  const actualSize = props.isHardMode ? targetSize * 0.8 : targetSize
  const actualSpeed = props.isHardMode ? targetSpeed * 1.3 : targetSpeed

  targets.value = []
  const cols = Math.ceil(Math.sqrt(targetCount * 1.5))
  const rows = Math.ceil(targetCount / cols)
  const spacingX = (width - 60) / cols
  const spacingY = 180 / rows

  let count = 0
  for (let r = 0; r < rows && count < targetCount; r++) {
    for (let c = 0; c < cols && count < targetCount; c++) {
      const emojiIndex = Math.floor(Math.random() * TARGET_EMOJIS.length)
      targets.value.push({
        id: targetIdCounter++,
        x: 40 + c * spacingX + spacingX / 2 + (Math.random() - 0.5) * 20,
        y: 60 + r * spacingY + spacingY / 2 + (Math.random() - 0.5) * 10,
        size: actualSize,
        hit: false,
        speedX: actualSpeed > 0 ? (Math.random() > 0.5 ? 1 : -1) * actualSpeed : 0,
        emoji: TARGET_EMOJIS[emojiIndex] ?? '🎯',
      })
      count++
    }
  }
}

// 터치 시작
function handleTouchStart(event: TouchEvent) {
  if (isGameOver.value) return
  const touch = event.touches[0]
  if (!touch) return
  const coords = getCanvasCoordinates(touch)

  // 새총 근처에서만 드래그 시작
  const dx = coords.x - slingshotBase.x
  const dy = coords.y - slingshotBase.y
  if (Math.sqrt(dx * dx + dy * dy) < 80) {
    isDragging.value = true
    dragX.value = coords.x
    dragY.value = coords.y
  }
}

// 터치 이동
function handleTouchMove(event: TouchEvent) {
  if (!isDragging.value || isGameOver.value) return
  const touch = event.touches[0]
  if (!touch) return
  const coords = getCanvasCoordinates(touch)

  // 당기기 거리 제한
  const dx = coords.x - slingshotBase.x
  const dy = coords.y - slingshotBase.y
  const dist = Math.sqrt(dx * dx + dy * dy)

  if (dist > MAX_PULL) {
    const angle = Math.atan2(dy, dx)
    dragX.value = slingshotBase.x + Math.cos(angle) * MAX_PULL
    dragY.value = slingshotBase.y + Math.sin(angle) * MAX_PULL
  } else {
    dragX.value = coords.x
    dragY.value = coords.y
  }
}

// 터치 종료 → 발사
function handleTouchEnd() {
  if (!isDragging.value || isGameOver.value) return
  isDragging.value = false

  const dx = slingshotBase.x - dragX.value
  const dy = slingshotBase.y - dragY.value
  const dist = Math.sqrt(dx * dx + dy * dy)

  // 최소 당기기 거리
  if (dist > 15) {
    const power = dist / MAX_PULL
    const angle = Math.atan2(dy, dx)
    const speed = 8 + power * 12

    projectiles.value.push({
      x: slingshotBase.x,
      y: slingshotBase.y - 10,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 8,
    })

    if (navigator.vibrate) {
      navigator.vibrate(15)
    }
  }

  // 드래그 위치 리셋
  dragX.value = slingshotBase.x
  dragY.value = slingshotBase.y
}

// 업데이트
function update() {
  if (isGameOver.value) return

  const { targetSpeed } = difficultySettings.value

  // 타겟 이동
  if (targetSpeed > 0) {
    targets.value.forEach((t) => {
      if (t.hit) return
      t.x += t.speedX
      if (t.x - t.size / 2 < 10 || t.x + t.size / 2 > width - 10) {
        t.speedX *= -1
        t.x = Math.max(t.size / 2 + 10, Math.min(width - t.size / 2 - 10, t.x))
      }
    })
  }

  // 투사체 이동 + 충돌 체크
  projectiles.value = projectiles.value.filter((p) => {
    p.x += p.vx
    p.y += p.vy
    p.vy += 0.15 // 중력

    // 화면 밖
    if (p.x < -20 || p.x > width + 20 || p.y < -20 || p.y > height + 20) {
      return false
    }

    // 타겟 충돌
    for (const t of targets.value) {
      if (t.hit) continue
      const dx = p.x - t.x
      const dy = p.y - t.y
      if (Math.sqrt(dx * dx + dy * dy) < t.size / 2 + p.radius) {
        t.hit = true
        score.value += 10

        // 파티클
        if (helper.value) {
          const newParticles = helper.value.createParticles(t.x, t.y, '#FFD700', 10)
          particles.value.push(...newParticles)
        }

        // 피드백
        const rect = canvasRef.value?.getBoundingClientRect()
        if (rect) {
          const screenX = rect.left + (t.x / width) * rect.width
          const screenY = rect.top + (t.y / height) * rect.height
          createScorePopup(screenX, screenY - 20, '+10', 'score')
          createParticles(containerRef.value, screenX, screenY, '#FFD700', 6)
        }

        if (navigator.vibrate) {
          navigator.vibrate(25)
        }

        return false
      }
    }

    return true
  })

  // 모든 타겟 히트 시 새로 생성
  if (targets.value.length > 0 && targets.value.every((t) => t.hit)) {
    spawnTargets()
  }
}

// 렌더링
function render() {
  if (!helper.value || !ctx.value) return

  clear()

  // 배경 그라데이션
  const gradient = ctx.value.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, '#4A90D9')
  gradient.addColorStop(0.6, '#87CEEB')
  gradient.addColorStop(1, '#8B6F47')
  ctx.value.fillStyle = gradient
  ctx.value.fillRect(0, 0, width, height)

  // 잔디 영역
  helper.value.drawRect(0, height - 100, width, 100, '#4CAF50')
  helper.value.drawRect(0, height - 103, width, 6, '#66BB6A')

  // 타겟
  targets.value.forEach((t) => {
    if (t.hit) return

    // 그림자
    helper.value!.drawCircle(t.x + 2, t.y + 2, t.size / 2, 'rgba(0,0,0,0.15)')
    // 타겟 배경
    helper.value!.drawCircle(t.x, t.y, t.size / 2, '#FFFFFF')
    helper.value!.drawCircle(t.x, t.y, t.size / 2 - 4, '#FF6B6B')
    helper.value!.drawCircle(t.x, t.y, t.size / 2 - 12, '#FFFFFF')
    helper.value!.drawCircle(t.x, t.y, t.size / 2 - 18, '#FF6B6B')
    // 이모지
    helper.value!.drawEmoji(t.emoji, t.x, t.y, t.size * 0.4)
  })

  // 새총 Y자 기둥
  const baseX = slingshotBase.x
  const baseY = slingshotBase.y
  ctx.value.strokeStyle = '#5D4037'
  ctx.value.lineWidth = 8
  ctx.value.lineCap = 'round'

  // 기둥
  ctx.value.beginPath()
  ctx.value.moveTo(baseX, baseY + 40)
  ctx.value.lineTo(baseX, baseY)
  ctx.value.stroke()

  // Y 갈래
  ctx.value.beginPath()
  ctx.value.moveTo(baseX, baseY)
  ctx.value.lineTo(baseX - 20, baseY - 25)
  ctx.value.stroke()

  ctx.value.beginPath()
  ctx.value.moveTo(baseX, baseY)
  ctx.value.lineTo(baseX + 20, baseY - 25)
  ctx.value.stroke()

  // 고무줄 + 돌
  if (isDragging.value) {
    const pullX = dragX.value
    const pullY = dragY.value

    // 고무줄 (왼쪽)
    ctx.value.strokeStyle = '#D32F2F'
    ctx.value.lineWidth = 3
    ctx.value.beginPath()
    ctx.value.moveTo(baseX - 20, baseY - 25)
    ctx.value.lineTo(pullX, pullY)
    ctx.value.stroke()

    // 고무줄 (오른쪽)
    ctx.value.beginPath()
    ctx.value.moveTo(baseX + 20, baseY - 25)
    ctx.value.lineTo(pullX, pullY)
    ctx.value.stroke()

    // 돌
    helper.value.drawCircle(pullX, pullY, 10, '#666')
    helper.value.drawCircle(pullX - 2, pullY - 2, 4, '#888')

    // 조준선 (점선)
    const aimDx = baseX - pullX
    const aimDy = baseY - pullY
    const aimDist = Math.sqrt(aimDx * aimDx + aimDy * aimDy)
    if (aimDist > 10) {
      ctx.value.setLineDash([4, 6])
      ctx.value.strokeStyle = 'rgba(255,255,255,0.4)'
      ctx.value.lineWidth = 2
      ctx.value.beginPath()
      ctx.value.moveTo(baseX, baseY - 10)
      const normX = aimDx / aimDist
      const normY = aimDy / aimDist
      ctx.value.lineTo(baseX + normX * 80, baseY - 10 + normY * 80)
      ctx.value.stroke()
      ctx.value.setLineDash([])
    }
  } else {
    // 고무줄 (이완 상태)
    ctx.value.strokeStyle = '#D32F2F'
    ctx.value.lineWidth = 3
    ctx.value.beginPath()
    ctx.value.moveTo(baseX - 20, baseY - 25)
    ctx.value.quadraticCurveTo(baseX, baseY - 15, baseX + 20, baseY - 25)
    ctx.value.stroke()
  }

  // 투사체
  projectiles.value.forEach((p) => {
    helper.value!.drawCircle(p.x, p.y, p.radius, '#555')
    helper.value!.drawCircle(p.x - 2, p.y - 2, p.radius * 0.4, '#888')
  })

  // 파티클
  if (helper.value) {
    particles.value = helper.value.updateAndDrawParticles(particles.value)
  }

  // 점수
  ctx.value.font = 'bold 22px Arial'
  ctx.value.fillStyle = '#FFF'
  ctx.value.textAlign = 'left'
  ctx.value.shadowColor = 'rgba(0,0,0,0.3)'
  ctx.value.shadowBlur = 4
  ctx.value.fillText(`점수: ${score.value}`, 16, 32)
  ctx.value.shadowBlur = 0
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
    count: Math.floor(score.value / 10),
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
  spawnTargets()

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
