<template>
  <AppModal :is-open="isOpen" title="✨ AI Assistant" @close="close">
    <!-- State 1: Initial Prompt Input -->
    <div v-if="currentState === 'input'" class="ai-state-input">
      <p class="ai-instruction">
        Ceritakan proyek atau tujuan yang ingin kamu capai, dan AI akan membantu memecahkannya menjadi daftar task yang terstruktur.
      </p>
      <textarea
        v-model="promptText"
        class="ai-textarea"
        placeholder="Contoh: Saya ingin merilis website portofolio baru akhir bulan ini..."
        ref="promptInputRef"
      ></textarea>
      <div class="ai-actions">
        <AppButton
          variant="primary"
          :disabled="!promptText.trim()"
          @click="generateTasks"
          class="ai-generate-btn"
        >
          ✨ Susun Task untuk Saya
        </AppButton>
      </div>
    </div>

    <!-- State 2: Loading state -->
    <div v-else-if="currentState === 'loading'" class="ai-state-loading">
      <div class="skeleton-list">
        <SkeletonCard v-for="i in 3" :key="i" />
      </div>
      <p class="loading-text">Menyusun task untuk kamu...</p>
    </div>

    <!-- State 3: Results checklist -->
    <div v-else-if="currentState === 'results'" class="ai-state-results">
      <p class="ai-instruction">
        Berikut adalah saran task dari AI. Centang task yang ingin kamu tambahkan ke board, dan kamu bisa mengedit judulnya langsung jika perlu.
      </p>

      <div class="suggestion-list">
        <div
          v-for="(item, index) in suggestions"
          :key="index"
          :class="['suggestion-item', { 'is-checked': item.checked }]"
        >
          <label class="checkbox-container">
            <input type="checkbox" v-model="item.checked" />
            <span class="checkmark"></span>
          </label>
          <input
            type="text"
            v-model="item.title"
            class="suggestion-input"
            placeholder="Judul task..."
          />
        </div>
      </div>

      <div class="results-actions">
        <AppButton variant="secondary" @click="resetToInput">Ulangi</AppButton>
        <AppButton
          variant="primary"
          :disabled="!hasCheckedSuggestions"
          @click="addTasksToBoard"
        >
          Tambahkan ke Board ({{ checkedCount }})
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import AppModal from '../common/AppModal.vue'
import AppButton from '../common/AppButton.vue'
import SkeletonCard from '../common/SkeletonCard.vue'
import { mockAiSuggestions } from '../../mock/mockData'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close', 'add-tasks'])

const currentState = ref('input') // 'input' | 'loading' | 'results'
const promptText = ref('')
const suggestions = ref([])
const promptInputRef = ref(null)

watch(() => props.isOpen, (open) => {
  if (open) {
    currentState.value = 'input'
    promptText.value = ''
    suggestions.value = []
    nextTick(() => {
      if (promptInputRef.value) {
        promptInputRef.value.focus()
      }
    })
  }
})

const checkedCount = computed(() => {
  return suggestions.value.filter(s => s.checked).length
})

const hasCheckedSuggestions = computed(() => {
  return checkedCount.value > 0
})

const generateTasks = () => {
  if (!promptText.value.trim()) return
  currentState.value = 'loading'
  
  // Simulate AI response delay
  setTimeout(() => {
    suggestions.value = mockAiSuggestions.map(title => ({
      title,
      checked: true
    }))
    currentState.value = 'results'
  }, 2000)
}

const resetToInput = () => {
  currentState.value = 'input'
  suggestions.value = []
}

const addTasksToBoard = () => {
  const selectedTasks = suggestions.value
    .filter(s => s.checked && s.title.trim())
    .map(s => s.title)
  
  if (selectedTasks.length > 0) {
    emit('add-tasks', selectedTasks)
  }
  close()
}

const close = () => {
  emit('close')
}
</script>

<style scoped>
.ai-instruction {
  font-size: var(--text-base);
  color: var(--color-muted);
  line-height: 22px;
  margin-bottom: 20px;
}

.ai-textarea {
  font-family: 'Inter', sans-serif;
  font-size: var(--text-base);
  color: var(--color-ink);
  background-color: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 14px;
  width: 100%;
  min-height: 120px;
  resize: vertical;
  margin-bottom: 20px;
}

.ai-textarea:focus {
  outline: none;
  border-color: var(--color-brand);
}

.ai-actions {
  display: flex;
  justify-content: flex-end;
}

.ai-generate-btn {
  background-color: var(--color-signal) !important;
  color: var(--color-panel) !important;
}

.ai-generate-btn:hover {
  background-color: #d14420 !important;
}

/* Loading State */
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.loading-text {
  text-align: center;
  font-family: 'IBM Plex Mono', monospace;
  font-size: var(--text-sm);
  color: var(--color-muted);
  animation: pulse 1.5s infinite ease-in-out;
}

/* Suggestions State */
.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 24px;
  padding: 4px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  transition: all 150ms ease-out;
}

.suggestion-item.is-checked {
  border-color: var(--color-brand);
  background-color: rgba(62, 76, 138, 0.02);
}

/* Custom Checkbox */
.checkbox-container {
  display: block;
  position: relative;
  width: 18px;
  height: 18px;
  cursor: pointer;
  user-select: none;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 18px;
  width: 18px;
  background-color: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  transition: all 150ms ease-out;
}

.checkbox-container:hover input ~ .checkmark {
  border-color: var(--color-brand);
}

.checkbox-container input:checked ~ .checkmark {
  background-color: var(--color-brand);
  border-color: var(--color-brand);
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-container .checkmark:after {
  left: 6px;
  top: 2px;
  width: 4px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.suggestion-input {
  border: none;
  background: none;
  font-family: 'Inter', sans-serif;
  font-size: var(--text-base);
  color: var(--color-ink);
  flex-grow: 1;
  padding: 2px 0;
}

.suggestion-input:focus {
  outline: none;
  border-bottom: 1px solid var(--color-brand);
}

.results-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}
</style>
