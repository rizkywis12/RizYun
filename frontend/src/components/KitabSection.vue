<template>
  <section id="kitab" class="section kitab-section">
    <div class="container">
      <h2>Kitab Kita</h2>
      <p class="subtitle">Kumpulan pesan, kutipan, dan catatan</p>

      <div class="notes">
        <article class="note" v-for="n in 3" :key="n">
          <h3>Pesan {{ n }}</h3>
          <p>Isi pesan singkat yang manis dan bermakna.</p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.kitab-section { padding: 6rem 1rem; color: var(--text); }
.kitab-section .container { max-width: 800px; margin: 0 auto; }
.notes { display: grid; gap: 1rem }
.note { background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 10px }
</style>
