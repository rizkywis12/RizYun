<template>
  <section id="galeri" class="section gallery-section">
    <div class="container">
        <div class="header-row">
          <div>
            <h2>Galeri</h2>
            <p class="subtitle">Album terbaru</p>
          </div>
          <div>
            <button v-if="canEdit" class="add-album-btn" @click="showForm = true">+ Add Album</button>
            <p v-else class="viewer-note">Login sebagai editor untuk membuat album.</p>
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
              <div class="album-body">
                <h3>{{ album.title }}</h3>
                <p class="meta">{{ album.count }} photos</p>
              </div>
              <a :href="`/gallery.html?album=${encodeURIComponent(album.name)}`" class="view-more">View gallery</a>
          </article>
          <article v-if="albums.length === 0 && !loadError" class="album empty-card">
            <div class="thumb thumb-fallback">📁</div>
            <div class="album-body">
              <h3>No albums yet</h3>
              <p class="meta">Create your first album to start adding photos.</p>
            </div>
          </article>
        </div>
        <button v-show="showNav" class="nav next" @click="next" aria-label="Next">›</button>
      </div>
      <div v-if="loadError" class="load-error">
        <p>{{ loadError }}</p>
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

const API_URL = import.meta.env.VITE_API_URL || ''
console.log('API URL detected:', API_URL || 'relative /api path')

const scroller = ref(null)
const showNav = ref(false)
const albums = ref([])
const canEdit = ref(false)

async function checkAuth() {
  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      credentials: 'include'
    })
    const data = await res.json()
    canEdit.value = Boolean(data.authenticated && data.role === 'editor')
  } catch (e) {
    canEdit.value = false
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

async function loadAlbums() {
  try {
    loadError.value = ''
    console.log('Loading albums from:', `${API_URL}/api/albums`)
    const res = await fetch(`${API_URL}/api/albums`)
    console.log('Load albums response status:', res.status, res.ok)
    const data = await res.json()
    if (!res.ok) {
      loadError.value = data.error || `Unable to load albums: ${res.status}`
      albums.value = []
      return
    }
    console.log('Albums data:', data)
    albums.value = (data.albums || []).map((a, idx) => ({ id: idx + 1, name: a.name, title: a.name, sampleUrl: a.sampleUrl, count: a.count }))
    console.log('Mapped albums:', albums.value)
    updateNav()
  } catch (e) {
    console.error('Failed to load albums:', e)
    loadError.value = 'Network error: ' + e.message
    albums.value = []
  }
}

onMounted(() => {
  updateNav()
  checkAuth()
  window.addEventListener('resize', updateNav)
  window.addEventListener('rizyun-auth-changed', (event) => {
    const data = event.detail || {}
    canEdit.value = Boolean(data.authenticated && data.role === 'editor')
    if (!canEdit.value) {
      showForm.value = false
    }
  })
  loadAlbums()
})

const showForm = ref(false)
const newAlbumName = ref('')
const error = ref('')
const loadError = ref('')

async function createAlbum() {
  error.value = ''
  const name = (newAlbumName.value || '').trim()
  if (!name) { error.value = 'Album name is required'; return }
  if (name.includes('/')) { error.value = 'Album name cannot contain \'/\''; return }
  try {
    console.log('Creating album:', name)
    const res = await fetch(`${API_URL}/api/albums`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
    console.log('Response status:', res.status, res.ok)
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      console.log('Error response:', body)
      error.value = body.error || 'Failed to create album'
      return
    }
    console.log('Album created successfully, loading albums...')
    showForm.value = false
    newAlbumName.value = ''
    await loadAlbums()
    console.log('Albums loaded after create')
  } catch (e) {
    console.error('Exception in createAlbum:', e)
    error.value = 'Network error: ' + e.message
  }
}
</script>

<style scoped>
.gallery-section { padding: 4rem 1rem; color: var(--text); }
.gallery-section .container { max-width: 1100px; margin: 0 auto; }
.header-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem; }
.header-row h2 { margin: 0; font-size: clamp(2rem, 2.5vw, 2.75rem); }
.subtitle { color: var(--text-h); margin-bottom: 0.25rem; }
.add-album-btn { border: none; background: var(--accent); color: #fff; padding: 0.95rem 1.4rem; border-radius: 999px; cursor: pointer; transition: transform .2s ease, background .2s ease; font-weight: 600; }
.add-album-btn:hover { transform: translateY(-1px); background: #ff8b00; }
.viewer-note { margin: 0.45rem 0 0; color: var(--text-h); font-size: 0.95rem; text-align: right; }

.carousel-wrap { position: relative; display: flex; align-items: center; }
.albums-scroller { display: flex; gap: 1rem; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; padding: 1rem 0.5rem; scroll-behavior: smooth; }
.albums-scroller::-webkit-scrollbar { height: 10px; }
.albums-scroller::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.16); border-radius: 999px; }
.album { flex: 0 0 280px; scroll-snap-align: center; background: rgba(255,255,255,0.06); padding: 1.25rem; border-radius: 28px; text-align: left; border: 1px solid rgba(255,255,255,0.09); box-shadow: 0 24px 60px rgba(0,0,0,0.14); transition: transform .25s ease, border-color .25s ease; }
.album:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.18); }
.album.empty-card { min-width: 320px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; }
.album-body { display: grid; gap: 0.35rem; }
.thumb { height: 220px; border-radius: 20px; background: linear-gradient(135deg,#252525,#111); display:flex; align-items:center; justify-content:center; font-size:3rem; margin-bottom:1rem; overflow:hidden; }
.thumb-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.thumb-fallback { width: 100%; height: 100%; display:flex; align-items:center; justify-content:center; color: rgba(255,255,255,0.75); font-size: 2.6rem; }
.album h3 { margin: 0 0 0.35rem; font-size: 1.2rem; }
.album .meta { margin: 0; color: var(--text-h); font-size: 0.97rem; }
.view-more { display:inline-flex; align-items:center; justify-content:center; margin-top: 1.1rem; color: #fff; background: rgba(255,255,255,0.08); padding: 0.85rem 1rem; border-radius: 999px; text-decoration: none; border: 1px solid transparent; transition: background .2s ease, border-color .2s ease; }
.view-more:hover { background: rgba(255,255,255,0.16); border-color: rgba(255,255,255,0.2); }

.nav { position: absolute; top: 50%; transform: translateY(-50%); width: 42px; height: 42px; border-radius: 50%; border: none; background: rgba(0,0,0,0.55); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; z-index: 1; }
.nav.prev { left: -18px; }
.nav.next { right: -18px; }

.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; padding: 1.25rem; z-index: 50; }
.modal { width: min(460px, 100%); background: rgba(9, 11, 20, 0.98); border-radius: 28px; padding: 2rem; box-shadow: 0 40px 120px rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.08); }
.modal h3 { margin: 0 0 1rem; font-size: 1.6rem; }
.modal input { width: 100%; border: 1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.04); color: #fff; border-radius: 16px; padding: 0.95rem 1rem; outline: none; font-size: 1rem; margin-bottom: 1rem; }
.modal input:focus { border-color: rgba(255,255,255,0.36); }
.actions { display: flex; gap: 0.75rem; justify-content: flex-end; flex-wrap: wrap; }
.modal button { border: none; padding: 0.95rem 1.2rem; border-radius: 999px; cursor: pointer; font-weight: 600; }
.modal button[type="button"] { background: rgba(255,255,255,0.08); color: #fff; }
.modal button[type="submit"] { background: var(--accent); color: #fff; }
.modal .error { margin-top: 0.85rem; color: #ff7a7a; font-size: 0.95rem; }

.load-error {
  margin-top: 1.5rem;
  padding: 1rem 1.25rem;
  border-radius: 18px;
  background: rgba(255, 64, 129, 0.08);
  border: 1px solid rgba(255, 64, 129, 0.22);
  color: #ffb3c9;
}

@media (max-width: 900px) {
  .album { flex: 0 0 72%; min-width: 72%; }
  .thumb { height: 44vw; }
  .nav { display: none; }
}

@media (max-width: 640px) {
  .albums-scroller { padding: 1rem 0.2rem; }
  .album { min-width: 88%; flex: 0 0 88%; }
  .header-row { align-items: flex-start; }
}

</style>
