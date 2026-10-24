# Jadwal & Perencanaan Proyek (schedule.md)

Dokumen ini mencatat rencana kerja, roadmap fitur, target tonggak pencapaian (*milestones*), dan penjadwalan integrasi sistem untuk proyek **WhatsApp Bot Store Manager & Dashboard**.

---

## 🗺️ Roadmap & Rencana Pengembangan

### 1. Rencana Integrasi Payment Gateway SairiPedia & Xaviera (Privacy-First Flow)
- **Status Rencana**: Selesai Diimplementasikan (Completed) - Form API Sairi aktif di Tab Connection & Alur Transaksi Privacy-First berjalan otomatis.
- **Alur Transaksi yang Direncanakan (User Requirement)**:
  1. **Trigger Pembelian di Grup**: Pembeli melakukan interaksi pemesanan melalui grup WhatsApp (`@g.us`).
  2. **Kirim Carousel Varian**: Bot merespon di grup dengan menampilkan kartu horizontal carousel varian produk yang dipilih.
  3. **Pemilihan Varian & Klik Order**: Pembeli memilih varian dan menekan tombol Order pada kartu varian.
  4. **Pre-check Saldo Utama Xaviera**: Bot memeriksa apakah saldo akun utama di API Xaviera mencukupi untuk memproses varian tersebut ke supplier.
  5. **Pengiriman Invoice QRIS ke Chat Pribadi (DM)**:
     - Jika saldo Xaviera cukup, bot membuat invoice QRIS via SairiPedia API (`/api/invoice`).
     - Bot mengirimkan invoice lengkap (gambar QRIS, Invoice ID, Amount, Fee, Total, dan Waktu Kedaluwarsa) **secara pribadi (DM/PM) ke nomor pembeli**, BUKAN di grup.
     - Di grup, bot hanya mengirimkan notifikasi singkat bahwa invoice telah dikirim ke chat pribadi pembeli.
  6. **Pembayaran oleh Pembeli**: Pembeli melakukan scan dan pembayaran QRIS.
  7. **Validasi & Polling Pembayaran**: Bot melakukan validasi status pembayaran ke API SairiPedia (`/api/invoice/status`) tiap 4 detik.
  8. **Request Pemesanan ke Xaviera**: Setelah pembayaran lunas (`paid`), bot memproses order ke supplier.
  9. **Pengiriman Detail Produk Sensitif via DM**: Bot mengirimkan output produk (seperti akun APK Premium: email, password, profil, panduan) **secara ketat melalui chat pribadi pembeli** agar kredensial rahasia tidak bocor ke publik grup.

### 2. Peningkatan Fitur Bot WhatsApp & Manajemen Toko
- **Status Rencana**: Tahap perencanaan.
- **Rencana Pekerjaan**:
  - [ ] Penambahan konfigurasi timeout dan auto-retry socket connection.
  - [ ] Penyempurnaan filter pencarian produk pada katalog dashboard.
  - [ ] Export dan import file konfigurasi database JSON untuk backup berkala.

---

## 📅 Log Perencanaan Diskusi
Setiap ada ide rencana baru dari hasil diskusi atau instruksi pengguna, daftarkan ke tabel perencanaan di bawah ini:

| Tanggal | Topik Perencanaan | Rincian Rencana | Target Penyelesaian | Status |
| :--- | :--- | :--- | :--- | :--- |
| 2026-10-23 | Integrasi Payment Gateway QRIS | Menerapkan integrasi pembayaran otomatis via SairiPedia API | Tahap Diskusi | Selesai |
| 2026-10-23 | Alur Transaksi Privasi Grup ke DM | Alur beli di grup -> invoice QRIS ke DM -> cek saldo Xaviera -> order Xaviera -> kredensial rahasia dikirim via DM | Perencanaan Alur | Selesai |
| 2026-10-24 | Form API Sairi di Tab Connection | Menambahkan form input API Key & Base URL Sairi pada Tab Connection bersama API Xaviera | Implementasi | Selesai |
| 2026-10-23 | Standarisasi File Dokumentasi | Menerapkan 4 pilar file `idea.md`, `progress.md`, `langkah_implementasi.md`, `schedule.md` | Selesai | Aktif |

