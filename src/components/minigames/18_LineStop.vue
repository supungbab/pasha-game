<template>
  <div ref="containerRef" class="minigame line-stop">
    <canvas
      ref="canvasRef"
      @touchstart.prevent="handleTouch"
    ></canvas>
    <ScorePopup :popups="scorePopups" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import type { MiniGameProps, MiniGameResult } from '@/types/minigame'
import { useCanvas, useCleanupTimers, useJuicyFeedback, useGameButtons } from '@/composables'
import { ScorePopup } from '@/components/common'

const props = defineProps<MiniGameProps>()
const emit = defineEmits<{
  complete: [result: MiniGameResult]
}>()

const containerRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const { ctx, helper, width, height, clear } = useCanvas(canvasRef, {
  width: 400,
  height: 600,
  backgroundColor: '#FAF6F1',
})

const {
  safeSetTimeout,
  safeSetInterval,
  safeRequestAnimationFrame,
  clearInterval,
  cancelAnimationFrame,
} = useCleanupTimers()

const { scorePopups, createScorePopup, shake } = useJuicyFeedback()
const { setOneButton } = useGameButtons()

// ─── Layout ──────────────────────────────────────────────────────────────────
const TRACK_LEFT = 110
const TRACK_RIGHT = 290
const TRACK_TOP = 115
const TRACK_BOTTOM = 505
const TRACK_W = TRACK_RIGHT - TRACK_LEFT   // 180
const TRACK_H = TRACK_BOTTOM - TRACK_TOP   // 390
const BAR_H = 24
const BAR_R = 8

// ─── Game state ──────────────────────────────────────────────────────────────
const score = ref(0)
const timeRemainingMs = ref(props.timeLimit * 1000)
const isGameOver = ref(false)
const round = ref(0)
const successCount = ref(0)
const attempts = ref(0)
const canTap = ref(false)
const roundFeedback = ref<{ text: string; color: string; life: number } | null>(null)

// Bar state (plain vars for perf)
let barY = TRACK_TOP + BAR_H / 2
let barDir = 1   // 1=down, -1=up
let frozen = false
let targetY = 0
let barResultColor = '#FF9800'

// ─── Difficulty ──────────────────────────────────────────────────────────────
interface DiffSettings { speed: number; perfect: number; good: number; ok: number }
const DEFAULT_DIFF: DiffSettings = { speed: 2.0, perfect: 28, good: 50, ok: 70 }

const difficultySettings = computed((): DiffSettings => {
  const s: DiffSettings[] = [
    { speed: 2.0, perfect: 28, good: 50, ok: 70 },
    { speed: 2.6, perfect: 22, good: 42, ok: 62 },
    { speed: 3.3, perfect: 17, good: 34, ok: 52 },
    { speed: 4.1, perfect: 13, good: 27, ok: 43 },
    { speed: 5.0, perfect: 10, good: 21, ok: 34 },
    { speed: 6.0, perfect: 8,  good: 16, ok: 26 },
  ]
  return s[Math.max(0, Math.min(props.difficulty - 1, 5))] ?? DEFAULT_DIFF
})

let animationId = 0
let timerIntervalId = 0

// ─── Round logic ─────────────────────────────────────────────────────────────
function startNewRound() {
  round.value++
  frozen = false
  barResultColor = '#FF9800'
  const margin = TRACK_H * 0.18
  targetY = TRACK_TOP + margin + Math.random() * (TRACK_H - margin * 2)
  barY = TRACK_TOP + BAR_H / 2
  barDir = 1
  canTap.value = true
}

// ─── Input ───────────────────────────────────────────────────────────────────
function handleTouch() {
  if (isGameOver.value || !canTap.value || frozen) return

  frozen = true
  canTap.value = false
  attempts.value++

  const { perfect, good, ok } = difficultySettings.value
  const dist = Math.abs(barY - targetY)

  const rect = canvasRef.value?.getBoundingClientRect()
  const sx = rect ? rect.left + rect.width / 2 : width / 2
  const sy = rect ? rect.top + (targetY / height) * rect.height : targetY

  if (dist <= perfect) {
    score.value += 20
    successCount.value++
    barResultColor = '#FFD700'
    roundFeedback.value = { text: 'PERFECT!', color: '#FF8F00', life: 1 }
    createScorePopup(sx, sy - 30, '+20 PERFECT!', 'combo')
    shake(containerRef.value, 'light')
    if (navigator.vibrate) navigator.vibrate([20, 10, 20])
  } else if (dist <= good) {
    score.value += 12
    successCount.value++
    barResultColor = '#4CAF50'
    roundFeedback.value = { text: 'GOOD!', color: '#2E7D32', life: 1 }
    createScorePopup(sx, sy - 30, '+12', 'score')
    if (navigator.vibrate) navigator.vibrate(15)
  } else if (dist <= ok) {
    score.value += 6
    barResultColor = '#FF9800'
    roundFeedback.value = { text: 'OK', color: '#E65100', life: 1 }
    createScorePopup(sx, sy - 30, '+6', 'score')
    if (navigator.vibrate) navigator.vibrate(10)
  } else {
    barResultColor = '#F44336'
    roundFeedback.value = { text: 'MISS!', color: '#B71C1C', life: 1 }
    createScorePopup(sx, sy - 30, 'MISS', 'miss')
    shake(containerRef.value, 'strong')
    if (navigator.vibrate) navigator.vibrate(50)
  }

  safeSetTimeout(() => {
    if (!isGameOver.value) startNewRound()
  }, 650)
}

// ─── Update ──────────────────────────────────────────────────────────────────
function update() {
  if (isGameOver.value || frozen) return

  const { speed } = difficultySettings.value
  const spd = props.isHardMode ? speed * 1.35 : speed

  barY += barDir * spd

  if (barY >= TRACK_BOTTOM - BAR_H / 2) {
    barY = TRACK_BOTTOM - BAR_H / 2
    barDir = -1
  } else if (barY <= TRACK_TOP + BAR_H / 2) {
    barY = TRACK_TOP + BAR_H / 2
    barDir = 1
  }

  if (roundFeedback.value) {
    roundFeedback.value.life -= 0.022
    if (roundFeedback.value.life <= 0) roundFeedback.value = null
  }
}

// ─── Render ──────────────────────────────────────────────────────────────────
function drawBarPath() {
  if (!ctx.value) return
  const bx = TRACK_LEFT
  const by = barY - BAR_H / 2
  const bw = TRACK_W
  const bh = BAR_H
  const br = BAR_R
  const c = ctx.value
  c.beginPath()
  c.moveTo(bx + br, by)
  c.lineTo(bx + bw - br, by)
  c.quadraticCurveTo(bx + bw, by, bx + bw, by + br)
  c.lineTo(bx + bw, by + bh - br)
  c.quadraticCurveTo(bx + bw, by + bh, bx + bw - br, by + bh)
  c.lineTo(bx + br, by + bh)
  c.quadraticCurveTo(bx, by + bh, bx, by + bh - br)
  c.lineTo(bx, by + br)
  c.quadraticCurveTo(bx, by, bx + br, by)
  c.closePath()
}

function render() {
  if (!ctx.value || !helper.value) return
  clear()

  const c = ctx.value

  // ── Header ──
  c.textAlign = 'center'
  c.textBaseline = 'alphabetic'

  c.font = 'bold 18px Arial'
  c.fillStyle = '#888'
  c.fillText(`ROUND ${round.value}`, width / 2, 46)

  c.font = 'bold 38px Arial'
  c.fillStyle = '#333'
  c.fillText(`${score.value}`, width / 2, 95)

  // ── Track shadow ──
  helper.value.drawRoundRect(TRACK_LEFT - 4, TRACK_TOP - 4, TRACK_W + 8, TRACK_H + 8, 16, 'rgba(0,0,0,0.07)')

  // ── Track background ──
  helper.value.drawRoundRect(TRACK_LEFT, TRACK_TOP, TRACK_W, TRACK_H, 12, '#FFFFFF')

  // ── Clip to track for zone fills ──
  c.save()
  c.beginPath()
  c.rect(TRACK_LEFT, TRACK_TOP, TRACK_W, TRACK_H)
  c.clip()

  const { perfect, good, ok } = difficultySettings.value

  c.fillStyle = 'rgba(255, 152, 0, 0.12)'
  c.fillRect(TRACK_LEFT, targetY - ok, TRACK_W, ok * 2)

  c.fillStyle = 'rgba(76, 175, 80, 0.22)'
  c.fillRect(TRACK_LEFT, targetY - good, TRACK_W, good * 2)

  c.fillStyle = 'rgba(255, 215, 0, 0.38)'
  c.fillRect(TRACK_LEFT, targetY - perfect, TRACK_W, perfect * 2)

  c.restore()

  // ── Stop line (dashed red) ──
  c.setLineDash([10, 5])
  c.strokeStyle = '#E53935'
  c.lineWidth = 2.5
  c.beginPath()
  c.moveTo(TRACK_LEFT, targetY)
  c.lineTo(TRACK_RIGHT, targetY)
  c.stroke()
  c.setLineDash([])

  // ── Arrows pointing at stop line ──
  c.fillStyle = '#E53935'
  // Left arrow → pointing right
  c.beginPath()
  c.moveTo(TRACK_LEFT - 24, targetY)
  c.lineTo(TRACK_LEFT - 8, targetY - 9)
  c.lineTo(TRACK_LEFT - 8, targetY + 9)
  c.closePath()
  c.fill()
  // Right arrow ← pointing left
  c.beginPath()
  c.moveTo(TRACK_RIGHT + 24, targetY)
  c.lineTo(TRACK_RIGHT + 8, targetY - 9)
  c.lineTo(TRACK_RIGHT + 8, targetY + 9)
  c.closePath()
  c.fill()

  // ── Moving bar ──
  drawBarPath()

  if (frozen) {
    c.fillStyle = barResultColor
  } else {
    // Glow near perfect zone
    const dist = Math.abs(barY - targetY)
    if (dist < perfect * 2.5) {
      c.shadowColor = '#FFD700'
      c.shadowBlur = 16 * Math.max(0, 1 - dist / (perfect * 2.5))
    }
    const grad = c.createLinearGradient(TRACK_LEFT, 0, TRACK_RIGHT, 0)
    grad.addColorStop(0, '#FFB300')
    grad.addColorStop(0.5, '#FFE57F')
    grad.addColorStop(1, '#FFB300')
    c.fillStyle = grad
  }

  c.fill()
  c.shadowBlur = 0
  c.strokeStyle = 'rgba(0,0,0,0.18)'
  c.lineWidth = 1.5
  c.stroke()

  // ── Bottom instruction ──
  c.textAlign = 'center'
  c.textBaseline = 'alphabetic'

  if (canTap.value) {
    c.font = 'bold 22px Arial'
    c.fillStyle = '#444'
    c.fillText('정지선에 맞추세요!', width / 2, 550)
    c.font = '16px Arial'
    c.fillStyle = '#AAA'
    c.fillText('탭하면 막대가 멈춥니다', width / 2, 577)
  } else {
    c.font = '20px Arial'
    c.fillStyle = '#AAA'
    c.fillText('다음 라운드...', width / 2, 555)
  }

  // ── Feedback text ──
  if (roundFeedback.value && roundFeedback.value.life > 0) {
    const alpha = Math.min(roundFeedback.value.life, 1)
    const scale = 1 + (1 - roundFeedback.value.life) * 0.35
    c.save()
    c.globalAlpha = alpha
    c.translate(width / 2, 310)
    c.scale(scale, scale)
    c.font = 'bold 54px Arial'
    c.fillStyle = roundFeedback.value.color
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    c.fillText(roundFeedback.value.text, 0, 0)
    c.restore()
    c.globalAlpha = 1
  }
}

// ─── Game loop ───────────────────────────────────────────────────────────────
function gameLoop() {
  if (isGameOver.value) return
  update()
  render()
  animationId = safeRequestAnimationFrame(gameLoop)
}

function endGame() {
  isGameOver.value = true
  cancelAnimationFrame(animationId)
  clearInterval(timerIntervalId)

  const accuracy = attempts.value > 0
    ? Math.round((successCount.value / attempts.value) * 100)
    : 0

  const result: MiniGameResult = {
    success: score.value >= props.targetScore,
    score: score.value,
    timeRemaining: timeRemainingMs.value / 1000,
    accuracy,
    count: successCount.value,
    attempts: attempts.value,
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

function startGame() {
  startNewRound()

  timerIntervalId = safeSetInterval(() => {
    timeRemainingMs.value -= 100
    if (timeRemainingMs.value <= 0) {
      timeRemainingMs.value = 0
      endGame()
    }
  }, 100)

  gameLoop()
}

onMounted(() => {
  setOneButton(handleTouch)

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
  position: relative;
  overflow: hidden;
}

canvas {
  max-width: 100%;
  max-height: 100%;
  touch-action: none;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
</style>
