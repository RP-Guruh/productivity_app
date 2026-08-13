<template>
  <button
    class="theme-toggle"
    @click="toggleTheme"
    :title="isDark ? 'Ubah ke Mode Terang' : 'Ubah ke Mode Gelap'"
    aria-label="Toggle theme"
  >
    <!-- Moon Icon (shows in light mode) -->
    <svg
      v-if="!isDark"
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="feather feather-moon"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
    <!-- Sun Icon (shows in dark mode) -->
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="feather feather-sun"
    >
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isDark = ref(false)

const setTheme = (theme) => {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark')
    localStorage.setItem('theme', 'dark')
    isDark.value = true
  } else {
    document.documentElement.removeAttribute('data-theme')
    localStorage.setItem('theme', 'light')
    isDark.value = false
  }
}

const toggleTheme = () => {
  const current = localStorage.getItem('theme') || 'light'
  setTheme(current === 'light' ? 'dark' : 'light')
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    setTheme(savedTheme)
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(prefersDark ? 'dark' : 'light')
  }
})
</script>

<style scoped>
.theme-toggle {
  background: none;
  border: none;
  padding: 8px;
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-muted);
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-toggle:hover {
  background-color: rgba(27, 31, 59, 0.05);
  color: var(--color-ink);
  transform: scale(1.05);
}

:root[data-theme="dark"] .theme-toggle:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.theme-toggle svg {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-toggle:hover svg {
  transform: rotate(20deg);
}
</style>
