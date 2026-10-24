# Status Progres Proyek: WhatsApp Bot Store Manager (Wanzt Store)

Dokumen ini berfungsi sebagai panduan serah terima status proyek untuk pengembang / AI selanjutnya agar pekerjaan dapat dilanjutkan tanpa kehilangan konteks.

---

## 📌 Ringkasan Proyek
Aplikasi berbasis React + Tailwind CSS dengan backend terintegrasi Vite middleware menggunakan library `@itsliaaa/baileys`.
Aplikasi ini mengatur bot WhatsApp toko otomatis dengan fitur:
- Tombol Interaktif Native Flow (`cta_url`, `quick_reply`, `cta_call`, `cta_copy`, `vcard`, `cta_reminder`, `cta_cancel_reminder`).
- Command Menu, Command List (Katalog Layanan), dan Command Carousel Produk.
- Integrasi Xaviera API untuk profil, produk digital/SMM/game otomatis murni tanpa data cadangan lokal palsu.
- Sistem modular JSON database di folder `/database/`.
- Manajemen Whitelist Grup WhatsApp (toggle aktif/nonaktif fungsi bot per grup).
- Arsitektur Komponen Modular: Dashboard terpisah ke dalam komponen-komponen terisolasi (`layout/`, `connection/`, `terminal/`, `tabs/`, `modals/`).

---

## ✅ Fitur yang Telah Selesai (Completed)
1. **Refactoring & Modularisasi Komponen UI Dashboard (`src/App.tsx`)**:
   - Berhasil memecah file `src/App.tsx` yang sebelumnya berukuran >4.300 baris menjadi struktur komponen modular yang rapi dan mudah dirawat:
     - `src/types/dashboard.types.ts`: Tipe data bersama TypeScript (`LogEntry`, `BotStatusResponse`, `WhatsAppButton`, `StoreInfoConfig`, `PremiumProduct`, `SmmService`, `TopUpItem`, `WhatsAppGroupItem`, `XavieraProfileState`, helper `detectSmmPlatform`).
     - `src/components/layout/Navbar.tsx`: Top bar navigasi, ikon profil avatar (`User`), status badge koneksi.
     - `src/components/layout/StoreProfileHeader.tsx`: Kartu profil toko, judul dinamis `<h1>`, saldo Xaviera, dan status akun.
     - `src/components/connection/WhatsAppConnectionPanel.tsx`: Form pairing WhatsApp (+62, kode 8 digit, tombol aksi, petunjuk penautan).
     - `src/components/terminal/LiveTerminal.tsx`: Terminal log soket stream dengan warna tipe pesan dan catatan teknis.
     - `src/components/tabs/TabStoreInfo.tsx`: Form identitas toko, kontak owner, admin, link website/telegram, kartu live preview.
     - `src/components/tabs/TabCommand.tsx`: Pengaturan command Menu, List, dan Carousel (textarea respon, placeholder chips, pemilih media, manajemen tombol WhatsApp, preview simulasi carousel).
     - `src/components/tabs/TabProduk.tsx`: Tabel katalog akun & aplikasi premium, filter kategori, search bar, kalkulasi margin +10%.
     - `src/components/tabs/TabSsm.tsx`: Tabel katalog layanan Social Media Marketing (TikTok, IG, YT, dll), pagination, search bar, kalkulasi margin.
     - `src/components/tabs/TabTopUp.tsx`: Tabel paket top up game dan voucher digital, badge server, filter kategori, pagination.
     - `src/components/tabs/TabConnection.tsx`: Konfigurasi API Key & Base URL Xaviera Store, toggle show/hide key, panduan endpoint.
     - `src/components/tabs/TabGrup.tsx`: Tabel whitelist grup WhatsApp, toggle switch aktif/nonaktif bot per grup, salin JID grup, sinkronisasi grup.
     - `src/components/modals/AddEditButtonModal.tsx`: Modal popup tambah dan edit tombol interaktif WhatsApp (6 tipe tombol native flow).
     - `src/App.tsx`: Kini ramping, bersih (~500 baris), hanya menangani *state management*, polling interval, dan API handlers.
2. **Penghapusan Teks Mesin Baileys di Terminal Log**:
   - Teks footer `"Mesin: @itsliaaa/baileys (Carousel & Native Flow)"` pada terminal log dashboard telah dihapus.
3. **Penyesuaian Label Profil & Saldo**:
   - Label profil ("INFO PROFIL ANDA") dan saldo ("Saldo Anda") disesuaikan.
4. **Penggantian Nomor Default Menjadi `81234567890`**:
   - Nomor telepon default pairing bot di `src/App.tsx` serta `database/store_info.json` (`ownerNumber`) menggunakan `81234567890`.
5. **Penggantian Logo "WS" di Header Top Bar Menjadi Avatar Profil (`User` Icon)**:
   - Kotak teks "WS" di pojok kiri atas header top bar diganti dengan ikon avatar profil kosong (`User` dari `lucide-react`).
6. **Penghapusan Span Username Xaviera di Header**:
   - Elemen `span` kedua (`@{xavieraProfile.data?.username}`) pada header informasi toko telah dihapus.
7. **Perubahan Teks Header Top Bar Menjadi "Dashboard Bot WhatsApp"**:
   - Teks branding pada bilah navigasi atas (*top bar header*) adalah **"Dashboard Bot WhatsApp"**.
8. **Sinkronisasi Nama Toko Dinamis pada Judul Header (`<h1>`)**:
   - Judul utama dashboard pada header atas (`<h1>`) disinkronkan langsung dengan `storeInfo.storeName` dari tab Store Info (`database/store_info.json`).
9. **Implementasi Sistem Whitelist Grup WhatsApp**:
   - Status toggle grup di tab "Grup" mengontrol whitelist izin bot di grup WhatsApp. Jika toggle nonaktif, bot tidak merespon apapun di grup tersebut.
10. **Penghapusan Seluruh Data Cadangan Lokal (Pure Live API Mode)**:
    - Data produk, SMM, dan Top Up murni berasal dari API Xaviera.
11. **Implementasi Tab "Grup" (Sebelumnya `tab04`)**:
    - Tab navigation menggunakan tab **`Grup`** dengan ikon `Users`.
12. **Perbaikan Tombol WhatsApp `cta_url` (Native Flow)**:
    - Format `nativeFlow` resmi `@itsliaaa/baileys` dengan `buttonParamsJson`.
13. **Pembersihan Form Duplikat `quick_reply`**:
    - Form ganda pada modal Tambah/Edit Tombol WhatsApp telah dibersihkan.
14. **Penyimpanan Modular Database**:
    - `database/store_info.json`, `database/command_menu.json`, `database/command_list.json`, `database/command_carousel.json`, `database/api_config.json`, `database/groups_config.json`.
15. **Pembersihan Tombol Default Menu & Nilai Awal Store Info**:
    - Seluruh tombol bawaan menu (`menuButtons`) pada file `database/command_menu.json`, `commands_config.json`, dan `server/config/configManager.ts` telah dikosongkan.
    - Nilai default `storeInfo` pada `database/store_info.json` dan `server/config/configManager.ts` telah dikosongkan.
17. **Ekstraksi Logika Bisnis & State ke Custom React Hooks**:
    - Seluruh state management dan fungsi API yang sebelumnya menumpuk di `App.tsx` telah dipisahkan ke dalam 5 dedicated custom hooks di `src/hooks/`:
      - `useBotConnection.ts`: Manajemen koneksi WhatsApp bot, pairing code, dan polling socket.
      - `useXavieraData.ts`: Manajemen data integrasi Xaviera API (profil, produk, SMM, game).
      - `useWhatsAppGroups.ts`: Manajemen whitelist grup WhatsApp dan toggle izin bot.
      - `useStoreConfig.ts`: Manajemen konfigurasi template command, media, dan sinkronisasi server.
      - `useButtonModal.ts`: Manajemen form modal tambah/edit tombol WhatsApp native flow.
    - File `src/App.tsx` berhasil dipadatkan hingga hanya tersisa ~340 baris yang bersih dan sangat mudah dikembangkan.
18. **Pembersihan Default Custom Pairing Code**:
    - Nilai `DEFAULT_CUSTOM_CODE` pada `server/types/bot.types.ts` dan `server/botManager.ts` telah diubah menjadi string kosong (`''`).
    - Seluruh fallback teks statis `WANZTSTR` pada form, tombol submit, dan kotak display kode pairing telah dihapus sehingga input kode pairing benar-benar kosong secara default.
19. **Pemisahan Tab Content Renderer & Penciutan `App.tsx` ke 200 Baris**:
    - Seluruh routing percabangan konten tab (`<TabStoreInfo>`, `<TabCommand>`, `<TabProduk>`, dll.) dipisahkan ke `src/components/tabs/TabContentRenderer.tsx`.
    - Tidak ada lagi logika bisnis, fetch, atau percabangan tab yang menumpuk di `App.tsx`.
    - `src/App.tsx` berkurang drastis dari 4.381 baris (awalnya) menjadi **200 baris** murni sebagai root layout dan hook orchestrator.
20. **Validasi & Pesan Peringatan Custom Pairing Code**:
    - **Pesan Kolom Kosong**: Menampilkan pesan peringatan berwarna kuning (amber) langsung di bawah kolom form dan toast jika pairing code belum diisi (`Form pairing code belum diisi! Silakan isi kolom kode pairing (8 karakter huruf/angka) untuk melakukan koneksi.`).
    - **Pesan Simbol Dilarang**: Menampilkan pesan error berwarna merah (rose) jika input mengandung simbol atau spasi (`Custom pairing code tidak sesuai! Dilarang menggunakan simbol atau spasi (hanya angka dan huruf saja).`).
    - **Pesan Panjang Karakter**: Menghitung karakter secara real-time dan menampilkan pesan jika panjang belum tepat 8 karakter (`Custom pairing code tidak sesuai! Wajib tepat 8 karakter (saat ini X karakter).`).
    - **Konfirmasi Valid**: Menampilkan pesan hijau saat tepat 8 karakter alfanumerik.
    - Validasi diterapkan berlapis di UI (`WhatsAppConnectionPanel.tsx`), hook client (`useBotConnection.ts`), serta backend (`server/botManager.ts` & `vite.config.ts`).
21. **State Tombol Nonaktif & Berwarna Abu-Abu**:
    - Tombol permintaan kode pairing (`Minta Kode Pairing`) otomatis dinonaktifkan (`disabled={true}`) dan berubah menjadi warna abu-abu (`bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed`) selama kode pairing kosong, belum mencapai 8 karakter, atau mengandung simbol.
    - Tombol hanya akan aktif dan berwarna biru langit (`bg-sky-600 hover:bg-sky-700 text-white cursor-pointer`) setelah pengguna mengisi tepat 8 karakter kombinasi huruf dan angka tanpa simbol.

---

## 📂 Struktur Folder Proyek Modular
```
src/
├── types/
│   └── dashboard.types.ts
├── hooks/
│   ├── useBotConnection.ts
│   ├── useXavieraData.ts
│   ├── useWhatsAppGroups.ts
│   ├── useStoreConfig.ts
│   └── useButtonModal.ts
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── StoreProfileHeader.tsx
│   ├── connection/
│   │   └── WhatsAppConnectionPanel.tsx
│   ├── terminal/
│   │   └── LiveTerminal.tsx
│   ├── tabs/
│   │   ├── TabContentRenderer.tsx
│   │   ├── TabStoreInfo.tsx
│   │   ├── TabCommand.tsx
│   │   ├── TabProduk.tsx
│   │   ├── TabSsm.tsx
│   │   ├── TabTopUp.tsx
│   │   ├── TabConnection.tsx
│   │   └── TabGrup.tsx
│   └── modals/
│       └── AddEditButtonModal.tsx
├── App.tsx
├── main.tsx
└── index.css
```

---

## 🚀 Prosedur AI Selanjutnya
Setiap kali diminta melakukan modifikasi:
1. **Buat Rencana Implementasi**: Jelaskan langkah dan file yang akan disentuh.
2. **Perbarui `PROGRESS.md`**: Catat rencana dan status terbaru ke dalam dokumen ini.
3. **Eksekusi Perubahan Kode**: Lakukan modifikasi kode sesuai rencana.
4. **Verifikasi**: Jalankan linter dan compiler untuk memastikan sistem berjalan tanpa error.
