<script setup>
import { ref, onMounted } from 'vue'

const selectedTitle = ref('RizYun')
const videoRef = ref(null)

const titles = [
  { id: 1, name: 'RizYun', label: 'RizYun' },
  { id: 2, name: 'Mylup❤️', label: 'Mylup❤️' },
  { id: 3, name: 'Rizky & Yuyun', label: 'Rizky & Yuyun' }
]

const tagline = "Semoga kita bisa sama sama terus sampai tua!"

onMounted(() => {
  if (!videoRef.value) return

  const video = videoRef.value
  video.muted = true
  video.playsInline = true
  video.webkitPlaysInline = true
  video.setAttribute('muted', '')
  video.setAttribute('playsinline', '')
  video.setAttribute('webkit-playsinline', '')
  video.controls = false

  const tryPlay = async () => {
    try {
      await video.play()
    } catch (error) {
      // Safari may still block autoplay in some edge cases.
    }
  }

  video.addEventListener('loadeddata', tryPlay, { once: true })
  tryPlay()
})
</script>

<template>
  <div class="hero-container">
    <!-- Video Background -->
    <div class="video-container">
      <video
        ref="videoRef"
        autoplay
        muted
        loop
        playsinline
        webkit-playsinline
        preload="auto"
        class="hero-video"
      >
        <source src="/videos/rizyuncover.webm" type="video/webm" />
        Your browser does not support the video tag.
      </video>
    </div>

    <!-- Overlay -->
    <div class="overlay"></div>

    <!-- Content -->
    <div class="hero-content">
      <!-- Title Selector -->
      <div class="title-selector">
        <button
          v-for="title in titles"
          :key="title.id"
          :class="['title-btn', { active: selectedTitle === title.name }]"
          @click="selectedTitle = title.name"
        >
          {{ title.label }}
        </button>
      </div>

      <!-- Main Title -->
      <h1 class="main-title">{{ selectedTitle }}</h1>

      <!-- Tagline -->
      <p class="tagline">{{ tagline }}</p>
    </div>
  </div>
</template>

<style scoped>
.hero-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.hero-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  outline: none;
}

.hero-video::-webkit-media-controls {
  display: none !important;
}

.hero-video::-webkit-media-controls-enclosure {
  display: none !important;
}

.hero-video::-webkit-media-controls-panel {
  display: none !important;
}

.hero-video::-webkit-media-controls-start-playback-button {
  display: none !important;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.5) 50%,
    rgba(0, 0, 0, 0.7) 100%
  );
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  gap: 2rem;
}

.title-selector {
  display: flex;
  gap: 0.85rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 1rem;
}

.title-btn {
  transition: all 0.35s ease;
  backdrop-filter: blur(14px);
  letter-spacing: 0.8px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.title-btn:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: translateY(-2px);
}

.title-btn.active {
  background: linear-gradient(135deg, rgba(255, 64, 129, 0.2), rgba(255, 255, 255, 0.12));
  color: #ffadc4;
  font-weight: 700;
  box-shadow: 0 12px 40px rgba(255, 64, 129, 0.24);
  border-color: transparent;
}

.main-title {
  font-size: clamp(3rem, 8vw, 4.5rem);
  font-weight: 800;
  margin: 0;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  text-shadow: 0 18px 50px rgba(0, 0, 0, 0.55);
}

.tagline {
  font-size: 1.3rem;
  margin: 1rem 0 0 0;
  font-weight: 300;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.45);
  animation: fadeInUp 1s ease 0.2s backwards;
  max-width: 500px;
}

.hero-content::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top, rgba(255, 255, 255, 0.14), transparent 35%);
  pointer-events: none;
}

.hero-content::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 30%, rgba(0, 0, 0, 0.25) 100%);
  pointer-events: none;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(10px);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .main-title {
    font-size: 2.5rem;
  }

  .tagline {
    font-size: 1rem;
    max-width: 90%;
  }

  .title-btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.85rem;
  }

  .title-selector {
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .main-title {
    font-size: 2rem;
  }

  .tagline {
    font-size: 0.95rem;
  }

  .title-btn {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
}
</style>
