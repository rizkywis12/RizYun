<script setup>
import { ref, onMounted } from 'vue'

// Always show floating bottom menu
const show = ref(true)
const authOpen = ref(false)
const authMessage = ref('')
const username = ref('')
const password = ref('')
const authState = ref({ authenticated: false, role: 'viewer' })
const API_URL = import.meta.env.VITE_API_URL || ''

const menuItems = [
  { id: 1, label: 'Galeri', icon: '📸', href: '#galeri' },
  { id: 2, label: 'Timeline', icon: '📅', href: '#timeline' },
  { id: 3, label: 'Games', icon: '🎮', href: '#games' },
  { id: 4, label: 'Kitab Kita', icon: '📖', href: '#kitab' }
]

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
    username.value = ''
    authOpen.value = false
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
  <transition name="slide-up">
    <div v-if="show" class="scroll-menu" role="navigation">
      <div class="menu-cards">
        <template v-for="(item, index) in menuItems" :key="item.id">
          <a :href="item.href" class="card">
            <div class="icon">{{ item.icon }}</div>
            <div class="label">{{ item.label }}</div>
          </a>
          <button
            v-if="index === 1"
            class="card account-card"
            @click="authOpen = true"
            type="button"
          >
            <div class="icon">{{ authState.authenticated ? '✓' : '👤' }}</div>
            <div class="label">{{ authState.authenticated ? 'Editor' : 'Login' }}</div>
          </button>
        </template>
      </div>
    </div>
  </transition>

  <div v-if="authOpen" class="auth-backdrop" @click.self="authOpen = false">
    <div class="auth-modal">
      <div class="auth-header">
        <h3>Login Editor</h3>
        <button class="close-btn" @click="authOpen = false" type="button">✕</button>
      </div>
      <label class="auth-label" for="scroll-username">Username</label>
      <input id="scroll-username" v-model="username" type="text" placeholder="Username" />
      <label class="auth-label" for="scroll-password">Password</label>
      <input id="scroll-password" v-model="password" type="password" placeholder="Password" />
      <div class="auth-actions">
        <button v-if="authState.authenticated" class="secondary-btn" @click="logout" type="button">Logout</button>
        <button class="primary-btn" @click="submitLogin" type="button">Login</button>
      </div>
      <p v-if="authMessage" class="auth-message">{{ authMessage }}</p>
      <p class="auth-hint">Viewer bisa lihat. Editor bisa upload/hapus setelah login.</p>
    </div>
  </div>
</template>

<style scoped>
.scroll-menu {
  position: fixed;
  bottom: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 120;
  pointer-events: auto;
  width: calc(100% - 2rem);
  max-width: 720px;
  display: flex;
  justify-content: center;
}

.menu-cards {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  justify-content: center;
  padding: 0.2rem;
  backdrop-filter: blur(8px);
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  border-radius: 999px;
  padding: 0.3rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.45);
}

.card, .account-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  color: #fff;
  text-decoration: none;
  border-radius: 10px;
  transition: transform 0.18s ease, background 0.18s ease;
  font-family: 'Comic Neue', 'Segoe UI', sans-serif;
  font-size: 0.82rem;
  min-width: 72px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.account-card {
  min-width: 78px;
}

.card .icon {
  font-size: 1.25rem;
}

.card:hover, .account-card:hover {
  transform: translateY(-6px);
  background: rgba(255, 255, 255, 0.06);
}

.auth-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 140;
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

.auth-header h3 { margin: 0; color: white; }
.auth-label { display:block; color: rgba(255,255,255,0.8); margin-bottom:0.35rem; font-size:0.95rem; }
.auth-modal input { width:100%; border:1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.04); color:white; border-radius:999px; padding:0.8rem 0.95rem; margin-bottom:0.8rem; }
.auth-actions { display:flex; gap:0.75rem; justify-content:flex-end; margin-top:0.35rem; }
.auth-actions button { border:none; border-radius:999px; padding:0.8rem 1rem; cursor:pointer; font-weight:600; }
.primary-btn { background: linear-gradient(135deg, #ff4081, #ff8b00); color:white; }
.secondary-btn { background: rgba(255,255,255,0.1); color:white; }
.auth-message { margin-top:0.85rem; color:#8be4ff; font-size:0.95rem; }
.auth-hint { margin-top:0.7rem; color: rgba(255,255,255,0.65); font-size:0.9rem; }
.close-btn { background: transparent; border:none; color:white; font-size:1.5rem; cursor:pointer; padding:0; width:2rem; height:2rem; }

.slide-up-enter-active, .slide-up-leave-active {
  transition: transform 240ms ease, opacity 240ms ease;
}
.slide-up-enter-from { transform: translateY(18px); opacity: 0 }
.slide-up-enter-to { transform: translateY(0); opacity: 1 }
.slide-up-leave-from { transform: translateY(0); opacity: 1 }
.slide-up-leave-to { transform: translateY(18px); opacity: 0 }

@media (max-width: 640px) {
  .menu-cards { gap: 0.35rem }
  .card { padding: 0.45rem 0.6rem; font-size: 0.78rem; border-radius: 10px; min-width: 60px }
  .scroll-menu { bottom: 0.9rem; width: calc(100% - 1.2rem) }
}
</style>
