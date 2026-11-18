# APK Kiosk / Exambro — CBT SMP NEGERI 1 PANDAN

Aplikasi pembungkus Android native untuk membuka **`https://ujian-sekola.vercel.app/`** dengan proteksi ketat ujian sekolah:

1. **Ujian Hanya Melalui Aplikasi (Web Browser Diblokir)**:
   - Siswa tidak dapat memulai atau membuka soal ujian dari browser biasa (Chrome, Safari, browser WA, dll.).
   - Siswa wajib masuk dan mengerjakan ujian dari aplikasi Android Kiosk ini.
2. **Auto Screen Pinning (`startLockTask`) Tanpa Opsi Bypass**:
   - Tombol "Izinkan Tanpa Pinning" sudah dihapus sepenuhnya.
   - Jika siswa mencoba melepas Screen Pinning (`unpin`) saat ujian berlangsung, **ujian siswa langsung dianggap selesai otomatis** dan nilai dikirim ke server.
3. **Keluar Aplikasi = Ujian Langsung Selesai**:
   - Jika siswa menekan Home, pindah aplikasi, split screen, atau menutup aplikasi saat ujian berlangsung, **sesi ujian langsung selesai otomatis**.
4. **Anti-Screenshot, Anti-Rekam Layar, Anti-Copas**:
   - `FLAG_SECURE` memblokir total Screenshot & Rekam Layar di sistem Android.
   - `onActionModeStarted` & disable long-press memblokir menu Salin / Tempel / Cari Web.
   - Tombol Kembali (*Back*) dinonaktifkan dan layar tetap menyala (`keepScreenOn`).
5. **PIN Pengawas untuk Keluar**: Default PIN keluar adalah **`123456`** (dapat diubah di `MainActivity.kt` pada baris `PROCTOR_EXIT_PIN`).

---

## Cara Build Jadi File `.apk` (Gratis via GitHub — Tanpa Android Studio)

1. Unduh file **`android-kiosk.zip`** dari menu **Admin → Pengaturan Sistem**, lalu ekstrak isinya ke komputer/HP Anda.
2. Buat atau perbarui repositori di **GitHub** (misal: `exambro-smpn1-pandan`).
3. Upload seluruh isi folder hasil ekstrak tadi (pastikan folder `.github/workflows/build-apk.yml` ikut ter-upload!).
4. Buka tab **Actions** di repositori GitHub Anda → tunggu ± 2 menit hingga tanda centang hijau selesai.
5. Klik hasil build tersebut lalu unduh **`Exambro-Kiosk-SMPN1-Pandan-APK`** (di dalamnya berisi **`app-release.apk`** / **`app-debug.apk`** siap sebar ke HP siswa!).

---

## Cara Build lewat Android Studio (Jika Sudah Terpasang di Laptop)

1. Buka folder `android-kiosk` dengan **Android Studio**.
2. Tunggu Gradle Sync selesai.
3. Klik menu **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
4. File `.apk` siap pakai ada di `app/build/outputs/apk/debug/app-debug.apk`.
