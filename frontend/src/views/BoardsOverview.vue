<template>
  <div class="boards-overview">
    <!-- Navbar Header -->
    <header class="app-header">
      <div class="logo-container">
        <span class="logo-icon">🌊</span>
        <h1 class="logo-text">TaskFlow</h1>
      </div>
      <div class="header-actions">
        <AppButton variant="primary" size="sm" @click="openCreateBoardModal">
          + Board Baru
        </AppButton>
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

    <!-- Main Content -->
    <main class="overview-content">
      <div class="section-header">
        <h2 class="section-title">Board Saya</h2>
      </div>

      <!-- Empty State -->
      <div v-if="boardStore.boards.length === 0" class="empty-state-wrapper">
        <EmptyState
          title="Belum ada board"
          description="Buat board pertamamu untuk mulai mengatur task dan alur kerjamu secara visual."
          action-label="+ Buat Board Baru"
          @action="openCreateBoardModal"
        />
      </div>

      <!-- Grid list -->
      <div v-else class="boards-grid">
        <BoardCard
          v-for="board in boardStore.boards"
          :key="board.id"
          :board="board"
          @select="navigateToBoard"
        />

        <!-- Dashed Add Board Button Card -->
        <div class="add-board-card" @click="openCreateBoardModal" role="button" tabindex="0" @keydown.enter="openCreateBoardModal">
          <div class="add-board-card__content">
            <span class="add-board-card__icon">+</span>
            <span class="add-board-card__text">Buat board baru</span>
          </div>
        </div>
      </div>
    </main>

    <!-- Create Board Modal -->
    <AppModal :is-open="isCreateModalOpen" title="Buat Board Baru" @close="closeCreateBoardModal">
      <div class="modal-form">
        <AppInput
          label="Nama Board"
          v-model="newBoardName"
          placeholder="Contoh: Rencana Desain Produk"
          @keydown.enter="createBoard"
          ref="boardNameInputRef"
        />
      </div>
      <template #footer>
        <AppButton variant="secondary" @click="closeCreateBoardModal">Batal</AppButton>
        <AppButton variant="primary" :disabled="!newBoardName.trim()" @click="createBoard">Buat</AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBoardStore } from '../store/boardStore'
import { useAuthStore } from '../store/authStore'
import AppButton from '../components/common/AppButton.vue'
import AppInput from '../components/common/AppInput.vue'
import AppModal from '../components/common/AppModal.vue'
import EmptyState from '../components/common/EmptyState.vue'
import BoardCard from '../components/board/BoardCard.vue'
import AppAvatar from '../components/common/AppAvatar.vue'

const router = useRouter()
const boardStore = useBoardStore()
const authStore = useAuthStore()

const isCreateModalOpen = ref(false)
const newBoardName = ref('')

onMounted(() => {
  boardStore.fetchBoards()
})

const openCreateBoardModal = () => {
  newBoardName.value = ''
  isCreateModalOpen.value = true
}

const closeCreateBoardModal = () => {
  isCreateModalOpen.value = false
}

const createBoard = async () => {
  if (!newBoardName.value.trim()) return
  try {
    const newId = await boardStore.addBoard(newBoardName.value)
    closeCreateBoardModal()
    router.push(`/board/${newId}`)
  } catch (err) {
    alert(err.message)
  }
}

const navigateToBoard = (id) => {
  router.push(`/board/${id}`)
}
</script>

<style scoped>
.boards-overview {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  background-color: var(--color-panel);
  border-bottom: 1px solid var(--color-border);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 24px;
}

.logo-text {
  font-family: 'Space Grotesk', sans-serif;
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-brand);
}

.overview-content {
  flex-grow: 1;
  padding: 40px 32px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.section-header {
  margin-bottom: 24px;
}

.section-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-ink);
}

.empty-state-wrapper {
  margin-top: 48px;
}

.boards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

/* Dashed Add Board Card style */
.add-board-card {
  background-color: transparent;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 140px;
  transition: all 150ms ease-out;
}

.add-board-card:hover {
  border-color: var(--color-brand);
  background-color: rgba(62, 76, 138, 0.02);
}

.add-board-card__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.add-board-card__icon {
  font-size: 32px;
  color: var(--color-muted);
  line-height: 1;
}

.add-board-card__text {
  font-family: 'Inter', sans-serif;
  font-size: var(--text-base);
  color: var(--color-muted);
  font-weight: 500;
}

.modal-form {
  padding: 8px 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 12px;
  border-left: 1px solid var(--color-border);
  padding-left: 16px;
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
</style>
