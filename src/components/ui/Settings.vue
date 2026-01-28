<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { Button, Card, Toggle, Slider, Modal } from '@/components/base';
import { getSettings, saveSettings, clearAllData, clearProgress } from '@/utils/storage';
import type { GameSettings } from '@/types/game';

const emit = defineEmits<{
  close: [];
}>();

const settings = ref<GameSettings>({
  sound: true,
  vibration: true,
  showTutorial: true,
  language: 'ko',
  volume: 80
});

const showResetModal = ref(false);
const showClearModal = ref(false);

onMounted(() => {
  settings.value = getSettings();
});

watch(settings, (newSettings) => {
  saveSettings(newSettings);
}, { deep: true });

const handleResetAll = () => {
  clearAllData();
  settings.value = {
    sound: true,
    vibration: true,
    showTutorial: true,
    language: 'ko',
    volume: 80
  };
  showResetModal.value = false;
};

const handleClearProgress = () => {
  clearProgress();
  showClearModal.value = false;
};
</script>

<template>
  <div class="settings">
    <div class="settings-header">
      <h1 class="settings-title">⚙️ 설정</h1>
      <Button variant="secondary" size="small" @tap="emit('close')">
        ✕
      </Button>
    </div>

    <div class="settings-content">
      <!-- Audio Settings -->
      <Card class="setting-section">
        <h2 class="section-title">🔊 오디오</h2>

        <div class="setting-item">
          <div class="setting-label">
            <span>사운드</span>
            <span class="setting-desc">게임 효과음</span>
          </div>
          <Toggle v-model="settings.sound" />
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <span>볼륨</span>
          </div>
          <Slider
            v-model="settings.volume"
            :min="0"
            :max="100"
            :disabled="!settings.sound"
            show-value
          />
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <span>진동</span>
            <span class="setting-desc">햅틱 피드백</span>
          </div>
          <Toggle v-model="settings.vibration" />
        </div>
      </Card>

      <!-- Game Settings -->
      <Card class="setting-section">
        <h2 class="section-title">🎮 게임</h2>

        <div class="setting-item">
          <div class="setting-label">
            <span>튜토리얼 표시</span>
            <span class="setting-desc">게임 시작 전 도움말</span>
          </div>
          <Toggle v-model="settings.showTutorial" />
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <span>언어</span>
          </div>
          <div class="language-selector">
            <Button
              :variant="settings.language === 'ko' ? 'primary' : 'secondary'"
              size="small"
              @tap="settings.language = 'ko'"
            >
              🇰🇷 한국어
            </Button>
            <Button
              :variant="settings.language === 'en' ? 'primary' : 'secondary'"
              size="small"
              @tap="settings.language = 'en'"
            >
              🇺🇸 English
            </Button>
          </div>
        </div>
      </Card>

      <!-- Data Management -->
      <Card class="setting-section">
        <h2 class="section-title">📊 데이터 관리</h2>

        <div class="setting-item">
          <Button
            variant="secondary"
            full-width
            @tap="showClearModal = true"
          >
            🗑️ 진행상황 초기화
          </Button>
        </div>

        <div class="setting-item">
          <Button
            variant="danger"
            full-width
            @tap="showResetModal = true"
          >
            ⚠️ 모든 데이터 초기화
          </Button>
        </div>
      </Card>

      <!-- About -->
      <Card class="setting-section about-section">
        <h2 class="section-title">ℹ️ 정보</h2>
        <div class="about-info">
          <p><strong>버전:</strong> 1.0.0</p>
          <p><strong>제작:</strong> Claude Sonnet 4.5</p>
          <p><strong>라이선스:</strong> MIT</p>
          <p class="description">
            빠샤(PASHA!)는 30개의 다양한 미니게임으로 구성된<br />
            반응속도 테스트 게임입니다.
          </p>
        </div>
      </Card>
    </div>

    <div class="settings-footer">
      <Button variant="primary" full-width @tap="emit('close')">
        닫기
      </Button>
    </div>

    <!-- Clear Progress Modal -->
    <Modal
      :show="showClearModal"
      title="진행상황 초기화"
      @close="showClearModal = false"
    >
      <p>모든 게임 기록과 랭킹이 삭제됩니다.</p>
      <p>설정은 유지됩니다.</p>
      <p><strong>계속하시겠습니까?</strong></p>

      <template #footer>
        <Button variant="secondary" @tap="showClearModal = false">
          취소
        </Button>
        <Button variant="danger" @tap="handleClearProgress">
          초기화
        </Button>
      </template>
    </Modal>

    <!-- Reset All Modal -->
    <Modal
      :show="showResetModal"
      title="모든 데이터 초기화"
      @close="showResetModal = false"
    >
      <p><strong>⚠️ 경고</strong></p>
      <p>모든 게임 기록, 랭킹, 설정이 삭제됩니다.</p>
      <p>이 작업은 되돌릴 수 없습니다.</p>
      <p><strong>정말로 초기화하시겠습니까?</strong></p>

      <template #footer>
        <Button variant="secondary" @tap="showResetModal = false">
          취소
        </Button>
        <Button variant="danger" @tap="handleResetAll">
          모두 초기화
        </Button>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.settings {
  width: 100%;
  max-width: 600px;
  height: 100vh;
  height: 100dvh;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
  background: var(--bg-main);
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  animation: slideUp 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.settings-header :deep(button) {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
  padding: 0 !important;
  width: auto !important;
  font-size: 1.5rem;
  color: var(--text-medium);
}

.settings-title {
  font-size: 2.2rem;
  margin: 0;
  color: var(--text-dark);
  font-weight: 700;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  padding-right: 0.25rem;
}

.settings-content::-webkit-scrollbar {
  width: 8px;
}

.settings-content::-webkit-scrollbar-track {
  background: var(--light-gray);
  border-radius: 4px;
}

.settings-content::-webkit-scrollbar-thumb {
  background: var(--gradient-primary);
  border-radius: 4px;
}

.setting-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  animation: slideUp 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.section-title {
  font-size: 1.15rem;
  margin: 0 0 0.25rem 0;
  color: var(--text-dark);
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--neutral-cream);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.6rem 0.75rem;
  background: var(--white);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--secondary-yellow);
  box-shadow: var(--shadow-sm);
}

.setting-item:nth-child(odd) {
  border-left-color: var(--primary-yellow);
}

.setting-label {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
}

.setting-label > span:first-child {
  font-weight: 700;
  color: var(--text-dark);
  font-size: 0.95rem;
}

.setting-desc {
  font-size: 0.8rem;
  color: var(--text-medium);
  font-weight: 400;
}

.language-selector {
  display: flex;
  gap: 0.5rem;
}

.about-section {
  background: var(--white) !important;
}

.about-info {
  font-size: 0.9rem;
  color: var(--text-medium);
}

.about-info p {
  margin: 0.4rem 0;
}

.about-info strong {
  color: var(--primary-yellow);
  font-weight: 700;
}

.description {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 2px solid var(--neutral-cream);
  font-size: 0.85rem;
  line-height: 1.6;
}

.settings-footer {
  flex-shrink: 0;
  animation: slideUp 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@media (max-width: 480px) {
  .settings {
    padding: 1rem 0.75rem;
    gap: 0.75rem;
  }

  .settings-title {
    font-size: 1.8rem;
  }

  .setting-item {
    padding: 0.5rem 0.6rem;
    gap: 0.75rem;
  }
}

@media (max-height: 700px) {
  .settings {
    padding: 0.75rem;
    gap: 0.5rem;
  }

  .settings-content {
    gap: 0.5rem;
  }

  .setting-item {
    padding: 0.4rem 0.5rem;
  }
}
</style>
