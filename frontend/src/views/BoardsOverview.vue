<template>
  <div class="dashboard-layout">
    <!-- Sidebar (Drawer on mobile) -->
    <aside class="app-sidebar" :class="{ 'is-open': isSidebarOpen, 'is-collapsed': isSidebarCollapsed }">
      <div class="sidebar-header">
        <div class="logo-container">
          <span class="logo-icon">🌊</span>
          <h1 class="logo-text" v-show="!isSidebarCollapsed">TaskFlow AI</h1>
        </div>
        <button class="sidebar-collapse-btn desktop-only" @click="isSidebarCollapsed = !isSidebarCollapsed" :title="isSidebarCollapsed ? 'Buka Sidebar' : 'Persempit Sidebar'">
          <svg v-if="isSidebarCollapsed" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg>
        </button>
        <button class="sidebar-close-btn mobile-only" @click="isSidebarOpen = false" aria-label="Tutup Menu">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <!-- User Profile Card -->
      <div class="sidebar-user" v-if="authStore.user" :title="isSidebarCollapsed ? authStore.user.name : ''">
        <AppAvatar :name="authStore.user.name" size="md" />
        <div class="user-info" v-show="!isSidebarCollapsed">
          <h4 class="user-name">{{ authStore.user.name }}</h4>
          <span class="user-role">Productivity Pro</span>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="sidebar-nav">
        <button 
          v-for="item in menuItems" 
          :key="item.id" 
          :class="['nav-item', { 'is-active': currentMenu === item.id }]"
          @click="selectMenu(item.id)"
          :title="isSidebarCollapsed ? item.label : ''"
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <span class="nav-label" v-show="!isSidebarCollapsed">{{ item.label }}</span>
          <span v-if="item.badge && !isSidebarCollapsed" class="nav-badge">{{ item.badge }}</span>
        </button>
      </nav>

      <!-- Sidebar Footer -->
      <div class="sidebar-footer">
        <div class="footer-row" v-show="!isSidebarCollapsed">
          <span class="footer-label">Tema</span>
          <ThemeToggle />
        </div>
        <button class="logout-btn" @click="authStore.logout" :title="isSidebarCollapsed ? 'Logout' : ''">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :style="!isSidebarCollapsed ? { marginRight: '8px' } : {}"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          <span v-show="!isSidebarCollapsed">Logout</span>
        </button>
      </div>
    </aside>

    <!-- Overlay when sidebar is open on mobile -->
    <div class="sidebar-overlay" v-if="isSidebarOpen" @click="isSidebarOpen = false"></div>

    <!-- Main Content Area -->
    <div class="main-container">
      <header class="main-header">
        <div class="header-left">
          <button class="hamburger-btn mobile-only" @click="isSidebarOpen = true" aria-label="Buka Menu">
            <span class="hamburger-bar"></span>
            <span class="hamburger-bar"></span>
            <span class="hamburger-bar"></span>
          </button>
          <h2 class="page-title">{{ currentMenuLabel }}</h2>
        </div>
        <div class="header-right" v-if="currentMenu === 'tasks'">
          <AppButton variant="primary" size="sm" @click="openCreateBoardModal">
            + Board Baru
          </AppButton>
        </div>
      </header>

      <main :class="['main-content', { 'no-padding-scroll': currentMenu === 'notes' || currentMenu === 'rss' }]">
        <!-- ================= TASK MANAGEMENT MODULE ================= -->
        <div v-if="currentMenu === 'tasks'" class="module-container animate-fade-in">
          <div class="section-desc-row">
            <p class="section-subtitle">Kelola project, task, dan alur kerja visual Anda dengan Kanban Board.</p>
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
        </div>

        <!-- ================= QUICK NOTES MODULE ================= -->
        <div v-else-if="currentMenu === 'notes'" class="module-container-full animate-fade-in">
          <QuickNotes ref="quickNotesRef" />
        </div>

        <!-- ================= RSS FEED MODULE ================= -->
        <div v-else-if="currentMenu === 'rss'" class="module-container-full animate-fade-in">
          <RssFeed @save-to-notes="handleSaveRssToNotes" />
        </div>

        <!-- ================= MOCK SETTINGS MODULE ================= -->
        <div v-else-if="currentMenu === 'settings'" class="module-container animate-fade-in">
          <div class="settings-module">
            <div class="settings-card">
              <h4 class="settings-section-title">Profil Pengguna</h4>
              <div class="settings-form">
                <AppInput label="Nama Lengkap" :model-value="authStore.user ? authStore.user.name : ''" disabled style="margin-bottom: 16px;" />
                <AppInput label="Alamat Email" :model-value="authStore.user ? authStore.user.email : ''" disabled />
              </div>
            </div>
            <div class="settings-card">
              <h4 class="settings-section-title">Preferensi Sistem</h4>
              <div class="settings-option">
                <div class="option-info">
                  <h5 class="option-title">Notifikasi Email</h5>
                  <p class="option-desc">Kirim email ringkasan task mingguan ke inbox Anda.</p>
                </div>
                <label class="switch-container">
                  <input type="checkbox" class="option-toggle" checked />
                  <span class="switch-slider"></span>
                </label>
              </div>
              <div class="settings-option">
                <div class="option-info">
                  <h5 class="option-title">Asisten AI Proaktif</h5>
                  <p class="option-desc">Ijinkan AI memberikan saran penataan task secara otomatis.</p>
                </div>
                <label class="switch-container">
                  <input type="checkbox" class="option-toggle" checked />
                  <span class="switch-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Create Board Modal -->
    <AppModal :is-open="isCreateModalOpen" title="Buat Board Baru" @close="closeCreateBoardModal">
      <div class="modal-form">
        <AppInput
          label="Nama Board"
          v-model="newBoardName"
          placeholder="Contoh: Rencana Desain Produk"
          @keydown.enter="createBoard"
          ref="boardNameInputRef"
          :disabled="isCreatingBoard"
        />
      </div>
      <template #footer>
        <AppButton variant="secondary" :disabled="isCreatingBoard" @click="closeCreateBoardModal">Batal</AppButton>
        <AppButton variant="primary" :disabled="!newBoardName.trim() || isCreatingBoard" @click="createBoard">
          {{ isCreatingBoard ? 'Membuat...' : 'Buat' }}
        </AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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
import QuickNotes from '../components/dashboard/QuickNotes.vue'
import RssFeed from '../components/dashboard/RssFeed.vue'

const router = useRouter()
const boardStore = useBoardStore()
const authStore = useAuthStore()

const isCreateModalOpen = ref(false)
const newBoardName = ref('')
const isCreatingBoard = ref(false)
const isSidebarOpen = ref(false)
const isSidebarCollapsed = ref(false)
const currentMenu = ref('tasks')

const quickNotesRef = ref(null)

const handleSaveRssToNotes = (noteData) => {
  const localNotesData = localStorage.getItem('taskflow_quick_notes')
  let notesList = []
  if (localNotesData) {
    try {
      notesList = JSON.parse(localNotesData)
    } catch (e) {
      notesList = []
    }
  }
  
  const now = new Date()
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  const newNote = {
    id: 'n_' + Date.now(),
    title: noteData.title,
    content: noteData.content,
    tags: noteData.tags || ['RSS'],
    color: '#2F7A5D', // Mint Green for copied feeds
    updatedAt: dateStr
  }
  
  notesList.unshift(newNote)
  localStorage.setItem('taskflow_quick_notes', JSON.stringify(notesList))
  
  if (quickNotesRef.value) {
    quickNotesRef.value.addNoteExternally(noteData.title, noteData.content, noteData.tags)
  }
}

const menuItems = [
  { id: 'tasks', label: 'Task Management', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>' },
  { id: 'notes', label: 'Quick Notes', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>' },
  { id: 'rss', label: 'RSS Feed Reader', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a9 9 0 0 1 9 9"></path><path d="M4 4a16 16 0 0 1 16 16"></path><circle cx="5" cy="19" r="1"></circle></svg>' },
  { id: 'settings', label: 'Pengaturan', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>' }
]

const currentMenuLabel = computed(() => {
  return menuItems.find(item => item.id === currentMenu.value)?.label || 'Productivity App'
})

const selectMenu = (menuId) => {
  currentMenu.value = menuId
  isSidebarOpen.value = false
}

// Boards Logic
onMounted(() => {
  boardStore.fetchBoards()
})

const openCreateBoardModal = () => {
  newBoardName.value = ''
  isCreateModalOpen.value = true
  isCreatingBoard.value = false
}

const closeCreateBoardModal = () => {
  if (isCreatingBoard.value) return
  isCreateModalOpen.value = false
}

const createBoard = async () => {
  if (!newBoardName.value.trim() || isCreatingBoard.value) return
  isCreatingBoard.value = true
  try {
    const newId = await boardStore.addBoard(newBoardName.value)
    closeCreateBoardModal()
    router.push(`/board/${newId}`)
  } catch (err) {
    alert(err.message)
  } finally {
    isCreatingBoard.value = false
  }
}

const navigateToBoard = (id) => {
  router.push(`/board/${id}`)
}
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: var(--color-paper);
}

/* App Sidebar Styling */
.app-sidebar {
  width: 280px;
  min-width: 280px;
  background-color: var(--color-panel);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px;
  z-index: 100;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Sidebar Collapse Button */
.sidebar-collapse-btn {
  background: none;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
  padding: 6px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease;
}

.sidebar-collapse-btn:hover {
  background-color: rgba(62, 76, 138, 0.05);
  color: var(--color-ink);
}

/* Collapsed Sidebar overrides */
.app-sidebar.is-collapsed {
  width: 80px;
  min-width: 80px;
  padding: 24px 12px;
}

.app-sidebar.is-collapsed .sidebar-header {
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
  align-items: center;
  justify-content: center;
}

.app-sidebar.is-collapsed .sidebar-user {
  padding: 8px;
  justify-content: center;
  margin-bottom: 16px;
}

.app-sidebar.is-collapsed .nav-item {
  padding: 12px;
  justify-content: center;
  gap: 0;
}

.app-sidebar.is-collapsed .sidebar-footer {
  align-items: center;
  padding-top: 12px;
}

.app-sidebar.is-collapsed .logout-btn {
  justify-content: center;
  padding: 10px;
  width: 100%;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
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
  font-size: 20px;
  font-weight: 700;
  color: var(--color-brand);
}

.sidebar-close-btn {
  background: none;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background-color: var(--color-paper);
  border-radius: var(--radius-lg);
  margin-bottom: 24px;
  border: 1px solid var(--color-border);
}

.user-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-name {
  font-family: 'Inter', sans-serif;
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-grow: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: var(--text-base);
  color: var(--color-muted);
  font-weight: 500;
  transition: all 200ms ease;
  text-align: left;
}

.nav-item:hover {
  color: var(--color-ink);
  background-color: rgba(62, 76, 138, 0.05);
}

.nav-item.is-active {
  color: #FFFFFF !important;
  background-color: var(--color-brand);
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-label {
  flex-grow: 1;
}

.nav-badge {
  font-size: 10px;
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 700;
  color: #FFFFFF;
  background-color: var(--color-signal);
  padding: 2px 6px;
  border-radius: 999px;
  line-height: 1;
}

.sidebar-footer {
  margin-top: auto;
  border-top: 1px solid var(--color-border);
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer-label {
  font-size: var(--text-sm);
  color: var(--color-muted);
  font-weight: 500;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 10px;
  border: 1px solid var(--color-border);
  background-color: transparent;
  color: var(--color-signal);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: var(--text-sm);
  font-weight: 600;
  transition: all 150ms ease-out;
}

.logout-btn:hover {
  background-color: rgba(232, 86, 47, 0.05);
  border-color: var(--color-signal);
}

/* Sidebar Overlay on mobile */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 99;
  backdrop-filter: blur(2px);
}

/* Main Container Area */
.main-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.main-header {
  height: 70px;
  background-color: var(--color-panel);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-ink);
}

.main-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 32px;
  background-color: var(--color-paper);
}

.module-container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  height: 100%;
}

.section-desc-row {
  margin-bottom: 24px;
}

.section-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: var(--text-base);
  color: var(--color-muted);
}

/* Boards Grid layout */
.boards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

/* Add Board Card */
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
  transition: all 200ms ease;
}

.add-board-card:hover {
  border-color: var(--color-brand);
  background-color: rgba(62, 76, 138, 0.03);
  transform: translateY(-2px);
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

.empty-state-wrapper {
  margin-top: 48px;
}

/* Hamburger button */
.hamburger-btn {
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 24px;
  height: 18px;
  cursor: pointer;
  padding: 0;
}

.hamburger-bar {
  display: block;
  width: 100%;
  height: 2px;
  background-color: var(--color-ink);
  border-radius: 999px;
  transition: all 0.3s ease;
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 350ms cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Removed calendar, habits, and coach styles */

/* Settings Styles */
.settings-module {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-card {
  background-color: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-card);
}

.settings-section-title {
  font-size: var(--text-md);
  font-weight: 700;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 12px;
  margin-bottom: 20px;
}

.settings-form {
  max-width: 480px;
  display: flex;
  flex-direction: column;
}

.settings-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--color-paper);
}

.settings-option:last-child {
  border-bottom: none;
}

.option-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.option-title {
  font-size: var(--text-base);
  font-weight: 600;
}

.option-desc {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

/* Toggle Switch Styles */
.switch-container {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch-container input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: var(--color-border);
  transition: .3s;
  border-radius: 24px;
}

.switch-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .3s;
  border-radius: 50%;
}

input:checked + .switch-slider {
  background-color: var(--color-brand);
}

input:checked + .switch-slider:before {
  transform: translateX(20px);
}

/* Responsive Queries */
@media (max-width: 992px) {
  .app-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    transform: translateX(-100%);
  }
  .app-sidebar.is-open {
    transform: translateX(0);
  }
  .main-header {
    padding: 0 20px;
  }
  .main-content {
    padding: 24px 20px;
  }
  .notes-module {
    flex-direction: column;
    height: auto;
  }
  .notes-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
    height: 220px;
  }
  .note-editor {
    height: 320px;
  }
}

.mobile-only {
  display: none !important;
}

@media (max-width: 768px) {
  .mobile-only {
    display: flex !important;
  }
  .desktop-only {
    display: none !important;
  }
}

.main-content.no-padding-scroll {
  padding: 0 !important;
  overflow: hidden !important;
}

.module-container-full {
  width: 100%;
  height: 100%;
}
</style>
