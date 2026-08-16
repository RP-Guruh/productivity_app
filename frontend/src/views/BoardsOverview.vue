<template>
  <div class="dashboard-layout">
    <!-- Sidebar (Drawer on mobile) -->
    <aside class="app-sidebar" :class="{ 'is-open': isSidebarOpen }">
      <div class="sidebar-header">
        <div class="logo-container">
          <span class="logo-icon">🌊</span>
          <h1 class="logo-text">TaskFlow AI</h1>
        </div>
        <button class="sidebar-close-btn mobile-only" @click="isSidebarOpen = false" aria-label="Tutup Menu">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <!-- User Profile Card -->
      <div class="sidebar-user" v-if="authStore.user">
        <AppAvatar :name="authStore.user.name" size="md" />
        <div class="user-info">
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
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <span class="nav-label">{{ item.label }}</span>
          <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
        </button>
      </nav>

      <!-- Sidebar Footer -->
      <div class="sidebar-footer">
        <div class="footer-row">
          <span class="footer-label">Tema</span>
          <ThemeToggle />
        </div>
        <button class="logout-btn" @click="authStore.logout">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Logout
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

      <main class="main-content">
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

        <!-- ================= MOCK CALENDAR MODULE ================= -->
        <div v-else-if="currentMenu === 'calendar'" class="module-container animate-fade-in">
          <div class="calendar-module">
            <div class="calendar-header">
              <h3 class="calendar-month">Agustus 2026</h3>
              <div class="calendar-controls">
                <button class="calendar-arrow-btn" disabled>&lt;</button>
                <button class="calendar-arrow-btn" disabled>&gt;</button>
              </div>
            </div>
            <div class="calendar-grid">
              <div class="calendar-day-header" v-for="day in ['Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb', 'Mg']" :key="day">{{ day }}</div>
              <div 
                v-for="(day, idx) in calendarDays" 
                :key="idx" 
                :class="['calendar-cell', { 'is-empty': !day.isCurrentMonth, 'has-events': day.tasks && day.tasks.length > 0 }]"
              >
                <span class="calendar-day-number">{{ day.date }}</span>
                <div v-if="day.tasks && day.tasks.length > 0" class="calendar-events">
                  <div 
                    v-for="(t, tIdx) in day.tasks" 
                    :key="tIdx" 
                    :class="['calendar-event-tag', `calendar-event-tag--${t.priority}`]"
                    :title="t.title"
                  >
                    {{ t.title }}
                  </div>
                </div>
              </div>
            </div>
            <div class="calendar-agenda">
              <h4 class="agenda-title">Agenda Terdekat</h4>
              <div class="agenda-list">
                <div class="agenda-item">
                  <div class="agenda-date">15 AGU</div>
                  <div class="agenda-details">
                    <h5 class="agenda-task-title">Selesaikan API Task & Sinkronisasi Vue</h5>
                    <p class="agenda-task-desc">Task Management Module • Prioritas Tinggi</p>
                  </div>
                  <span class="agenda-badge agenda-badge--high">Penting</span>
                </div>
                <div class="agenda-item">
                  <div class="agenda-date">18 AGU</div>
                  <div class="agenda-details">
                    <h5 class="agenda-task-title">Review Vue Frontend UX & Rombak Dashboard</h5>
                    <p class="agenda-task-desc">UI/UX Redesign • Prioritas Sedang</p>
                  </div>
                  <span class="agenda-badge agenda-badge--medium">Menengah</span>
                </div>
                <div class="agenda-item">
                  <div class="agenda-date">20 AGU</div>
                  <div class="agenda-details">
                    <h5 class="agenda-task-title">Deploy ke Server Staging</h5>
                    <p class="agenda-task-desc">DevOps / Launching • Prioritas Tinggi</p>
                  </div>
                  <span class="agenda-badge agenda-badge--high">Penting</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ================= MOCK NOTES MODULE ================= -->
        <div v-else-if="currentMenu === 'notes'" class="module-container animate-fade-in">
          <div class="notes-module">
            <div class="notes-sidebar">
              <div class="notes-sidebar-header">
                <h4 class="notes-title">Catatan</h4>
                <button class="add-note-btn" @click="createNote">+ Baru</button>
              </div>
              <div class="notes-list">
                <div 
                  v-for="note in notes" 
                  :key="note.id" 
                  :class="['notes-item-card', { 'is-active': selectedNoteId === note.id }]"
                  @click="selectedNoteId = note.id"
                >
                  <div class="note-card-title-row">
                    <h5 class="note-card-title">{{ note.title || 'Tanpa Judul' }}</h5>
                    <button class="delete-note-btn" @click.stop="deleteNote(note.id)">×</button>
                  </div>
                  <p class="note-card-snippet">{{ note.content ? note.content.substring(0, 45) + '...' : 'Catatan kosong' }}</p>
                </div>
              </div>
            </div>
            <div class="note-editor">
              <div v-if="selectedNote" class="editor-container">
                <input 
                  type="text" 
                  v-model="selectedNote.title" 
                  class="editor-title-input" 
                  placeholder="Judul Catatan..." 
                />
                <textarea 
                  v-model="selectedNote.content" 
                  class="editor-textarea" 
                  placeholder="Mulai menulis di sini..."
                ></textarea>
              </div>
              <div v-else class="editor-empty">
                <span class="editor-empty-icon">📝</span>
                <p>Pilih catatan dari daftar atau buat baru untuk mulai menulis.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ================= MOCK HABITS MODULE ================= -->
        <div v-else-if="currentMenu === 'habits'" class="module-container animate-fade-in">
          <div class="habits-module">
            <p class="habits-subtitle">Membangun kebiasaan harian Anda dengan check-in rutin.</p>
            <div class="habits-card">
              <div class="habits-table">
                <div class="habits-table-header">
                  <div class="habit-col-name">Nama Kebiasaan</div>
                  <div class="habit-col-day" v-for="d in ['Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb', 'Mg']" :key="d">{{ d }}</div>
                </div>
                <div class="habit-row" v-for="habit in habits" :key="habit.id">
                  <div class="habit-info">
                    <span class="habit-name">{{ habit.name }}</span>
                    <span class="habit-streak">🔥 {{ getHabitStreak(habit) }} hari beruntun</span>
                  </div>
                  <div class="habit-days">
                    <button 
                      v-for="(checked, dIdx) in habit.days" 
                      :key="dIdx" 
                      :class="['habit-check-circle', { 'is-checked': checked }]"
                      @click="toggleHabitDay(habit.id, dIdx)"
                      :aria-label="`Tandai hari ke-${dIdx + 1} untuk ${habit.name}`"
                    >
                      <svg v-if="checked" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <!-- Statistics Row -->
            <div class="habits-stats">
              <div class="stat-card">
                <span class="stat-value">82%</span>
                <span class="stat-label">Tingkat Penyelesaian Minggu Ini</span>
              </div>
              <div class="stat-card">
                <span class="stat-value">🔥 12 Hari</span>
                <span class="stat-label">Streak Kebiasaan Terpanjang</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ================= MOCK AI COACH MODULE ================= -->
        <div v-else-if="currentMenu === 'ai'" class="module-container animate-fade-in">
          <div class="ai-module">
            <div class="ai-chat-header">
              <div class="ai-avatar">✨</div>
              <div class="ai-status">
                <h4 class="ai-name">FlowAI Coach</h4>
                <span class="ai-badge">Asisten Produktivitas</span>
              </div>
            </div>
            <div class="ai-chat-messages" ref="chatContainerRef">
              <div 
                v-for="(msg, index) in chatMessages" 
                :key="index" 
                :class="['chat-bubble-wrapper', `chat-bubble-wrapper--${msg.sender}`]"
              >
                <div class="chat-bubble">
                  <p class="chat-text">{{ msg.text }}</p>
                  <span class="chat-time">{{ msg.time }}</span>
                </div>
              </div>
              <div v-if="isAiTyping" class="chat-bubble-wrapper chat-bubble-wrapper--ai">
                <div class="chat-bubble chat-bubble--typing">
                  <span class="typing-dot"></span>
                  <span class="typing-dot"></span>
                  <span class="typing-dot"></span>
                </div>
              </div>
            </div>
            <div class="ai-chat-input-row">
              <input 
                type="text" 
                v-model="newMessageText" 
                class="ai-chat-input" 
                placeholder="Tanya tips produktivitas atau cara membagi task..."
                @keydown.enter="sendChatMessage"
              />
              <button class="ai-chat-send-btn" @click="sendChatMessage" :disabled="!newMessageText.trim()">
                Kirim
              </button>
            </div>
          </div>
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
import { ref, computed, onMounted, nextTick } from 'vue'
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
const isCreatingBoard = ref(false)
const isSidebarOpen = ref(false)
const currentMenu = ref('tasks')

const menuItems = [
  { id: 'tasks', label: 'Task Management', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>' },
  { id: 'calendar', label: 'Calendar Agenda', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>' },
  { id: 'notes', label: 'Quick Notes', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>' },
  { id: 'habits', label: 'Habit Tracker', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>' },
  { id: 'ai', label: 'FlowAI Coach', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>', badge: 'AI' },
  { id: 'settings', label: 'Pengaturan', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>' }
]

const currentMenuLabel = computed(() => {
  return menuItems.find(item => item.id === currentMenu.value)?.label || 'Productivity App'
})

const selectMenu = (menuId) => {
  currentMenu.value = menuId
  isSidebarOpen.value = false
}

// Calendar Mock data for August 2026
const calendarDays = ref([
  { date: 27, isCurrentMonth: false },
  { date: 28, isCurrentMonth: false },
  { date: 29, isCurrentMonth: false },
  { date: 30, isCurrentMonth: false },
  { date: 31, isCurrentMonth: false },
  { date: 1, isCurrentMonth: true, tasks: [] },
  { date: 2, isCurrentMonth: true, tasks: [] },
  { date: 3, isCurrentMonth: true, tasks: [] },
  { date: 4, isCurrentMonth: true, tasks: [] },
  { date: 5, isCurrentMonth: true, tasks: [] },
  { date: 6, isCurrentMonth: true, tasks: [] },
  { date: 7, isCurrentMonth: true, tasks: [] },
  { date: 8, isCurrentMonth: true, tasks: [] },
  { date: 9, isCurrentMonth: true, tasks: [] },
  { date: 10, isCurrentMonth: true, tasks: [] },
  { date: 11, isCurrentMonth: true, tasks: [] },
  { date: 12, isCurrentMonth: true, tasks: [] },
  { date: 13, isCurrentMonth: true, tasks: [] },
  { date: 14, isCurrentMonth: true, tasks: [] },
  { date: 15, isCurrentMonth: true, tasks: [{ title: 'Selesaikan API Task', priority: 'high' }] },
  { date: 16, isCurrentMonth: true, tasks: [] },
  { date: 17, isCurrentMonth: true, tasks: [{ title: 'Hari Kemerdekaan RI', priority: 'medium' }] },
  { date: 18, isCurrentMonth: true, tasks: [{ title: 'Review Vue Frontend', priority: 'medium' }] },
  { date: 19, isCurrentMonth: true, tasks: [] },
  { date: 20, isCurrentMonth: true, tasks: [{ title: 'Deploy ke Server Staging', priority: 'high' }] },
  { date: 21, isCurrentMonth: true, tasks: [] },
  { date: 22, isCurrentMonth: true, tasks: [] },
  { date: 23, isCurrentMonth: true, tasks: [] },
  { date: 24, isCurrentMonth: true, tasks: [] },
  { date: 25, isCurrentMonth: true, tasks: [] },
  { date: 26, isCurrentMonth: true, tasks: [] },
  { date: 27, isCurrentMonth: true, tasks: [] },
  { date: 28, isCurrentMonth: true, tasks: [] },
  { date: 29, isCurrentMonth: true, tasks: [] },
  { date: 30, isCurrentMonth: true, tasks: [] },
  { date: 31, isCurrentMonth: true, tasks: [] },
  { date: 1, isCurrentMonth: false },
  { date: 2, isCurrentMonth: false },
  { date: 3, isCurrentMonth: false },
  { date: 4, isCurrentMonth: false },
  { date: 5, isCurrentMonth: false },
  { date: 6, isCurrentMonth: false }
])

// Notes Mock & Logic
const notes = ref([
  { id: 1, title: 'Rencana TaskFlow AI', content: '1. Integrasikan API Task ke Vue frontend\n2. Rombak desain dashboard agar mendukung multi-menu\n3. Pastikan responsive dan dukung dark mode\n4. Tambahkan fitur visual calendar & habit tracker' },
  { id: 2, title: 'Catatan Rapat Tim', content: 'Rapat tanggal 15 Agustus 2026:\n- Guru: Selesaikan setup controller dan repository\n- Developer: Sesuaikan vue store dengan model baru\n- Rilis beta direncanakan akhir bulan ini' },
  { id: 3, title: 'Daftar Belanja Mingguan', content: '- Beli kopi Arabika premium\n- Buku catatan baru\n- Camilan untuk coding malam hari' }
])
const selectedNoteId = ref(1)
const selectedNote = computed(() => notes.value.find(n => n.id === selectedNoteId.value))

const createNote = () => {
  const newId = notes.value.length ? Math.max(...notes.value.map(n => n.id)) + 1 : 1
  notes.value.push({
    id: newId,
    title: 'Catatan Baru',
    content: ''
  })
  selectedNoteId.value = newId
}

const deleteNote = (id) => {
  notes.value = notes.value.filter(n => n.id !== id)
  if (selectedNoteId.value === id && notes.value.length > 0) {
    selectedNoteId.value = notes.value[0].id
  }
}

// Habits Mock & Logic
const habits = ref([
  { id: 1, name: 'Coding 2 Jam', days: [true, true, false, true, false, false, false] },
  { id: 2, name: 'Minum Air 2L', days: [true, true, true, true, true, false, false] },
  { id: 3, name: 'Membaca Buku 15 Halaman', days: [false, true, false, false, true, false, false] },
  { id: 4, name: 'Olahraga & Stretching', days: [true, false, true, false, true, false, false] }
])

const toggleHabitDay = (habitId, dayIndex) => {
  const habit = habits.value.find(h => h.id === habitId)
  if (habit) {
    habit.days[dayIndex] = !habit.days[dayIndex]
  }
}

const getHabitStreak = (habit) => {
  let streak = 0
  for (let i = habit.days.length - 1; i >= 0; i--) {
    if (habit.days[i]) {
      streak++
    } else if (streak > 0) {
      break
    }
  }
  return streak || 1
}

// AI Coach Mock & Logic
const chatMessages = ref([
  { sender: 'ai', text: 'Halo! Saya adalah FlowAI, Asisten Produktivitas Anda. Ada yang bisa saya bantu hari ini?', time: '13:00' },
  { sender: 'user', text: 'Saya ingin menyelesaikan task management saya hari ini.', time: '13:02' },
  { sender: 'ai', text: 'Hebat! Memulai dengan fokus tunggal adalah cara terbaik. Apakah Anda memerlukan rekomendasi pembagian task?', time: '13:02' }
])
const newMessageText = ref('')
const isAiTyping = ref(false)
const chatContainerRef = ref(null)

const sendChatMessage = () => {
  if (!newMessageText.value.trim()) return
  const now = new Date()
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  
  chatMessages.value.push({
    sender: 'user',
    text: newMessageText.value,
    time: timeStr
  })
  
  const userQuery = newMessageText.value
  newMessageText.value = ''
  isAiTyping.value = true
  scrollToBottom()
  
  setTimeout(() => {
    isAiTyping.value = false
    let aiResponse = 'Fokus pada satu task besar hari ini untuk menjaga momentum Anda!'
    const lower = userQuery.toLowerCase()
    if (lower.includes('rekomendasi') || lower.includes('susun') || lower.includes('bagi')) {
      aiResponse = 'Saya sarankan membagi task Anda menjadi 3 bagian: 1. Persiapan Data (1 jam), 2. Implementasi Inti (3 jam), dan 3. Pengujian/Bugfix (1 jam). Beri jeda 10 menit setiap 50 menit bekerja!'
    } else if (lower.includes('malas') || lower.includes('lelah') || lower.includes('capek')) {
      aiResponse = 'Tidak apa-apa untuk merasa lelah. Cobalah gunakan teknik Pomodoro 25 menit saja, lalu istirahat 5 menit. Seringkali, memulai adalah bagian tersulit!'
    } else if (lower.includes('halo') || lower.includes('hi') || lower.includes('hey')) {
      aiResponse = 'Halo kembali! Siap meningkatkan produktivitas hari ini? Katakan kepada saya apa target utama Anda.'
    }
    
    chatMessages.value.push({
      sender: 'ai',
      text: aiResponse,
      time: timeStr
    })
    scrollToBottom()
  }, 1000)
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainerRef.value) {
      chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
    }
  })
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
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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

/* Mock Calendar Styles */
.calendar-module {
  background-color: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 16px;
}

.calendar-month {
  font-family: 'Space Grotesk', sans-serif;
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-ink);
}

.calendar-controls {
  display: flex;
  gap: 8px;
}

.calendar-arrow-btn {
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  background-color: var(--color-paper);
  color: var(--color-muted);
  border-radius: var(--radius-sm);
  cursor: not-allowed;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.calendar-day-header {
  text-align: center;
  font-weight: 600;
  font-size: var(--text-sm);
  color: var(--color-muted);
  padding-bottom: 8px;
}

.calendar-cell {
  background-color: var(--color-paper);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  aspect-ratio: 1.2;
  padding: 6px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 150ms ease;
}

.calendar-cell.is-empty {
  opacity: 0.35;
  background-color: transparent;
}

.calendar-cell.has-events {
  border-color: var(--color-brand);
}

.calendar-day-number {
  font-family: 'IBM Plex Mono', monospace;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-ink);
}

.calendar-events {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.calendar-event-tag {
  font-size: 9px;
  padding: 2px 4px;
  border-radius: 3px;
  color: #FFFFFF;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.1;
}

.calendar-event-tag--high {
  background-color: var(--color-signal);
}

.calendar-event-tag--medium {
  background-color: var(--color-warning);
}

.calendar-agenda {
  margin-top: 16px;
}

.agenda-title {
  font-size: var(--text-md);
  font-weight: 700;
  color: var(--color-ink);
  margin-bottom: 12px;
}

.agenda-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.agenda-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--color-paper);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  gap: 16px;
}

.agenda-date {
  font-family: 'IBM Plex Mono', monospace;
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--color-brand);
  background-color: rgba(62, 76, 138, 0.08);
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
}

.agenda-details {
  flex-grow: 1;
}

.agenda-task-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-ink);
}

.agenda-task-desc {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

.agenda-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 999px;
  line-height: 1;
}

.agenda-badge--high {
  background-color: rgba(232, 86, 47, 0.1);
  color: var(--color-signal);
}

.agenda-badge--medium {
  background-color: rgba(184, 134, 11, 0.1);
  color: var(--color-warning);
}

/* Mock Notes Styles */
.notes-module {
  display: flex;
  background-color: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  height: 550px;
  overflow: hidden;
  box-shadow: var(--shadow-card);
}

.notes-sidebar {
  width: 250px;
  min-width: 250px;
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  background-color: var(--color-paper);
}

.notes-sidebar-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
}

.notes-title {
  font-size: var(--text-md);
  font-weight: 700;
}

.add-note-btn {
  padding: 4px 8px;
  background-color: var(--color-brand);
  color: #FFFFFF;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
}

.notes-list {
  flex-grow: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notes-item-card {
  padding: 12px;
  border-radius: var(--radius-sm);
  background-color: var(--color-panel);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 150ms ease;
}

.notes-item-card:hover {
  border-color: var(--color-brand);
}

.notes-item-card.is-active {
  background-color: rgba(62, 76, 138, 0.06);
  border-color: var(--color-brand);
}

.note-card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.note-card-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-grow: 1;
}

.delete-note-btn {
  background: none;
  border: none;
  font-size: 16px;
  color: var(--color-muted);
  cursor: pointer;
  line-height: 1;
  padding: 0 4px;
}

.delete-note-btn:hover {
  color: var(--color-signal);
}

.note-card-snippet {
  font-size: var(--text-xs);
  color: var(--color-muted);
  line-height: 1.4;
}

.note-editor {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
}

.editor-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.editor-title-input {
  font-family: 'Space Grotesk', sans-serif;
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-ink);
  border: none;
  background: transparent;
  outline: none;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 8px;
}

.editor-textarea {
  flex-grow: 1;
  font-family: 'Inter', sans-serif;
  font-size: var(--text-base);
  color: var(--color-ink);
  border: none;
  background: transparent;
  outline: none;
  resize: none;
  line-height: 1.6;
}

.editor-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-muted);
  text-align: center;
  gap: 12px;
}

.editor-empty-icon {
  font-size: 40px;
}

/* Mock Habit Tracker Styles */
.habits-module {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.habits-subtitle {
  font-size: var(--text-base);
  color: var(--color-muted);
}

.habits-card {
  background-color: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: 24px;
  overflow-x: auto;
}

.habits-table {
  min-width: 600px;
}

.habits-table-header {
  display: grid;
  grid-template-columns: 240px repeat(7, 1fr);
  border-bottom: 2px solid var(--color-border);
  padding-bottom: 12px;
  font-weight: 700;
  color: var(--color-muted);
}

.habit-col-name {
  text-align: left;
}

.habit-col-day {
  text-align: center;
}

.habit-row {
  display: grid;
  grid-template-columns: 240px repeat(7, 1fr);
  border-bottom: 1px solid var(--color-border);
  padding: 16px 0;
  align-items: center;
}

.habit-info {
  display: flex;
  flex-direction: column;
}

.habit-name {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-ink);
}

.habit-streak {
  font-size: var(--text-xs);
  color: var(--color-warning);
  font-weight: 500;
}

.habit-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-column: 2 / 9;
}

.habit-check-circle {
  justify-self: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  background-color: var(--color-paper);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: transparent;
  transition: all 150ms ease;
}

.habit-check-circle:hover {
  border-color: var(--color-brand);
}

.habit-check-circle.is-checked {
  background-color: var(--color-success);
  border-color: var(--color-success);
  color: #FFFFFF;
}

.habits-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.stat-card {
  background-color: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: var(--shadow-card);
}

.stat-value {
  font-family: 'Space Grotesk', sans-serif;
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-brand);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--color-muted);
}

/* Mock AI Chat Coach Styles */
.ai-module {
  background-color: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  height: 550px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ai-chat-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: var(--color-paper);
}

.ai-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--color-brand);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.ai-status {
  display: flex;
  flex-direction: column;
}

.ai-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: var(--text-base);
  font-weight: 700;
}

.ai-badge {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

.ai-chat-messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chat-bubble-wrapper {
  display: flex;
  max-width: 75%;
}

.chat-bubble-wrapper--ai {
  align-self: flex-start;
}

.chat-bubble-wrapper--user {
  align-self: flex-end;
}

.chat-bubble {
  padding: 12px 16px;
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: 4px;
  line-height: 1.5;
}

.chat-bubble-wrapper--ai .chat-bubble {
  background-color: var(--color-paper);
  color: var(--color-ink);
  border-top-left-radius: 2px;
  border: 1px solid var(--color-border);
}

.chat-bubble-wrapper--user .chat-bubble {
  background-color: var(--color-brand);
  color: #FFFFFF;
  border-top-right-radius: 2px;
}

.chat-text {
  font-size: var(--text-base);
}

.chat-time {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px;
  align-self: flex-end;
  opacity: 0.6;
}

.ai-chat-input-row {
  padding: 16px 20px;
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: 12px;
  background-color: var(--color-paper);
}

.ai-chat-input {
  flex-grow: 1;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  outline: none;
  background-color: var(--color-panel);
  color: var(--color-ink);
  font-family: 'Inter', sans-serif;
  font-size: var(--text-base);
}

.ai-chat-input:focus {
  border-color: var(--color-brand);
}

.ai-chat-send-btn {
  padding: 0 20px;
  background-color: var(--color-brand);
  color: #FFFFFF;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: opacity 150ms ease;
}

.ai-chat-send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Typing indicator */
.chat-bubble--typing {
  display: flex;
  flex-direction: row !important;
  align-items: center;
  gap: 4px;
  padding: 12px 20px;
}

.typing-dot {
  width: 6px;
  height: 6px;
  background-color: var(--color-muted);
  border-radius: 50%;
  animation: typingBounce 1.2s infinite ease-in-out;
}

.typing-dot:nth-child(2) { animation-delay: 200ms; }
.typing-dot:nth-child(3) { animation-delay: 400ms; }

@keyframes typingBounce {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-6px); }
}

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
  .calendar-cell {
    aspect-ratio: 1;
    padding: 4px;
  }
  .calendar-day-number {
    font-size: 10px;
  }
  .calendar-event-tag {
    font-size: 8px;
    padding: 1px 2px;
  }
  .habits-stats {
    grid-template-columns: 1fr;
  }
}
</style>
