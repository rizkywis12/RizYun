<script setup>
import { ref } from 'vue'

defineProps({
  open: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle'])

const menuItems = [
  { id: 1, label: 'Home', icon: '🏠', href: '#' },
  { id: 2, label: 'Galeri', icon: '📸', href: '#galeri' },
  { id: 3, label: 'Momen Spesial', icon: '💕', href: '#momen' },
  { id: 4, label: 'Timeline', icon: '📅', href: '#timeline' },
  { id: 5, label: 'Pesan Cinta', icon: '💌', href: '#pesan' },
  { id: 6, label: 'Kontak', icon: '📞', href: '#kontak' }
]
</script>

<template>
  <div class="menu-wrapper">
    <!-- Menu Button -->
    <button class="menu-btn" @click="$emit('toggle')" :class="{ active: open }">
      <span></span>
      <span></span>
      <span></span>
    </button>

    <!-- Menu Panel -->
    <div class="menu-panel" :class="{ open }">
      <div class="menu-header">
        <h2>Menu</h2>
        <button class="close-btn" @click="$emit('toggle')">✕</button>
      </div>

      <nav class="menu-list">
        <a
          v-for="item in menuItems"
          :key="item.id"
          :href="item.href"
          class="menu-item"
          @click="$emit('toggle')"
        >
          <span class="icon">{{ item.icon }}</span>
          <span class="label">{{ item.label }}</span>
        </a>
      </nav>

      <div class="menu-footer">
        <p>© 2024 RizYun | Our Love Story ❤️</p>
      </div>
    </div>

    <!-- Backdrop -->
    <div v-if="open" class="menu-backdrop" @click="$emit('toggle')"></div>
  </div>
</template>

<style scoped>
.menu-wrapper {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 100;
}

.menu-btn {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 101;
  width: 3rem;
  height: 3rem;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.menu-btn:hover {
  border-color: rgba(255, 255, 255, 0.8);
  background: rgba(0, 0, 0, 0.8);
}

.menu-btn.active {
  background: rgba(255, 64, 129, 0.3);
  border-color: #ff4081;
}

.menu-btn span {
  width: 1.2rem;
  height: 2px;
  background: white;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.menu-btn.active span:nth-child(1) {
  transform: rotate(45deg) translate(0.8rem, 0.8rem);
}

.menu-btn.active span:nth-child(2) {
  opacity: 0;
}

.menu-btn.active span:nth-child(3) {
  transform: rotate(-45deg) translate(0.5rem, -0.5rem);
}

.menu-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.18);
  z-index: 50;
  animation: fadeIn 0.3s ease;
}

.menu-panel {
  position: fixed;
  top: 0;
  right: -400px;
  width: 100%;
  max-width: 400px;
  height: 100%;
  background: rgba(12, 12, 12, 0.32);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: -8px 0 30px rgba(0, 0, 0, 0.18);
  z-index: 75;
  display: flex;
  flex-direction: column;
  transition: right 0.3s ease;
}

.menu-panel.open {
  right: 0;
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.menu-header h2 {
  margin: 0;
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
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

.menu-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1rem 1.75rem;
  color: rgba(255, 255, 255, 0.88);
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  border-left: 3px solid transparent;
  font-size: 0.92rem;
  font-weight: 500;
  font-family: 'Comic Neue', 'Comic Sans MS', 'Segoe Print', cursive;
}

.menu-item:hover {
  background: rgba(255, 64, 129, 0.14);
  border-left-color: #ff4081;
  color: #ff4081;
  padding-left: 2.2rem;
}

.menu-item .label {
  flex: 1;
}

.menu-footer {
  padding: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .menu-btn {
    top: 1.5rem;
    right: 1.5rem;
    width: 2.5rem;
    height: 2.5rem;
    gap: 0.4rem;
  }

  .menu-btn span {
    width: 1rem;
  }

  .menu-panel {
    max-width: 100%;
    right: -100%;
  }

  .menu-item {
    padding: 1rem 1.5rem;
    gap: 1rem;
    font-size: 0.95rem;
  }

  .menu-item:hover {
    padding-left: 2rem;
  }
}
</style>
