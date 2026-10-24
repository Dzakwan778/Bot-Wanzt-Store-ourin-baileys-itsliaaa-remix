# Langkah Implementasi (langkah_implementasi.md)

Dokumen ini mencatat rencana aksi teknis yang **akan dilakukan (belum dieksekusi)**. Dokumen ini berfokus pada penjelasan **apa yang akan dilakukan** dan **bagaimana cara mengimplementasikannya secara rinci**, bukan melaporkan apa yang telah diubah.

---

## 📌 Format Penulisan Langkah Implementasi

Setiap ada tugas atau fitur baru yang akan dikerjakan, susun dengan format berikut:

```markdown
### [Fitur / Tugas yang Akan Dikerjakan]
1. **Tujuan & Deskripsi**: 
   Penjelasan ringkas mengenai fitur yang akan dibuat atau diubah.
2. **File Target**:
   Daftar file yang akan disentuh atau dibuat baru.
3. **Detail Rencana Implementasi (How-To)**:
   - Langkah 1: ...
   - Langkah 2: ...
   - Langkah 3: ...
4. **Metode Validasi & Pengujian**:
   Cara menguji apakah implementasi berhasil tanpa error.
```

---

## ⏳ Rencana Implementasi Aktif: Penambahan Saldo Payment Gateway (Sairi) pada StoreProfileHeader

### [Penambahan Saldo Payment Gateway (Sairi) di bawah Saldo Anda pada StoreProfileHeader]
1. **Tujuan & Deskripsi**:
   - Menambahkan kotak/baris metrik **"Saldo Payment Gateway"** di komponen `StoreProfileHeader` (`src/components/layout/StoreProfileHeader.tsx`), tepat di bawah kotak "Saldo Anda" (yang menampilkan saldo Xaviera).
   - Menghubungkan metrik ini dengan API SairiPedia (`/api/sairi/balance`) agar saldo akun merchant Sairi pengguna dapat dipantau langsung dari header profil toko.
   - Memberikan tombol refresh instan untuk memperbarui saldo Sairi secara mandiri maupun sinkronisasi otomatis saat API Key Sairi disimpan.
   - Jika API Key Sairi belum diisi, menampilkan tautan / status badge "Belum Diatur" yang dapat diklik untuk langsung mengarahkan pengguna ke Tab Connection.

2. **File Target**:
   - `/src/types/dashboard.types.ts`: Memastikan `SairiBalanceState` terdefinisi dengan lengkap (`loading`, `configured`, `balance`, `error`).
   - `/src/hooks/useSairiData.ts` (File Baru):
     - Custom hook untuk mengelola state saldo Sairi (`sairiBalanceState`), fungsi `fetchSairiBalance()`, serta sinkronisasi otomatis saat `sairiApiKey` dan `sairiBaseUrl` berubah.
   - `/src/components/layout/StoreProfileHeader.tsx`:
     - Menambahkan props `sairiBalance: SairiBalanceState` dan `onRefreshSairi: () => void`.
     - Mendesain elemen visual kotak "Saldo Payment Gateway" tepat di bawah "Saldo Anda" dengan icon QRIS/Wallet, badge emerald/hijau, formatting nominal Rupiah, tombol refresh putar, dan indikator status API.
   - `/src/App.tsx`:
     - Memanggil hook `useSairiData` dengan parameter `storeConfig.sairiApiKey` dan `storeConfig.sairiBaseUrl`.
     - Meneruskan state `sairiData.sairiBalance` dan callback `sairiData.fetchSairiBalance` ke `StoreProfileHeader`.

3. **Detail Rencana Implementasi (How-To)**:
   - **Langkah 1: Pembuatan Hook `useSairiData.ts`**:
     - Buat hook yang memanggil endpoint `/api/sairi/balance?apikey=...&baseurl=...`.
     - Tangani status loading, error jika key salah, dan parsing angka balance.
     - Tambahkan `useEffect` yang memicu fetch setiap kali `sairiApiKey` atau `sairiBaseUrl` diperbarui.
   - **Langkah 2: Pembaruan Komponen `StoreProfileHeader.tsx`**:
     - Update interface `StoreProfileHeaderProps`:
       * `sairiBalance?: SairiBalanceState;`
       * `onRefreshSairi?: () => void;`
     - Di dalam kolom metrik kanan, tambahkan kotak metrik kedua dengan label `Saldo Payment Gateway` (icon `QrCode` / `CreditCard` warna emerald):
       * Menampilkan nilai `Rp {sairiBalance.balance.toLocaleString('id-ID')}` saat terisi.
       * Menampilkan tombol refresh `RefreshCw` khusus untuk Sairi.
       * Jika `!sairiBalance.configured`, tampilkan tombol/teks clickable "Belum Diatur" yang memanggil `onNavigateToConnection()`.
   - **Langkah 3: Integrasi di `App.tsx`**:
     - Sambungkan hook `useSairiData` dan salurkan ke props `<StoreProfileHeader />`.
   - **Langkah 4: Validasi & Dokumentasi**:
     - Jalankan `compile_applet` dan `lint_applet`.
     - Catat hasil implementasi di `brain/progress.md` dan `README.md`.

4. **Metode Validasi & Pengujian**:
   - Membuka halaman dashboard dan mengecek tampilan StoreProfileHeader.
   - Memastikan terdapat dua kotak saldo yang tertata rapi:
     1. Saldo Anda (Xaviera Store)
     2. Saldo Payment Gateway (SairiPedia QRIS)
   - Menguji klik tombol refresh pada Saldo Payment Gateway untuk memastikan fetch berjalan.
   - Menguji navigasi ke Tab Connection saat saldo belum diisi.

