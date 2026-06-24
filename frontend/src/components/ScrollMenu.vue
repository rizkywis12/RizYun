<script setup>
import { ref } from 'vue'

// Always show floating bottom menu
const show = ref(true)

const menuItems = [
  { id: 1, label: 'Galeri', icon: '📸', href: '#galeri' },
  { id: 2, label: 'Timeline', icon: '📅', href: '#timeline' },
  { id: 3, label: 'Games', icon: '🎮', href: '#games' },
  { id: 4, label: 'Kitab Kita', icon: '📖', href: '#kitab' }
]
</script>

<template>
  <transition name="slide-up">
    <div v-if="show" class="scroll-menu" role="navigation">
      <div class="menu-cards">
        <a v-for="item in menuItems" :key="item.id" :href="item.href" class="card">
          <div class="icon">{{ item.icon }}</div>
          <div class="label">{{ item.label }}</div>
        </a>
      </div>
    </div>
  </transition>
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
  padding: 0.2rem;
  backdrop-filter: blur(8px);
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  border-radius: 999px;
  padding: 0.3rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.45);
}

.card {
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
}

.card .icon {
  font-size: 1.25rem;
}

.card:hover {
  transform: translateY(-6px);
  background: rgba(255, 255, 255, 0.06);
}

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
