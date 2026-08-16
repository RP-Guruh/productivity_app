<template>
  <AppModal :is-open="isOpen" title="✨ AI Assistant" :size="currentState === 'results' ? 'large' : 'medium'" @close="close">
    <!-- State 1: Initial Prompt Input -->
    <div v-if="currentState === 'input'" class="ai-state-input">
      <p class="ai-instruction">
        Ceritakan proyek atau tujuan yang ingin kamu capai, dan AI akan membantu memecahkannya menjadi daftar task yang terstruktur pada board ini.
      </p>
      
      <!-- Prompt Textarea -->
      <textarea
        v-model="promptText"
        class="ai-textarea"
        placeholder="Contoh: Rencana rilis aplikasi baru akhir bulan ini..."
        ref="promptInputRef"
      ></textarea>

      <!-- Suggested Prompts Chips -->
      <div class="suggested-prompts-container">
        <span class="suggested-prompts-label">Saran Prompt:</span>
        <div class="suggested-prompts-grid">
          <button 
            v-for="(prompt, idx) in suggestedPrompts" 
            :key="idx" 
            class="prompt-chip"
            @click="selectSuggestedPrompt(prompt)"
          >
            {{ prompt }}
          </button>
        </div>
      </div>

      <div class="ai-actions">
        <AppButton variant="secondary" @click="close">
          Batal
        </AppButton>
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

    <!-- State 3: Results checklist & preview -->
    <div v-else-if="currentState === 'results'" class="ai-state-results">
      <p class="ai-instruction">
        Berikut adalah saran struktur dari AI. Anda dapat mencentang, mengedit teks, dan menyesuaikan kolom/tugas sebelum menyimpannya ke board.
      </p>

      <div class="ai-summary-card">
        <div class="ai-summary-header">
          <span class="ai-sparkle-icon">✨</span>
          <strong>Rencana dari AI:</strong>
        </div>
        <p class="ai-summary-text">"{{ intentSummary }}"</p>
      </div>

      <!-- Scenario A: AI returns Board Lists (nested structure) -->
      <div v-if="suggestedBoardLists.length > 0" class="suggested-columns-list">
        <div 
          v-for="(list, listIdx) in suggestedBoardLists" 
          :key="listIdx" 
          class="suggested-column-card"
        >
          <div class="column-header-row">
            <label class="checkbox-container">
              <input type="checkbox" v-model="list.checked" />
              <span class="checkmark"></span>
            </label>
            <input 
              type="text" 
              v-model="list.name" 
              class="column-title-input" 
              placeholder="Nama Kolom..."
            />
            <span v-if="isColumnExisting(list.name)" class="column-type-badge existing">
              Kolom Terdeteksi
            </span>
            <span v-else class="column-type-badge new">
              Kolom Baru
            </span>
          </div>

          <!-- Tasks list within column -->
          <div class="column-tasks-preview" v-if="list.checked">
            <div 
              v-for="(task, taskIdx) in list.tasks" 
              :key="taskIdx" 
              class="task-preview-item-detailed"
            >
              <div class="task-item-checkbox-wrapper">
                <label class="checkbox-container">
                  <input type="checkbox" v-model="task.checked" />
                  <span class="checkmark"></span>
                </label>
              </div>
              <div class="task-item-details-wrapper" :class="{ 'task-disabled': !task.checked }">
                <!-- Title & Meta Inputs Row -->
                <div class="task-item-header">
                  <input 
                    type="text" 
                    v-model="task.title" 
                    class="task-detail-title-input" 
                    placeholder="Judul Tugas..."
                    :disabled="!task.checked"
                  />
                  
                  <div class="task-item-controls">
                    <!-- Priority Selector -->
                    <select 
                      v-model="task.priority" 
                      class="task-detail-priority-select"
                      :disabled="!task.checked"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                    </select>

                    <!-- Due Date Input -->
                    <input 
                      type="date" 
                      v-model="task.dueDate" 
                      class="task-detail-date-input"
                      :disabled="!task.checked"
                    />
                  </div>
                </div>

                <!-- Description Area -->
                <div class="task-item-description">
                  <textarea 
                    v-model="task.description" 
                    class="task-detail-desc-input" 
                    placeholder="Tambah deskripsi tugas..."
                    rows="2"
                    :disabled="!task.checked"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      <div class="results-actions">
        <AppButton variant="secondary" @click="resetToInput">Ulangi</AppButton>
        <AppButton
          variant="primary"
          :disabled="!hasCheckedSuggestions"
          @click="applyAiPlan"
        >
          Terapkan Rencana
        </AppButton>
      </div>
    </div>

    <!-- State 4: Saving progress -->
    <div v-else-if="currentState === 'saving'" class="ai-state-loading">
      <div class="saving-spinner"></div>
      <p class="loading-text">Sedang menyimpan tugas ke board...</p>
    </div>
  </AppModal>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import AppModal from '../common/AppModal.vue'
import AppButton from '../common/AppButton.vue'
import SkeletonCard from '../common/SkeletonCard.vue'
import { useBoardStore } from '../../store/boardStore'
import { useAuthStore } from '../../store/authStore'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  boardId: {
    type: Number,
    required: true
  },
  boardName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])

const boardStore = useBoardStore()
const authStore = useAuthStore()

const currentState = ref('input') // 'input' | 'loading' | 'results' | 'saving'
const promptText = ref('')
const errorMessage = ref('')
const intentSummary = ref('')
const suggestedBoardLists = ref([])
const promptInputRef = ref(null)

const existingColumns = computed(() => boardStore.getColumnsByBoardId(props.boardId))

const suggestedPrompts = [
  "🚀 Rencana rilis aplikasi baru akhir bulan",
  "🎨 Desain ulang Landing Page bertema modern",
  "📝 Rencana konten pemasaran media sosial bulanan",
  "💻 Setup alur kerja DevOps CI/CD & Cloud Hosting",
  "📚 Persiapan ujian sertifikasi IT"
]

watch(() => props.isOpen, (open) => {
  if (open) {
    currentState.value = 'input'
    promptText.value = ''
    suggestedBoardLists.value = []
    suggestedTasks.value = []
    nextTick(() => {
      if (promptInputRef.value) {
        promptInputRef.value.focus()
      }
    })
  }
})

const selectSuggestedPrompt = (prompt) => {
  promptText.value = prompt
}

const isColumnExisting = (name) => {
  if (!name) return false
  return existingColumns.value.some(
    c => c.name.trim().toLowerCase() === name.trim().toLowerCase()
  )
}

const hasCheckedSuggestions = computed(() => {
  return suggestedBoardLists.value.some(l => l.checked)
})

const generateTasks = async () => {
  if (!promptText.value.trim()) return
  currentState.value = 'loading'
  errorMessage.value = ''

  try {
    const response = await fetch('/api/ai/tasks/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: promptText.value,
        boardId: props.boardId,
        boardName: props.boardName
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || 'Gagal memproses permintaan AI')
    }

    const data = await response.json()
    
    intentSummary.value = data.intentSummary || 'Rencana Rilis AI'
    
    if (data.boardLists && data.boardLists.length > 0) {
      suggestedBoardLists.value = data.boardLists.map(list => ({
        name: list.name,
        description: list.description || '',
        checked: true,
        tasks: (list.tasks || []).map(task => ({
          title: task.title,
          description: task.description || '',
          priority: task.priority || 'MEDIUM',
          dueDate: task.dueDate || null,
          checked: true
        }))
      }))
    } else if (data.tasks && data.tasks.length > 0) {
      suggestedBoardLists.value = [{
        name: 'Rekomendasi AI',
        description: 'Tugas yang disarankan oleh AI',
        checked: true,
        tasks: data.tasks.map(task => ({
          title: task.title,
          description: task.description || '',
          priority: task.priority || 'MEDIUM',
          dueDate: task.dueDate || null,
          checked: true
        }))
      }]
    } else {
      throw new Error('AI tidak mengembalikan daftar kolom maupun tugas. Silakan coba prompt lain.')
    }
    
    currentState.value = 'results'
  } catch (err) {
    console.error(err)
    alert(err.message || 'Terjadi kesalahan saat menghubungi AI.')
    currentState.value = 'input'
  }
}

const resetToInput = () => {
  currentState.value = 'input'
  errorMessage.value = ''
  suggestedBoardLists.value = []
}

const applyAiPlan = async () => {
  currentState.value = 'saving'
  try {
    let currentPos = existingColumns.value.length > 0
      ? Math.max(...existingColumns.value.map(c => c.position || 0)) + 1
      : 1

    if (suggestedBoardLists.value.length > 0) {
      for (const list of suggestedBoardLists.value) {
        if (!list.checked) continue
        
        const existingCol = existingColumns.value.find(
          c => c.name.trim().toLowerCase() === list.name.trim().toLowerCase()
        )
        
        let colId
        if (existingCol) {
          colId = existingCol.id
        } else {
          const newCol = await boardStore.addColumn(props.boardId, list.name, currentPos)
          currentPos++
          if (newCol && newCol.id) {
            colId = newCol.id
          }
        }
        
        if (colId) {
          for (const task of list.tasks) {
            if (!task.checked) continue
            await boardStore.addTask(props.boardId, colId, {
              title: task.title,
              description: task.description,
              priority: task.priority,
              dueDate: task.dueDate
            })
          }
        }
      }
    }

    await boardStore.fetchBoardLists(props.boardId)
    close()
  } catch (err) {
    console.error(err)
    alert('Gagal menerapkan rencana AI: ' + err.message)
    currentState.value = 'results'
  }
}

const close = () => {
  emit('close')
}
</script>

<style scoped>
:deep(.modal-container) {
  max-height: 85vh;
}

.ai-instruction {
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: 1.5;
  margin-bottom: 16px;
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
  outline: none;
  transition: border-color 0.2s ease;
}

.ai-textarea:focus {
  border-color: var(--color-brand);
}

/* Suggested Prompts */
.suggested-prompts-container {
  margin-bottom: 24px;
}

.suggested-prompts-label {
  display: block;
  font-family: 'Inter', sans-serif;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-muted);
  margin-bottom: 8px;
}

.suggested-prompts-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.prompt-chip {
  font-family: 'Inter', sans-serif;
  font-size: var(--text-xs);
  color: var(--color-ink);
  background-color: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 6px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.prompt-chip:hover {
  border-color: var(--color-brand);
  background-color: rgba(62, 76, 138, 0.05);
}

.ai-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.ai-generate-btn {
  background-color: var(--color-signal) !important;
  color: #FFFFFF !important;
}

.ai-generate-btn:hover:not(:disabled) {
  background-color: #d14420 !important;
}

/* Loading State */
.ai-state-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  margin-bottom: 20px;
}

.saving-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-brand);
  border-radius: 50%;
  animation: spin 1s infinite linear;
  margin-bottom: 20px;
}

.loading-text {
  font-family: 'Inter', sans-serif;
  font-size: var(--text-sm);
  color: var(--color-ink);
  font-weight: 500;
  text-align: center;
}

/* Results state styling */
.ai-summary-card {
  background-color: rgba(62, 76, 138, 0.03);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  margin-bottom: 20px;
}

.ai-summary-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--text-sm);
  color: var(--color-brand);
  margin-bottom: 4px;
}

.ai-summary-text {
  font-size: var(--text-sm);
  color: var(--color-ink);
  font-style: italic;
}

.suggested-columns-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
  width: 100%;
}

.suggested-column-card {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background-color: var(--color-paper);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: visible;
  transition: border-color 0.2s ease;
}

.suggested-column-card:hover {
  border-color: var(--color-brand);
}

.column-header-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background-color: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid var(--color-border);
}

.column-title-input {
  font-family: 'Inter', sans-serif;
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--color-ink);
  background: transparent;
  border: none;
  flex-grow: 1;
  outline: none;
  border-bottom: 2px solid transparent;
  transition: border-color 0.2s ease;
}

.column-title-input:focus {
  border-bottom-color: var(--color-brand);
}

.column-type-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 100px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.column-type-badge.new {
  background-color: rgba(62, 76, 138, 0.1);
  color: var(--color-brand);
  border: 1px solid rgba(62, 76, 138, 0.2);
}

.column-type-badge.existing {
  background-color: rgba(40, 167, 69, 0.1);
  color: #28a745;
  border: 1px solid rgba(40, 167, 69, 0.2);
}

.column-tasks-preview {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: rgba(0, 0, 0, 0.01);
  overflow: visible;
}

.task-preview-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px dashed var(--color-border);
}

.task-preview-item:last-child {
  border-bottom: none;
}

.task-preview-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.task-title-input {
  font-family: 'Inter', sans-serif;
  font-size: var(--text-sm);
  color: var(--color-ink);
  background: transparent;
  border: none;
  outline: none;
  width: 100%;
}

.task-title-input:focus {
  border-bottom: 1px solid var(--color-brand);
}

.task-preview-meta {
  display: flex;
  gap: 8px;
}

.priority-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}

.priority-badge.low {
  background-color: rgba(0, 123, 255, 0.1);
  color: #007bff;
}

.priority-badge.medium {
  background-color: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.priority-badge.high {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.due-date-badge {
  font-size: 10px;
  color: var(--color-muted);
}

/* Flat tasks state styling */
.suggested-flat-tasks {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.target-column-selector-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.selector-label {
  font-family: 'Inter', sans-serif;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-muted);
}

.column-select-dropdown {
  font-family: 'Inter', sans-serif;
  font-size: var(--text-sm);
  color: var(--color-ink);
  background-color: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  outline: none;
  cursor: pointer;
}

.flat-tasks-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 280px;
  overflow-y: auto;
  padding: 4px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: rgba(0, 0, 0, 0.01);
}

.task-preview-item.flat {
  padding: 10px 12px;
  background-color: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.results-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Checkbox Styling */
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
  transition: all 0.2s ease;
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Detailed Task Preview UI */
.task-preview-item-detailed {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 18px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-panel);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
}

.task-preview-item-detailed:hover:not(.task-disabled) {
  border-color: var(--color-brand);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.task-item-checkbox-wrapper {
  padding-top: 4px;
}

.task-item-details-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.task-disabled {
  opacity: 0.4;
}

.task-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.task-detail-title-input {
  font-family: 'Inter', sans-serif;
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-ink);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  outline: none;
  flex-grow: 1;
  min-width: 250px;
  padding: 4px 0;
  transition: border-color 0.2s;
}

.task-detail-title-input:focus:not(:disabled) {
  border-bottom-color: var(--color-brand);
}

.task-item-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task-detail-priority-select {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background-color: var(--color-paper);
  color: var(--color-ink);
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}

.task-detail-date-input {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  padding: 5px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background-color: var(--color-paper);
  color: var(--color-ink);
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}

.task-detail-desc-input {
  font-family: 'Inter', sans-serif;
  font-size: var(--text-sm);
  color: var(--color-muted);
  background-color: rgba(0, 0, 0, 0.02);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-sm);
  resize: vertical;
  outline: none;
  width: 100%;
  padding: 10px 14px;
  min-height: 54px;
  transition: all 0.2s ease;
}

.task-detail-desc-input:focus:not(:disabled) {
  border-style: solid;
  border-color: var(--color-brand);
  background-color: var(--color-paper);
  color: var(--color-ink);
}

@media (max-width: 768px) {
  .task-item-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .task-item-controls {
    justify-content: space-between;
  }
  
  .task-detail-title-input {
    min-width: 100%;
  }
}
</style>
