# RizYun Landing Page - Frontend Documentation

## 📱 Features

### 1. Hero Section (Landing Page)
- **Video Background**: Full-screen portrait video (9:16 aspect ratio)
- **Dynamic Overlay**: Gradient overlay untuk readable text
- **Title Selector**: Pilih antara 3 judul:
  - RizYun
  - Mylup❤️
  - Rizky & Yuyun
- **Tagline**: "Semoga kita bisa sama sama terus sampai tua!"
- **Scroll Indicator**: Animated scroll indicator untuk user feedback
- **Responsive**: Optimal untuk mobile devices

### 2. Menu System
- **Hamburger Menu**: Click-to-open side menu
- **Smooth Animation**: Slide-in effect dari kanan
- **Menu Items**:
  - 🏠 Home
  - 📸 Galeri
  - 💕 Momen Spesial
  - 📅 Timeline
  - 💌 Pesan Cinta
  - 📞 Kontak
- **Backdrop**: Click outside untuk close menu
- **Responsive**: Mobile-friendly design

## 🚀 Quick Start

```bash
# Terminal 1: Start backend
cd /workspaces/RizYun
npm run dev

# Terminal 2: Start frontend
cd /workspaces/RizYun/frontend
npm run dev
```

Frontend akan running di: http://localhost:5174 (atau port berikutnya jika sudah terpakai)

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Hero.vue (Landing page dengan video)
│   │   └── Menu.vue (Side menu)
│   ├── App.vue (Main component)
│   ├── style.css (Global styles)
│   ├── main.js (Entry point)
│   └── api.js (API helper - untuk backend integration)
├── public/
│   ├── videos/
│   │   ├── couple.mp4 (YOUR VIDEO HERE)
│   │   ├── couple.webm (YOUR VIDEO HERE)
│   │   └── README.md (Instructions)
│   └── index.html
├── vite.config.js
└── package.json
```

## 🎥 Adding Your Video

1. **Prepare your video**:
   - Aspect Ratio: 9:16 (Portrait)
   - Resolution: 1080x1920px
   - Duration: 10-30 seconds
   - Format: MP4 + WebM (recommended)

2. **Convert video using FFmpeg** (if needed):
   ```bash
   # Convert to MP4
   ffmpeg -i input.mov -vf scale=1080:1920 -c:v libx264 -crf 23 couple.mp4
   
   # Convert to WebM
   ffmpeg -i input.mov -vf scale=1080:1920 -c:v libvpx-vp9 couple.webm
   ```

3. **Place files in**: `frontend/public/videos/`
   - `couple.mp4`
   - `couple.webm`

4. **Refresh browser** - Video akan otomatis ter-load

## 🎨 Customization

### Hero Component (src/components/Hero.vue)
- **Titles**: Edit array `titles` untuk menambah/mengubah pilihan judul
- **Tagline**: Edit variable `tagline` 
- **Colors**: Ubah gradient overlay, button colors di section `<style scoped>`
- **Animations**: Customize keyframes (fadeInDown, fadeInUp, bounce, scroll)

### Menu Component (src/components/Menu.vue)
- **Menu Items**: Edit array `menuItems` 
- **Colors**: Update background gradients dan accent colors
- **Icons**: Ganti emoji dengan icon library lain

### Global Styles (src/style.css)
- **Primary Color**: `--accent: #ff4081` (Pink)
- **Background**: `--bg: #1a1a1a` (Dark)
- **Text Color**: `--text: #fff` (White)

## 🔧 Development

### Available Commands
```bash
npm run dev      # Start dev server dengan hot reload
npm run build    # Build untuk production
npm run preview  # Preview production build
```

### Useful Tools
- **Vite DevTools**: Browser console F12 untuk debugging
- **Vue DevTools**: Browser extension untuk Vue debugging
- **Network Tab**: Check video loading

## 📱 Mobile Optimization

Landing page sudah fully responsive:
- Desktop (> 768px): Optimized layout
- Tablet (768px - 480px): Adjusted font sizes & spacing
- Mobile (< 480px): Compact layout, readable text

## 🐛 Troubleshooting

### Video tidak ter-load?
1. Cek file path: `frontend/public/videos/couple.webm`
2. Cek browser console (F12) untuk error messages
3. Pastikan video format supported (MP4 + WebM)

### Menu tidak muncul?
1. Refresh halaman (Ctrl+F5)
2. Cek browser console untuk errors
3. Pastikan JavaScript enabled

### Styling tidak muncul?
1. Hard refresh (Ctrl+Shift+R)
2. Clear browser cache
3. Restart dev server

## 📚 Resources

- [Vue 3 Documentation](https://vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [MDN Video Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video)
- [CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/animation)

## 💡 Future Features (To-Do)

- [ ] Gallery section dengan pagination
- [ ] Timeline interaktif
- [ ] Comment/message feature
- [ ] Photo upload
- [ ] Dark/Light mode toggle
- [ ] Sharing buttons
- [ ] Music/Audio background
- [ ] Counter untuk hari bersama

---

**Created with ❤️ for your love story**
