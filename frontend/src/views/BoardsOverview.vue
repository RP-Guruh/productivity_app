<template>
  <div class="boards-overview">
    <!-- Navbar Header -->
    <header class="app-header">
      <div class="logo-container">
        <span class="logo-icon">🌊</span>
        <h1 class="logo-text">TaskFlow</h1>
      </div>
      
      <!-- Desktop Header Actions -->
      <div class="header-actions desktop-only">
        <ThemeToggle />
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

      <!-- Mobile Hamburger Button -->
      <button class="hamburger-btn mobile-only" @click="toggleMenu" :class="{ 'is-open': isMenuOpen }" aria-label="Menu">
        <span class="hamburger-bar"></span>
        <span class="hamburger-bar"></span>
        <span class="hamburger-bar"></span>
      </button>

      <!-- Mobile Menu Dropdown -->
      <div class="mobile-menu-dropdown" :class="{ 'is-open': isMenuOpen }">
        <div class="mobile-menu-content">
          <div class="mobile-user-info" v-if="authStore.user">
            <router-link to="/profile" class="profile-link" @click="isMenuOpen = false">
              <AppAvatar :name="authStore.user.name" size="sm" />
              <span class="header-username">{{ authStore.user.name }}</span>
            </router-link>
          </div>
          <div class="mobile-menu-item">
            <span class="mobile-menu-label">Tema</span>
            <ThemeToggle />
          </div>
          <AppButton variant="primary" style="width: 100%; margin-top: 8px;" @click="triggerCreateBoard">
            + Board Baru
          </AppButton>
          <AppButton variant="danger" style="width: 100%; margin-top: 12px;" @click="triggerLogout" v-if="authStore.user">
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
import ThemeToggle from '../components/common/ThemeToggle.vue'

const router = useRouter()
const boardStore = useBoardStore()
const authStore = useAuthStore()

const isCreateModalOpen = ref(false)
const newBoardName = ref('')
const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const triggerCreateBoard = () => {
  isMenuOpen.value = false
  openCreateBoardModal()
}

const triggerLogout = () => {
  isMenuOpen.value = false
  authStore.logout()
}

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

.mobile-only {
  display: none !important;
}

.hamburger-btn {
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 24px;
  height: 18px;
  cursor: pointer;
  z-index: 101;
  padding: 0;
}

.hamburger-bar {
  display: block;
  width: 100%;
  height: 2px;
  background-color: var(--color-ink);
  border-radius: 999px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hamburger-btn.is-open .hamburger-bar:nth-child(1) {
  transform: translateY(8px) rotate(45deg);
}

.hamburger-btn.is-open .hamburger-bar:nth-child(2) {
  opacity: 0;
}

.hamburger-btn.is-open .hamburger-bar:nth-child(3) {
  transform: translateY(-8px) rotate(-45deg);
}

.mobile-menu-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: var(--color-panel);
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.3s ease-in-out;
  z-index: 100;
}

.mobile-menu-dropdown.is-open {
  max-height: 350px;
}

.mobile-menu-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mobile-user-info {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 16px;
}

.mobile-menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Inter', sans-serif;
  font-size: var(--text-sm);
  color: var(--color-ink);
}

.mobile-menu-label {
  font-weight: 500;
}

@media (max-width: 768px) {
  .app-header {
    padding: 16px 20px;
    position: relative;
  }
  .desktop-only {
    display: none !important;
  }
  .mobile-only {
    display: flex !important;
  }
  .overview-content {
    padding: 24px 20px;
  }
}
</style>
