<!-- VIDEO PLACEHOLDER GUIDE -->

Untuk menambahkan video kalian:

1. Simpan video dalam format WebM di folder: frontend/public/videos/
   - couple.webm (format WebM)

2. Pastikan video sudah dalam format portrait (9:16 ratio adalah ideal untuk mobile)

3. Video akan otomatis ter-load di Hero component

Rekomendasi format video:
- Resolution: 1080 x 1920px (9:16 aspect ratio)
- Format: WebM (VP9 codec)
- Frame rate: 30fps
- Durasi: 10-30 detik (auto loop)
- File size: 5-15MB per file

Tools yang bisa digunakan:
- FFmpeg: untuk convert dan compress video
- HandBrake: GUI tool untuk encoding

Contoh FFmpeg command untuk convert ke WebM:
ffmpeg -i input_video.mov -vf scale=1080:1920 -c:v libvpx-vp9 -b:v 0 -crf 30 couple.webm
