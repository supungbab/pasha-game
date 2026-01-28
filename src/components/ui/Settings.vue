<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { Button, Card, Toggle, Slider, Modal } from '@/components/base';
import { getSettings, saveSettings, clearAllData, clearProgress } from '@/utils/storage';
import { DEFAULT_SETTINGS } from '@/types/game';
import type { GameSettings } from '@/types/game';

const emit = defineEmits<{
  close: [];
}>();

const settings = ref<GameSettings>({ ...DEFAULT_SETTINGS });
const showResetModal = ref(false);
const showClearModal = ref(false);

onMounted(() => {
  settings.value = getSettings();
});

watch(settings, (newSettings) => {
  saveSettings(newSettings);
}, { deep: true });

// TODO: 언어 설정 기능 추가 예정

function handleResetAll() {
  clearAllData();
  settings.value = { ...DEFAULT_SETTINGS };
  showResetModal.value = false;
}

function handleClearProgress() {
  clearProgress();
  showClearModal.value = false;
}
</script>

<template>
  <div class="settings">
    <!-- Header -->
    <header class="header">
      <h1 class="title">⚙️ 설정</h1>
      <Button variant="secondary" size="small" @click="emit('close')">✕</Button>
    </header>

    <!-- Content -->
    <main class="content">
      <!-- 오디오 -->
      <Card padding="medium" elevation="low">
        <template #header>
          <span class="section-icon">🔊</span>
          <span class="section-label">오디오</span>
        </template>

        <div class="row">
          <div class="label">
            <span class="name">사운드</span>
            <span class="desc">게임 효과음</span>
          </div>
          <Toggle v-model="settings.sound" />
        </div>

        <div class="row volume-row">
          <div class="volume-header">
            <span class="name">볼륨</span>
            <span class="volume-value">{{ settings.volume }}%</span>
          </div>
          <Slider
            v-model="settings.volume"
            :min="0"
            :max="100"
            :disabled="!settings.sound"
            :show-value="false"
          />
        </div>

        <div class="row">
          <div class="label">
            <span class="name">진동</span>
            <span class="desc">햅틱 피드백</span>
          </div>
          <Toggle v-model="settings.vibration" />
        </div>
      </Card>

      <!-- 게임 -->
      <Card padding="medium" elevation="low">
        <template #header>
          <span class="section-icon">🎮</span>
          <span class="section-label">게임</span>
        </template>

        <div class="row">
          <div class="label">
            <span class="name">튜토리얼</span>
            <span class="desc">게임 시작 전 도움말</span>
          </div>
          <Toggle v-model="settings.showTutorial" />
        </div>
      </Card>

      <!-- 데이터 관리 -->
      <Card padding="medium" elevation="low">
        <template #header>
          <span class="section-icon">📊</span>
          <span class="section-label">데이터 관리</span>
        </template>

        <div class="actions">
          <Button variant="secondary" full-width @click="showClearModal = true">
            🗑️ 진행상황 초기화
          </Button>
          <Button variant="danger" full-width @click="showResetModal = true">
            ⚠️ 모든 데이터 초기화
          </Button>
        </div>
      </Card>

      <!-- 정보 -->
      <Card padding="medium" elevation="low">
        <template #header>
          <span class="section-icon">ℹ️</span>
          <span class="section-label">정보</span>
        </template>

        <div class="info-grid">
          <div class="info-box">
            <span class="info-key">버전</span>
            <span class="info-val">1.0.0</span>
          </div>
          <div class="info-box">
            <span class="info-key">제작</span>
            <span class="info-val">Claude</span>
          </div>
          <div class="info-box">
            <span class="info-key">라이선스</span>
            <span class="info-val">MIT</span>
          </div>
        </div>

        <p class="info-text">
          빠샤(PASHA!)는 30개의 다양한 미니게임으로 구성된 반응속도 테스트 게임입니다.
        </p>
      </Card>
    </main>

    <!-- Modals -->
    <Modal :show="showClearModal" title="진행상황 초기화" @close="showClearModal = false">
      <div class="modal-body">
        <span class="modal-emoji">🗑️</span>
        <p>모든 게임 기록과 랭킹이 삭제됩니다.</p>
        <p>설정은 유지됩니다.</p>
        <p class="confirm">계속하시겠습니까?</p>
      </div>
      <template #footer>
        <Button variant="secondary" @click="showClearModal = false">취소</Button>
        <Button variant="danger" @click="handleClearProgress">초기화</Button>
      </template>
    </Modal>

    <Modal :show="showResetModal" title="모든 데이터 초기화" @close="showResetModal = false">
      <div class="modal-body">
        <span class="modal-emoji shake">⚠️</span>
        <p class="warning">모든 게임 기록, 랭킹, 설정이 삭제됩니다.</p>
        <p>이 작업은 되돌릴 수 없습니다.</p>
        <p class="confirm">정말로 초기화하시겠습니까?</p>
      </div>
      <template #footer>
        <Button variant="secondary" @click="showResetModal = false">취소</Button>
        <Button variant="danger" @click="handleResetAll">모두 초기화</Button>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
/* ===== Layout ===== */
.settings {
  width: 100%;
  max-width: 500px;
  height: 100%;
  margin: 0 auto;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--bg-main);
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-dark);
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* ===== Section Header ===== */
.section-icon {
  font-size: 1.1rem;
}

.section-label {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-dark);
}

/* ===== Row (Setting Item) ===== */
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  background: var(--light-gray);
  border-radius: var(--radius-md);
  margin-top: 8px;
}

.row.column {
  flex-direction: column;
  align-items: stretch;
}

.label {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-dark);
}

.desc {
  font-size: 0.75rem;
  color: var(--text-light);
}

/* ===== Volume Row ===== */
.volume-row {
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
}

.volume-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.volume-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--primary-yellow);
  min-width: 40px;
  text-align: right;
}

/* ===== Actions ===== */
.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ===== Info Grid ===== */
.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.info-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px;
  background: var(--neutral-cream);
  border-radius: var(--radius-sm);
}

.info-key {
  font-size: 0.7rem;
  color: var(--text-light);
  text-transform: uppercase;
}

.info-val {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--primary-yellow);
}

.info-text {
  margin: 12px 0 0;
  padding-top: 12px;
  border-top: 1px solid var(--neutral-cream);
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--text-medium);
  text-align: center;
}

/* ===== Modal ===== */
.modal-body {
  text-align: center;
}

.modal-emoji {
  display: block;
  font-size: 3rem;
  margin-bottom: 12px;
}

.modal-emoji.shake {
  animation: shake 0.5s ease;
}

.warning {
  color: var(--error);
  font-weight: 600;
}

.confirm {
  font-weight: 700;
  margin-top: 8px;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* ===== Responsive ===== */
@media (max-width: 400px) {
  .settings {
    padding: 16px 12px;
    gap: 12px;
  }

  .title {
    font-size: 1.5rem;
  }

  .row {
    padding: 10px;
  }

  .volume-slider {
    max-width: 130px;
  }
}

@media (max-height: 650px) {
  .settings {
    padding: 12px;
    gap: 10px;
  }

  .content {
    gap: 10px;
  }

  .row {
    padding: 10px;
    margin-top: 6px;
  }
}
</style>
