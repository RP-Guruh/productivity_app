<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <span class="logo-icon">🌊</span>
        <h1 class="app-title">TaskFlow</h1>
        <p class="auth-subtitle">Masuk untuk melanjutkan ke workspace Anda</p>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div v-if="authStore.error" class="error-message">
          {{ authStore.error }}
        </div>

        <AppInput
          label="Alamat Email"
          v-model="email"
          type="email"
          placeholder="nama@email.com"
          required
          class="auth-input"
        />

        <AppInput
          label="Password"
          v-model="password"
          type="password"
          placeholder="••••••••"
          required
          class="auth-input"
        />

        <div class="form-actions">
          <AppButton
            variant="primary"
            type="submit"
            :disabled="authStore.loading"
            class="w-full"
          >
            {{ authStore.loading ? 'Sedang Masuk...' : 'Masuk' }}
          </AppButton>
        </div>
      </form>

      <div class="auth-footer">
        Belum punya akun? 
        <router-link to="/register" class="auth-link">Daftar sekarang</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/authStore'
import AppButton from '../components/common/AppButton.vue'
import AppInput from '../components/common/AppInput.vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')

const handleLogin = async () => {
  if (!email.value || !password.value) return
  const success = await authStore.login(email.value, password.value)
  if (success) {
    router.push('/')
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg);
  padding: 24px;
}

.auth-card {
  background-color: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 40px;
  width: 100%;
  max-width: 440px;
  box-shadow: var(--shadow-md);
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  font-size: 36px;
  display: inline-block;
  margin-bottom: 12px;
}

.app-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-brand);
  margin-bottom: 8px;
}

.auth-subtitle {
  font-family: 'Inter', sans-serif;
  color: var(--color-muted);
  font-size: var(--text-sm);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.auth-input {
  width: 100%;
}

.error-message {
  background-color: rgba(224, 86, 86, 0.08);
  border: 1px solid var(--color-danger, #e05656);
  color: var(--color-danger, #e05656);
  padding: 12px;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  text-align: center;
}

.w-full {
  width: 100%;
  justify-content: center;
}

.auth-footer {
  margin-top: 24px;
  text-align: center;
  font-size: var(--text-sm);
  color: var(--color-muted);
}

.auth-link {
  color: var(--color-brand);
  text-decoration: none;
  font-weight: 600;
  transition: color 150ms ease;
}

.auth-link:hover {
  text-decoration: underline;
}
</style>
