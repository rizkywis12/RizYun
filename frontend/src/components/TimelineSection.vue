<template>
  <section id="timeline" class="section timeline-section">
    <div class="container">
      <h2>Timeline</h2>
      <p class="subtitle">Catatan momen penting</p>

      <ol class="events">
        <li v-for="(e, i) in events" :key="i">
          <strong>{{ e.date }}</strong> — <span class="desc">{{ e.text }}</span>
        </li>
      </ol>
    </div>
  </section>
</template>

<script setup>
const events = [
  { date: '2024-05-12', text: 'Pertama kali chat' },
  { date: '2024-06-01', text: 'Pertama kali ketemu' },
  { date: '2025-02-14', text: 'Jalan bareng Valentine' }
]
</script>

<style scoped>
.timeline-section { padding: 6rem 1rem; }
.timeline-section .container { max-width: 800px; margin: 0 auto; color: var(--text); text-align: left }
.events { list-style: none; padding: 0; display: grid; gap: 1rem }
.events li { background: rgba(255,255,255,0.02); padding: 0.9rem 1rem; border-radius: 8px }
.events .desc { color: var(--text-h) }
</style>
