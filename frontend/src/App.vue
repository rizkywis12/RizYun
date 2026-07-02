<script setup>
import { onMounted, ref } from 'vue'
import Menu from './components/Menu.vue'
import Hero from './components/Hero.vue'
import ScrollMenu from './components/ScrollMenu.vue'
import GallerySection from './components/GallerySection.vue'
import TimelineSection from './components/TimelineSection.vue'
import KitabSection from './components/KitabSection.vue'
import GamesSection from './components/GamesSection.vue'

const menuOpen = ref(false)

onMounted(() => {
  const sections = document.querySelectorAll('.section')
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        obs.unobserve(entry.target)
      }
    })
  }, { threshold: 0.18 })

  sections.forEach((section) => observer.observe(section))
})
</script>

<template>
  <div class="app">
    <Menu :open="menuOpen" @toggle="menuOpen = !menuOpen" />
    <ScrollMenu />
    <Hero />

    <main id="main-content">
      <GallerySection />
      <TimelineSection />
      <GamesSection />
      <KitabSection />
    </main>
  </div>
</template>

<style scoped>
.app {
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  background: radial-gradient(circle at top left, rgba(255, 64, 129, 0.15), transparent 24%),
    radial-gradient(circle at bottom right, rgba(56, 194, 255, 0.12), transparent 18%),
    #09090f;
}

#main-content {
  padding: 1.5rem 0 4rem;
}
</style>
