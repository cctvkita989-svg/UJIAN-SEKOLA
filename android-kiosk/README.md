# APK Kiosk / Exambro — CBT SMP NEGERI 1 PANDAN

Aplikasi pembungkus Android native untuk membuka **`https://ujian-sekola.vercel.app/`** dengan proteksi ujian tanpa memerlukan Device Owner:

1. **Auto Screen Pinning (`startLockTask`)**: Saat dibuka, aplikasi otomatis meminta siswa menyematkan aplikasi (*Pin App*). Jika siswa menolak atau melepas sematan, layar ujian langsung tertutup blokir sampai disematkan kembali.
2. **Kembali ke Layar Kunci saat Dilepas**: Sesuai perilaku resmi Android Screen Pinning, melepas pinning saat ujian mengunci layar HP (atau memicu deteksi pelanggaran jika kembali ke aplikasi), dan membuka ikon aplikasi langsung kembali ke sesi ujian.
3. **Anti-Screenshot, Anti-Rekam Layar, Anti-Copas**:
   - `FLAG_SECURE` memblokir total Screenshot & Rekam Layar di sistem Android.
   - `onActionModeStarted` & disable long-press memblokir menu Salin / Tempel / Cari Web.
   - Tombol Kembali (*Back*) dinonaktifkan, layar tidak bisa *split-screen*, dan layar tetap menyala (`keepScreenOn`).
4. **PIN Pengawas untuk Keluar**: Default PIN keluar adalah **`123456`** (dapat diubah di `MainActivity.kt` pada baris `PROCTOR_EXIT_PIN`).

---

## Cara Paling Mudah Jadi File `.apk` (Gratis via GitHub — Tanpa Android Studio)

1. Unduh file **`android-kiosk.zip`** dari menu **Admin → Pengaturan Sistem**, lalu ekstrak isinya ke komputer/HP Anda.
2. Buat repositori baru di **GitHub** (misal: `exambro-smpn1-pandan`).
3. Upload seluruh isi folder hasil ekstrak tadi (pastikan folder `.github/workflows/build-apk.yml` ikut ter-upload!).
4. Buka tab **Actions** di repositori GitHub Anda → tunggu ± 2 menit hingga tanda centang hijau selesai.
5. Klik hasil build tersebut lalu unduh **`Exambro-Kiosk-SMPN1-Pandan-APK`** (di dalamnya berisi **`app-release.apk`** / **`app-debug.apk`** siap sebar ke HP siswa!).

---

## Cara Build lewat Android Studio (Jika Sudah Terpasang di Laptop)

1. Buka folder `android-kiosk` dengan **Android Studio**.
2. Tunggu Gradle Sync selesai.
3. Klik menu **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
4. File `.apk` siap pakai ada di `app/build/outputs/apk/debug/app-debug.apk`.
