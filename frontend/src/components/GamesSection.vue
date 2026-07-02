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
  { id: '1', title: 'Uler Tangga', icon: '🐍', href: '/uler-tangga.html' },
  { id: '2', title: 'Gamsit', icon: '✊✌️✋', href: '/gamsit.html' },
  { id: '3', title: 'Would You Rather', icon: '🤔', href: '/would-you-rather.html' }
]
</script>

<style scoped>
.games-section { padding: 6rem 1rem; color: var(--text); }
.games-list { display:flex; gap:1rem; justify-content:center; flex-wrap:wrap }
.game-card { display:flex; flex-direction:column; gap:0.5rem; align-items:center; padding:1rem; width:140px; min-height:140px; text-decoration:none; color:inherit; background:rgba(255,255,255,0.02); border-radius:10px; transition:transform .2s ease, background .2s ease; }
.game-card:hover { transform: translateY(-4px); background:rgba(255,255,255,0.08); }
.game-card .icon { font-size:1.6rem }
</style>
