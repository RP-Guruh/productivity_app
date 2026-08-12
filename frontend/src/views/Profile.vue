<template>
  <div class="profile-page">
    <!-- Navbar Header -->
    <header class="app-header">
      <div class="logo-container" @click="goHome" role="button" tabindex="0" @keydown.enter="goHome">
        <span class="logo-icon">🌊</span>
        <h1 class="logo-text">TaskFlow</h1>
      </div>
      <AppButton variant="secondary" size="sm" @click="goHome">
        Kembali ke Board
      </AppButton>
    </header>

    <!-- Main Content -->
    <main class="profile-content">
      <div class="profile-card">
        <h2 class="card-title">Detail Profil Pengguna</h2>

        <div v-if="authStore.user" class="user-details">
          <div class="avatar-section">
            <AppAvatar :name="authStore.user.name" size="lg" />
            <div class="user-meta">
              <h3 class="user-name">{{ authStore.user.name }}</h3>
              <AppBadge variant="info">User Terverifikasi</AppBadge>
            </div>
          </div>

          <hr class="divider" />

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Nama Lengkap</span>
              <span class="info-value">{{ authStore.user.name }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">Alamat Email</span>
              <span class="info-value">{{ authStore.user.email }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">Tanggal Bergabung</span>
              <span class="info-value">{{ formattedDate }}</span>
            </div>
          </div>

          <div class="profile-actions">
            <AppButton variant="danger" @click="handleLogout" class="logout-btn">
              Keluar / Logout
            </AppButton>
          </div>
        </div>

        <div v-else class="loading-state">
          Memuat data profil...
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/authStore'
import AppButton from '../components/common/AppButton.vue'
import AppAvatar from '../components/common/AppAvatar.vue'
import AppBadge from '../components/common/AppBadge.vue'

const router = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
  await authStore.getMe()
})

const goHome = () => {
  router.push('/')
}

const handleLogout = () => {
  authStore.logout()
}

const formattedDate = computed(() => {
  if (!authStore.user || !authStore.user.createdAt) return '-'
  try {
    const date = new Date(authStore.user.createdAt)
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return authStore.user.createdAt
  }
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg);
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
  cursor: pointer;
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

.profile-content {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
}

.profile-card {
  background-color: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 40px;
  width: 100%;
  max-width: 540px;
  box-shadow: var(--shadow-md);
}

.card-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-ink);
  margin-bottom: 32px;
  text-align: center;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-ink);
}

.divider {
  border: 0;
  border-top: 1px solid var(--color-border);
  margin: 24px 0;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: var(--text-xs);
  color: var(--color-muted);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.info-value {
  font-size: var(--text-base);
  color: var(--color-ink);
  font-weight: 500;
}

.profile-actions {
  margin-top: 36px;
  display: flex;
  justify-content: flex-end;
}

.logout-btn {
  width: 100%;
  justify-content: center;
}

.loading-state {
  text-align: center;
  color: var(--color-muted);
  padding: 40px 0;
}
</style>
