<template>
  <section id="games" class="section games-section">
    <div class="container">
      <h2>Games</h2>
      <p class="subtitle">Pilih game di bawah lalu klik untuk membuka halaman game</p>

      <div class="games-list">
        <a class="game-card" v-for="g in games" :key="g.id" :href="g.href">
          <div class="icon">{{ g.icon }}</div>
          <div class="title">{{ g.title }}</div>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup>
const games = [
  { id: '1', title: 'Tebak Kenangan', icon: '❓', href: '/games.html#tebak' },
  { id: '2', title: 'Puzzle Foto', icon: '🧩', href: '/games.html#puzzle' },
  { id: '3', title: 'Quiz Cinta', icon: '❤️', href: '/games.html#quiz' }
]
</script>

<style scoped>
.games-section { padding: 6rem 1rem; color: var(--text); }
.games-list { display:flex; gap:1rem; justify-content:center; flex-wrap:wrap }
.game-card { display:flex; flex-direction:column; gap:0.5rem; align-items:center; padding:1rem; width:140px; text-decoration:none; color:inherit; background:rgba(255,255,255,0.02); border-radius:10px }
.game-card .icon { font-size:1.6rem }
</style>
