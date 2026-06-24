# 🎀 RizYun - Love Story Web App

A beautiful, modern web application for sharing your love story with interactive features.

## ✨ What's New

### Landing Page Features
- ✅ **Full-screen Video Hero**: Portrait video background with smooth overlay
- ✅ **Dynamic Title Selector**: Choose between:
  - RizYun
  - Mylup❤️
  - Rizky & Yuyun
- ✅ **Romantic Tagline**: "Semoga kita bisa sama sama terus sampai tua!"
- ✅ **Smooth Animations**: Fade-in effects, scroll indicator, bounce animations
- ✅ **Side Menu**: Beautiful hamburger menu with 6 navigation items
- ✅ **Mobile Responsive**: Perfect on all device sizes

## 🏗️ Project Structure

```
RizYun/
├── app.js (Express Backend)
├── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Hero.vue (Landing page)
│   │   │   └── Menu.vue (Navigation)
│   │   ├── App.vue
│   │   ├── style.css
│   │   └── api.js
│   ├── public/
│   │   ├── videos/
│   │   │   ├── couple.webm (ADD YOUR VIDEO HERE)
│   │   └── index.html
│   └── package.json
└── package.json
```

## 🚀 Getting Started

### 1. Start Backend (Express)
```bash
cd /workspaces/RizYun
npm run dev
```
Backend running on: http://localhost:3000

### 2. Start Frontend (Vite + Vue)
```bash
cd /workspaces/RizYun/frontend
npm run dev
```
Frontend running on: http://localhost:5174

## 🎥 Add Your Video

1. **Prepare your video**:
   - Format: MP4 or WebM
   - Aspect Ratio: 9:16 (Portrait)
   - Resolution: 1080x1920px
   - Duration: 10-30 seconds

2. **Place in**: `frontend/public/videos/`
   - `couple.mp4` (MP4 format)
   - `couple.webm` (WebM format - optional but recommended)

3. **Details**: See [frontend/public/videos/README.md](frontend/public/videos/README.md)

## 🎨 Customization

### Change Title Options
Edit `frontend/src/components/Hero.vue`:
```javascript
const titles = [
  { id: 1, name: 'RizYun', label: 'RizYun' },
  { id: 2, name: 'Mylup❤️', label: 'Mylup❤️' },
  { id: 3, name: 'Rizky & Yuyun', label: 'Rizky & Yuyun' }
]
```

### Change Tagline
Edit `frontend/src/components/Hero.vue`:
```javascript
const tagline = "Your custom tagline here!"
```

### Change Colors
Edit `frontend/src/style.css`:
```css
:root {
  --accent: #ff4081; /* Pink color */
  --bg: #1a1a1a; /* Dark background */
  --text: #fff; /* White text */
}
```

## 📱 Features Roadmap

- [x] Landing page with video hero
- [x] Title selector (3 options)
- [x] Side menu navigation
- [ ] Gallery section
- [ ] Timeline feature
- [ ] Message/Comment system
- [ ] Share buttons
- [ ] Countdown timer
- [ ] Dark/Light mode

## 🔧 Tech Stack

**Frontend**:
- Vue.js 3
- Vite (Build tool)
- CSS3 (Animations & Responsive design)

**Backend**:
- Express.js
- Node.js
- dotenv (Environment variables)

## 📚 Documentation

- [Frontend Guide](frontend/FRONTEND.md)
- [Video Setup](frontend/public/videos/README.md)
- [API Helper](frontend/src/api.js)

## 💝 Notes

- All animations are smooth and GPU-accelerated
- Mobile-first design approach
- Dark theme perfect for romantic vibes
- Video auto-loops seamlessly

## 🎯 Next Steps

1. Add your couple video to `frontend/public/videos/`
2. Customize titles and tagline in Hero component
3. Explore menu items and add more pages
4. Deploy when ready!

---

**Made with ❤️ by Copilot**

Last Updated: 2026-06-24
