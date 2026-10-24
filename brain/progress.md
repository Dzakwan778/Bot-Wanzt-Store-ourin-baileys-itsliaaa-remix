# Log Progres Perubahan (progress.md)

Dokumen ini mencatat seluruh riwayat perubahan dan pembaruan fitur yang telah selesai dilakukan pada proyek **WhatsApp Bot Store Manager & Dashboard (Wanzt Store)**.

---

## 📌 Status Terakhir Proyek
- **Status Build**: ✅ Compiled Cleanly
- **Dev Server**: Port 3000
- **Arsitektur**: React 19 + TypeScript + Vite + Tailwind CSS + Baileys Engine (`@itsliaaa/baileys`)

---

## 📋 Catatan Riwayat Perubahan (Changelog)

### [2026-10-23] - Penerapan Standar Operasional & Dokumentasi Baru
- **Dokumentasi SairiPedia API**: Selesai mempelajari, menguji endpoint backend, dan mencatat spesifikasi lengkap integrasi QRIS All Payment ke `brain/idea.md`.
- **Protokol File Tracking Baru**: Mengesahkan aturan alur kerja:
  - `brain/idea.md`: Mencatat segala hal baru/pengetahuan yang dipelajari.
  - `brain/progress.md`: Mencatat seluruh perubahan yang telah selesai dilakukan.
  - `brain/langkah_implementasi.md`: Mencatat apa yang akan dilakukan dan bagaimana cara mengimplementasikannya (sebelum dieksekusi).
  - `brain/schedule.md`: Mencatat perancangan, rencana fitur, roadmap, dan jadwal kerja.
  - `README.md`: Selalu disesuaikan dan diperbarui setiap kali terjadi perubahan.

### [2026-10-23] - Tombol Pairing Code Disabled & Visual Abu-abu
- **Tombol Nonaktif**: Tombol "Minta Kode Pairing" (`Minta Kode Pairing`) di `WhatsAppConnectionPanel.tsx` dinonaktifkan (`disabled={true}`) secara default saat kode pairing belum diisi.
- **Styling Tombol**: Tombol berwarna abu-abu (`bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed`) selama kode pairing kosong, kurang dari 8 karakter, atau mengandung simbol.
- **Aktivasi Tombol**: Tombol otomatis berubah aktif dan berwarna biru langit (`bg-sky-600 hover:bg-sky-700 text-white cursor-pointer`) tepat ketika input mencapai 8 karakter kombinasi alfanumerik valid.

### [2026-10-23] - Validasi Custom Pairing Code & Pesan Peringatan
- **Default Kosong**: Nilai bawaan custom pairing code diubah menjadi string kosong `''` di server (`botManager.ts`, `bot.types.ts`) dan form UI. Fallback `WANZTSTR` dibersihkan total.
- **Pesan Kolom Kosong**: Menampilkan peringatan amber: *"Form pairing code belum diisi! Silakan isi kolom kode pairing (8 karakter huruf/angka) untuk melakukan koneksi."*
- **Pesan Simbol Dilarang**: Menampilkan peringatan rose jika pengguna mengetik simbol/spasi: *"Custom pairing code tidak sesuai! Dilarang menggunakan simbol atau spasi (hanya angka dan huruf saja)."*
- **Pesan Panjang Karakter**: Menampilkan indikator real-time jika belum 8 karakter: *"Custom pairing code tidak sesuai! Wajib tepat 8 karakter (saat ini X karakter)."*
- **Pesan Valid**: Menampilkan indikator hijau ketika format valid dan siap request.

### [2026-10-23] - Modularisasi Arsitektur & Penciutan App.tsx
- **Ekstraksi Custom Hooks**: Logika state management dipisahkan dari `App.tsx` ke dalam 5 dedicated custom hooks:
  - `src/hooks/useBotConnection.ts`
  - `src/hooks/useXavieraData.ts`
  - `src/hooks/useWhatsAppGroups.ts`
  - `src/hooks/useStoreConfig.ts`
  - `src/hooks/useButtonModal.ts`
- **Pemisahan Tab Renderer**: Seluruh percabangan tab dipindahkan ke `src/components/tabs/TabContentRenderer.tsx`.
- **Hasil App.tsx**: Ukuran file berhasil diciutkan dari sebelumnya >4.300 baris menjadi hanya **~200 baris** sebagai root orchestrator yang bersih.

### [2026-10-23] - Pembersihan Teks Teknis & Profil Header
- Menghapus teks teknis mesin Baileys pada footer terminal.
- Menghapus teks catatan teknis penautan WhatsApp di bawah tombol pairing.
- Menghapus badge `@username` Xaviera di header dashboard.
- Mengganti teks brand menjadi "Dashboard Bot WhatsApp".
- Mengganti kotak teks "WS" menjadi ikon avatar `User`.
- Menghubungkan judul header `<h1>` dinamis dengan nama toko dari Store Info.
- Menerapkan sistem whitelist grup WhatsApp melalui tab "Grup".
