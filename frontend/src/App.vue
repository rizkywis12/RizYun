<script setup>
import Hero from './components/Hero.vue'
import ScrollMenu from './components/ScrollMenu.vue'
import GallerySection from './components/GallerySection.vue'
import TimelineSection from './components/TimelineSection.vue'
import KitabSection from './components/KitabSection.vue'
import GamesSection from './components/GamesSection.vue'
</script>

<template>
  <div class="app">
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
  background: #111;
}
</style>
