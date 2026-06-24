<template>
  <section id="galeri" class="section gallery-section">
    <div class="container">
        <div class="header-row">
          <div>
            <h2>Galeri</h2>
            <p class="subtitle">Album terbaru</p>
          </div>
          <div>
            <button class="add-album-btn" @click="showForm = true">+ Add Album</button>
          </div>
        </div>

      <div class="carousel-wrap">
        <button v-show="showNav" class="nav prev" @click="prev" aria-label="Previous">‹</button>
        <div ref="scroller" class="albums-scroller" @scroll="onScroll">
          <article class="album" v-for="album in albums" :key="album.id">
              <div class="thumb">
                <img v-if="album.sampleUrl" :src="album.sampleUrl" alt="thumb" class="thumb-img" />
                <div v-else class="thumb-fallback">📷</div>
              </div>
              <h3>{{ album.title }}</h3>
              <p class="meta">{{ album.count }} photos</p>
              <a :href="`/gallery.html?album=${encodeURIComponent(album.name)}`" class="view-more">View more</a>
          </article>
        </div>
        <button v-show="showNav" class="nav next" @click="next" aria-label="Next">›</button>
      </div>
    
      <div v-if="showForm" class="modal-backdrop" @click.self="showForm = false">
        <form class="modal" @submit.prevent="createAlbum">
          <h3>Create Album</h3>
          <input v-model="newAlbumName" placeholder="Album name (no /)" />
          <div class="actions">
            <button type="button" @click="showForm = false">Cancel</button>
            <button type="submit">Create</button>
          </div>
          <p class="error" v-if="error">{{ error }}</p>
        </form>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'


const scroller = ref(null)
const showNav = ref(false)
const albums = ref([])

async function loadAlbums() {
  try {
    const res = await fetch('/api/albums')
    const data = await res.json()
    // map to local shape
    albums.value = (data.albums || []).map((a, idx) => ({ id: idx + 1, name: a.name, title: a.name, sampleUrl: a.sampleUrl, count: a.count }))
    updateNav()
  } catch (e) {
    console.error('Failed to load albums', e)
  }
}

function updateNav() {
  const el = scroller.value
  if (!el) return
  showNav.value = el.scrollWidth > el.clientWidth + 8
}

function next() {
  const el = scroller.value
  if (!el) return
  const step = Math.floor(el.clientWidth * 0.7)
  el.scrollBy({ left: step, behavior: 'smooth' })
}

function prev() {
  const el = scroller.value
  if (!el) return
  const step = Math.floor(el.clientWidth * 0.7)
  el.scrollBy({ left: -step, behavior: 'smooth' })
}

function onScroll() {
  // update nav visibility when user scrolls
  updateNav()
}

onMounted(() => {
  updateNav()
  window.addEventListener('resize', updateNav)
  loadAlbums()
})

const showForm = ref(false)
const newAlbumName = ref('')
const error = ref('')

async function createAlbum() {
  error.value = ''
  const name = (newAlbumName.value || '').trim()
  if (!name) { error.value = 'Album name is required'; return }
  if (name.includes('/')) { error.value = 'Album name cannot contain \'/\''; return }
  try {
    const res = await fetch('/api/albums', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
    if (!res.ok) {
      const body = await res.json().catch(()=>({ error: 'Failed' }))
      error.value = body.error || 'Failed to create album'
      return
    }
    // success
    showForm.value = false
    newAlbumName.value = ''
    await loadAlbums()
  } catch (e) {
    console.error(e)
    error.value = 'Network error'
  }
}
</script>

<style scoped>
.gallery-section { padding: 4.5rem 1rem; color: var(--text); }
.gallery-section .container { max-width: 1100px; margin: 0 auto; }
.subtitle { color: var(--text-h); margin-bottom: 1rem }

.carousel-wrap { position: relative; display: flex; align-items: center }
.albums-scroller { display: flex; gap: 1rem; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; padding: 0.6rem; scroll-behavior: smooth }
.albums-scroller::-webkit-scrollbar { display: none }
.album { flex: 0 0 260px; scroll-snap-align: center; background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 12px; text-align: center }
.thumb { height: 220px; border-radius: 10px; background: linear-gradient(135deg,#333,#222); display:flex; align-items:center; justify-content:center; font-size:3rem; margin-bottom:0.75rem }
.view-more { display:inline-block; margin-top: 0.75rem; color:var(--accent); text-decoration:none }

.nav { position: absolute; top: 50%; transform: translateY(-50%); width: 40px; height: 40px; border-radius: 50%; border: none; background: rgba(0,0,0,0.5); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.4rem }
.nav.prev { left: -12px }
.nav.next { right: -12px }

@media (max-width: 900px) {
  .album { flex: 0 0 72%; min-width: 72%; }
  .thumb { height: 48vw }
  .nav { display: none }
}

@media (max-width: 480px) {
  .album { min-width: 82%; }
}

</style>
