<script setup>
import { ref, onMounted } from 'vue'

const authOpen = ref(false)
const authMessage = ref('')
const username = ref('')
const password = ref('')
const authState = ref({ authenticated: false, role: 'viewer' })
const API_URL = import.meta.env.VITE_API_URL || ''

async function checkAuth() {
  try {
    const res = await fetch(`${API_URL}/api/auth/me`, { credentials: 'include' })
    const data = await res.json()
    authState.value = data
  } catch (e) {
    authState.value = { authenticated: false, role: 'viewer' }
  }
}

async function submitLogin() {
  authMessage.value = ''
  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Login failed')
    authState.value = { authenticated: true, role: 'editor', username: username.value }
    authMessage.value = 'Login berhasil.'
    password.value = ''
    window.dispatchEvent(new CustomEvent('rizyun-auth-changed', { detail: { authenticated: true, role: 'editor' } }))
  } catch (e) {
    authState.value = { authenticated: false, role: 'viewer' }
    authMessage.value = e.message || 'Login gagal'
  }
}

async function logout() {
  try {
    await fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' })
  } catch (e) {}
  authState.value = { authenticated: false, role: 'viewer' }
  authMessage.value = 'Keluar.'
  window.dispatchEvent(new CustomEvent('rizyun-auth-changed', { detail: { authenticated: false, role: 'viewer' } }))
}

onMounted(() => {
  checkAuth()
})
</script>

<template>
  <div class="menu-wrapper">
    <div v-if="authOpen" class="auth-backdrop" @click.self="authOpen = false">
      <div class="auth-modal">
        <div class="auth-header">
          <h3>Login Editor</h3>
          <button class="close-btn" @click="authOpen = false">✕</button>
        </div>

        <label class="auth-label" for="menu-username">Username</label>
        <input id="menu-username" v-model="username" type="text" placeholder="Username" />

        <label class="auth-label" for="menu-password">Password</label>
        <input id="menu-password" v-model="password" type="password" placeholder="Password" />

        <div class="auth-actions">
          <button v-if="authState.authenticated" class="secondary-btn" @click="logout">Logout</button>
          <button class="primary-btn" @click="submitLogin">Login</button>
        </div>

        <p v-if="authMessage" class="auth-message">{{ authMessage }}</p>
        <p class="auth-hint">Viewer bisa buka galeri. Editor bisa tambah/ubah/hapus setelah login.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.menu-wrapper {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 100;
}

.auth-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 200;
}

.close-btn {
  background: transparent;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: transform 0.3s ease;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  transform: rotate(90deg);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.auth-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 200;
}

.auth-modal {
  width: min(420px, 100%);
  background: rgba(8,10,18,0.96);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px;
  padding: 1.25rem;
  box-shadow: 0 25px 70px rgba(0,0,0,0.35);
}

.auth-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.auth-header h3 {
  margin: 0;
  color: white;
}

.auth-label {
  display: block;
  color: rgba(255,255,255,0.8);
  margin-bottom: 0.35rem;
  font-size: 0.95rem;
}

.auth-modal input {
  width: 100%;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(255,255,255,0.04);
  color: white;
  border-radius: 999px;
  padding: 0.8rem 0.95rem;
  margin-bottom: 0.8rem;
}

.auth-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 0.35rem;
}

.auth-actions button {
  border: none;
  border-radius: 999px;
  padding: 0.8rem 1rem;
  cursor: pointer;
  font-weight: 600;
}

.primary-btn {
  background: linear-gradient(135deg, #ff4081, #ff8b00);
  color: white;
}

.secondary-btn {
  background: rgba(255,255,255,0.1);
  color: white;
}

.auth-message {
  margin-top: 0.85rem;
  color: #8be4ff;
  font-size: 0.95rem;
}

.auth-hint {
  margin-top: 0.7rem;
  color: rgba(255,255,255,0.65);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .floating-actions {
    bottom: 0.9rem;
  }
}
</style>
