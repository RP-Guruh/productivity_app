<template>
  <div class="board-detail">
    <!-- Navbar Header -->
    <header class="app-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack" aria-label="Kembali ke Board Saya">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          <span class="back-text">Board Saya</span>
        </button>
        <span class="divider">/</span>
        <!-- Inline title editing -->
        <div v-if="isEditingName" class="board-name-edit">
          <input
            v-model="editedBoardName"
            class="board-name-input"
            @keydown.enter="saveBoardName"
            @keydown.esc="cancelEditName"
            ref="nameInputRef"
          />
          <button class="icon-btn save-btn" @click="saveBoardName" title="Simpan">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </button>
          <button class="icon-btn cancel-btn" @click="cancelEditName" title="Batal">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div v-else class="board-name-display">
          <h2 class="board-name">{{ board?.name }}</h2>
          <button class="icon-btn edit-btn" @click="startEditName" title="Edit nama board">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          </button>
          <button class="icon-btn delete-btn" @click="confirmDeleteBoard" title="Hapus board">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </button>
        </div>
      </div>
      <div class="header-right">
        <div class="user-menu" v-if="authStore.user">
          <router-link to="/profile" class="profile-link" title="Lihat Profil">
            <AppAvatar :name="authStore.user.name" size="sm" />
            <span class="header-username">{{ authStore.user.name }}</span>
          </router-link>
          <AppButton variant="danger" size="sm" @click="authStore.logout">
            Logout
          </AppButton>
        </div>
      </div>
    </header>

    <!-- Kanban Area -->
    <main class="kanban-container">
      <div class="kanban-columns-scroll">
        <!-- Loading skeleton -->
        <template v-if="boardStore.columnsLoading">
          <div v-for="i in 3" :key="'skel-'+i" class="column-skeleton">
            <div class="column-skeleton__header"></div>
            <div class="column-skeleton__card"></div>
            <div class="column-skeleton__card column-skeleton__card--short"></div>
          </div>
        </template>

        <!-- Empty State -->
        <template v-else-if="columns.length === 0">
          <div class="kanban-empty-state">
            <div class="kanban-empty-state__icon">📋</div>
            <h3 class="kanban-empty-state__title">Belum ada kolom</h3>
            <p class="kanban-empty-state__desc">Buat kolom pertamamu untuk mulai mengatur task.</p>
            <AppButton variant="primary" @click="openAddColumnModal">+ Tambah Kolom</AppButton>
          </div>
        </template>

        <!-- Columns list -->
        <template v-else>
          <BoardColumn
            v-for="col in columns"
            :key="col.id"
            :column="col"
            @add-task="openAddTaskModal"
            @edit-task="openEditTaskModal"
            @task-moved="handleTaskMoved"
          />

          <!-- Add Column dashed card -->
          <div class="add-column-card" @click="openAddColumnModal" role="button" tabindex="0" @keydown.enter="openAddColumnModal">
            <div class="add-column-card__content">
              <span class="add-column-card__icon">+</span>
              <span class="add-column-card__text">Tambah kolom</span>
            </div>
          </div>
        </template>
      </div>
    </main>

    <!-- Create/Edit Task Modal -->
    <TaskModal
      :is-open="isTaskModalOpen"
      :task="selectedTask"
      :is-edit="isEditTask"
      @close="closeTaskModal"
      @save="saveTask"
      @delete="deleteTask"
    />

    <!-- AI Assistant Modal -->
    <AiAssistantModal
      :is-open="isAiModalOpen"
      @close="closeAiModal"
      @add-tasks="addAiTasks"
    />

    <!-- Create Column Modal -->
    <AppModal :is-open="isColumnModalOpen" title="Tambah Kolom Baru" @close="closeColumnModal">
      <div class="modal-form">
        <AppInput
          label="Nama Kolom"
          v-model="newColumnName"
          placeholder="Contoh: Backlog, Peninjauan..."
        />
        <div class="form-group">
          <label class="form-label">Posisi</label>
          <input
            type="number"
            class="form-input"
            v-model.number="newColumnPosition"
            min="1"
            @keydown.enter="createColumn"
          />
        </div>
      </div>
      <template #footer>
        <AppButton variant="secondary" @click="closeColumnModal">Batal</AppButton>
        <AppButton variant="primary" :disabled="!newColumnName.trim() || !newColumnPosition" @click="createColumn">Tambah</AppButton>
      </template>
    </AppModal>

    <!-- Delete Board Confirmation Modal -->
    <AppModal :is-open="isDeleteModalOpen" title="Hapus Board" @close="closeDeleteModal">
      <div class="modal-form">
        <p style="color: var(--color-ink); font-family: 'Inter', sans-serif;">Apakah Anda yakin ingin menghapus board <strong>{{ board?.name }}</strong>? Semua data kolom dan task di dalamnya akan terhapus secara permanen.</p>
      </div>
      <template #footer>
        <AppButton variant="secondary" @click="closeDeleteModal">Batal</AppButton>
        <AppButton variant="danger" @click="deleteBoard">Hapus</AppButton>
      </template>
    </AppModal>

    <!-- Floating AI Assistant Button -->
    <AppButton class="ai-floating-button" variant="primary" @click="openAiModal">
      ✨ Bantu Susun Task
    </AppButton>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBoardStore } from '../store/boardStore'
import { useAuthStore } from '../store/authStore'
import AppButton from '../components/common/AppButton.vue'
import AppInput from '../components/common/AppInput.vue'
import AppModal from '../components/common/AppModal.vue'
import BoardColumn from '../components/board/BoardColumn.vue'
import TaskModal from '../components/board/TaskModal.vue'
import AiAssistantModal from '../components/board/AiAssistantModal.vue'
import AppAvatar from '../components/common/AppAvatar.vue'

const route = useRoute()
const router = useRouter()
const boardStore = useBoardStore()
const authStore = useAuthStore()

const boardId = computed(() => Number(route.params.id))
const board = computed(() => boardStore.getBoardById(boardId.value))
const columns = computed(() => boardStore.getColumnsByBoardId(boardId.value))

// Board title editing & delete state
const isEditingName = ref(false)
const editedBoardName = ref('')
const nameInputRef = ref(null)
const isDeleteModalOpen = ref(false)

const startEditName = () => {
  if (!board.value) return
  editedBoardName.value = board.value.name
  isEditingName.value = true
  nextTick(() => {
    nameInputRef.value?.focus()
  })
}

const cancelEditName = () => {
  isEditingName.value = false
}

const saveBoardName = async () => {
  if (!editedBoardName.value.trim() || editedBoardName.value === board.value.name) {
    isEditingName.value = false
    return
  }
  try {
    await boardStore.updateBoard(boardId.value, editedBoardName.value)
    isEditingName.value = false
  } catch (err) {
    alert('Gagal mengubah nama board: ' + err.message)
  }
}

const confirmDeleteBoard = () => {
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
}

const deleteBoard = async () => {
  try {
    await boardStore.deleteBoard(boardId.value)
    isDeleteModalOpen.value = false
    router.push('/')
  } catch (err) {
    alert('Gagal menghapus board: ' + err.message)
  }
}

// Modal triggers
const isTaskModalOpen = ref(false)
const selectedTask = ref(null)
const isEditTask = ref(false)
const targetColumnId = ref(null)

const isAiModalOpen = ref(false)

const isColumnModalOpen = ref(false)
const newColumnName = ref('')
const newColumnPosition = ref(1)

onMounted(async () => {
  if (boardStore.boards.length === 0) {
    await boardStore.fetchBoards()
  }
  if (!board.value) {
    router.push('/')
    return
  }
  // Fetch board lists (columns) from API
  await boardStore.fetchBoardLists(boardId.value)
})

const goBack = () => {
  router.push('/')
}

const openAddTaskModal = (columnId) => {
  targetColumnId.value = columnId
  selectedTask.value = null
  isEditTask.value = false
  isTaskModalOpen.value = true
}

const openEditTaskModal = (task) => {
  selectedTask.value = task
  isEditTask.value = true
  isTaskModalOpen.value = true
}

const closeTaskModal = () => {
  isTaskModalOpen.value = false
}

const saveTask = (taskData) => {
  if (isEditTask.value) {
    boardStore.updateTask(boardId.value, taskData.id, taskData)
  } else {
    boardStore.addTask(boardId.value, targetColumnId.value, taskData)
  }
  closeTaskModal()
}

const deleteTask = (taskId) => {
  boardStore.deleteTask(boardId.value, taskId)
  closeTaskModal()
}

const handleTaskMoved = () => {
  boardStore.updateBoardCounts(boardId.value)
}

const openAiModal = () => {
  isAiModalOpen.value = true
}

const closeAiModal = () => {
  isAiModalOpen.value = false
}

const addAiTasks = (taskTitles) => {
  // Add AI generated tasks to first column (usually Backlog)
  if (columns.value.length > 0) {
    const firstColId = columns.value[0].id
    taskTitles.forEach(title => {
      boardStore.addTask(boardId.value, firstColId, {
        title,
        description: 'Disusun secara otomatis oleh AI Assistant.',
        priority: 'sedang',
        dueDate: null
      })
    })
  }
}

const openAddColumnModal = () => {
  newColumnName.value = ''
  // Default posisi = jumlah kolom saat ini + 1
  const currentColumns = boardStore.getColumnsByBoardId(boardId.value)
  newColumnPosition.value = currentColumns.length > 0
    ? Math.max(...currentColumns.map(c => c.position || 0)) + 1
    : 1
  isColumnModalOpen.value = true
}

const closeColumnModal = () => {
  isColumnModalOpen.value = false
}

const createColumn = async () => {
  if (!newColumnName.value.trim() || !newColumnPosition.value) return
  try {
    await boardStore.addColumn(boardId.value, newColumnName.value, newColumnPosition.value)
    closeColumnModal()
  } catch (err) {
    alert('Gagal membuat kolom: ' + err.message)
  }
}
</script>

<style scoped>
.board-detail {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  background-color: var(--color-panel);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: var(--color-muted);
  font-family: 'Inter', sans-serif;
  font-size: var(--text-base);
  font-weight: 500;
  transition: color 150ms ease-out;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
}

.back-btn:hover {
  color: var(--color-ink);
  background-color: rgba(27, 31, 59, 0.05);
}

.divider {
  color: var(--color-border);
  font-size: var(--text-lg);
}

.board-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-ink);
}

/* AI button signature background */
.ai-button {
  background-color: var(--color-signal) !important;
  color: var(--color-panel) !important;
}

.ai-button:hover {
  background-color: #d14420 !important;
}

/* Kanban Area */
.kanban-container {
  flex-grow: 1;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 24px 32px;
  background-color: var(--color-paper);
}

.kanban-columns-scroll {
  display: flex;
  gap: 24px;
  height: 100%;
  align-items: flex-start;
}

/* Add Column card style */
.add-column-card {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  width: 300px;
  min-width: 300px;
  height: 150px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease-out;
}

.add-column-card:hover {
  border-color: var(--color-brand);
  background-color: rgba(62, 76, 138, 0.02);
}

.add-column-card__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.add-column-card__icon {
  font-size: 28px;
  color: var(--color-muted);
  line-height: 1;
}

.add-column-card__text {
  font-family: 'Inter', sans-serif;
  font-size: var(--text-sm);
  color: var(--color-muted);
  font-weight: 500;
}

.modal-form {
  padding: 8px 0;
}

.form-group {
  margin-top: 16px;
}

.form-label {
  display: block;
  font-family: 'Inter', sans-serif;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-ink);
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  font-family: 'Inter', sans-serif;
  font-size: var(--text-base);
  color: var(--color-ink);
  background-color: var(--color-paper);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  outline: none;
  transition: border-color 150ms ease-out, box-shadow 150ms ease-out;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: var(--color-brand);
  box-shadow: 0 0 0 3px rgba(62, 76, 138, 0.1);
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 12px;
  border-left: 1px solid var(--color-border);
  padding-left: 16px;
  margin-left: 16px;
}

.profile-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--color-ink);
  font-weight: 500;
  font-size: var(--text-sm);
  transition: opacity 150ms ease;
}

.profile-link:hover {
  opacity: 0.8;
}

.header-username {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'Inter', sans-serif;
}

.ai-floating-button {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 99;
  box-shadow: var(--shadow-md);
  border-radius: var(--radius-xl);
  padding: 12px 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.board-name-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.board-name-edit {
  display: flex;
  align-items: center;
  gap: 8px;
}

.board-name-input {
  font-family: 'Space Grotesk', sans-serif;
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-ink);
  background: transparent;
  border: 1px solid var(--color-brand);
  border-radius: var(--radius-sm);
  padding: 2px 8px;
  outline: none;
  width: 250px;
}

.icon-btn {
  background: none;
  border: none;
  padding: 4px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-muted);
  transition: all 150ms ease-out;
}

.icon-btn:hover {
  background-color: rgba(27, 31, 59, 0.05);
  color: var(--color-ink);
}

.delete-btn:hover {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.save-btn:hover {
  background-color: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

/* Column Loading Skeleton */
.column-skeleton {
  width: 300px;
  min-width: 300px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px;
  background-color: var(--color-paper);
}

.column-skeleton__header {
  height: 24px;
  width: 60%;
  background: linear-gradient(90deg, var(--color-border) 25%, rgba(255,255,255,0.15) 50%, var(--color-border) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm);
  margin-bottom: 20px;
}

.column-skeleton__card {
  height: 72px;
  width: 100%;
  background: linear-gradient(90deg, var(--color-border) 25%, rgba(255,255,255,0.15) 50%, var(--color-border) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-md);
  margin-bottom: 12px;
}

.column-skeleton__card--short {
  height: 56px;
  width: 80%;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Kanban Empty State */
.kanban-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 64px 32px;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.kanban-empty-state__icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.kanban-empty-state__title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-ink);
  margin-bottom: 8px;
}

.kanban-empty-state__desc {
  font-family: 'Inter', sans-serif;
  font-size: var(--text-base);
  color: var(--color-muted);
  margin-bottom: 24px;
  line-height: 1.5;
}
</style>
