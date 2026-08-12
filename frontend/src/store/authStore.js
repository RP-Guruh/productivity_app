import { defineStore } from 'pinia'

// TODO(security): Menyimpan JWT di localStorage rentan terhadap serangan XSS.
// Disarankan menggunakan HttpOnly cookie di backend untuk menyimpan session token pada tahap produksi.
const TOKEN_KEY = 'taskflow_token'
const USER_KEY = 'taskflow_user'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || null,
    user: JSON.parse(localStorage.getItem(USER_KEY)) || null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token
  },

  actions: {
    async login(email, password) {
      this.loading = true
      this.error = null
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        })

        if (!response.ok) {
          let errorMessage = 'Email atau password salah'
          try {
            const errData = await response.json()
            errorMessage = errData.message || errorMessage
          } catch (e) {
            const text = await response.text()
            if (text) errorMessage = text
          }
          throw new Error(errorMessage)
        }

        const data = await response.json()
        this.token = data.token
        this.user = { name: data.name, email: data.email }

        localStorage.setItem(TOKEN_KEY, data.token)
        localStorage.setItem(USER_KEY, JSON.stringify(this.user))
        
        // Ambil detail profile lengkap
        await this.getMe()
        return true
      } catch (err) {
        this.error = err.message
        return false
      } finally {
        this.loading = false
      }
    },

    async register(name, email, password) {
      this.loading = true
      this.error = null
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, email, password })
        })

        if (!response.ok) {
          let errorMessage = 'Registrasi gagal'
          try {
            const errData = await response.json()
            errorMessage = errData.message || errorMessage
          } catch (e) {
            const text = await response.text()
            if (text) errorMessage = text
          }
          throw new Error(errorMessage)
        }

        const data = await response.json()
        this.token = data.token
        this.user = { name: data.name, email: data.email }

        localStorage.setItem(TOKEN_KEY, data.token)
        localStorage.setItem(USER_KEY, JSON.stringify(this.user))

        // Ambil detail profile lengkap
        await this.getMe()
        return true
      } catch (err) {
        this.error = err.message
        return false
      } finally {
        this.loading = false
      }
    },

    async getMe() {
      if (!this.token) return
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            this.logout()
          }
          throw new Error('Gagal mengambil data user')
        }

        const data = await response.json()
        this.user = data
        localStorage.setItem(USER_KEY, JSON.stringify(data))
      } catch (err) {
        console.error(err)
      }
    },

    logout() {
      this.token = null
      this.user = null
      this.error = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      
      // Trigger full page reload to clear cache and security state
      window.location.href = '/'
    }
  }
})
