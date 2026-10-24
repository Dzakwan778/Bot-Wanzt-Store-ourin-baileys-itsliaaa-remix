# Jadwal & Perencanaan Proyek (schedule.md)

Dokumen ini mencatat rencana kerja, roadmap fitur, target tonggak pencapaian (*milestones*), dan penjadwalan integrasi sistem untuk proyek **WhatsApp Bot Store Manager & Dashboard**.

---

## 🗺️ Roadmap & Rencana Pengembangan

### 1. Rencana Integrasi Payment Gateway SairiPedia (QRIS All Payment)
- **Status Rencana**: Ide & Spesifikasi telah selesai diriset di `brain/idea.md`.
- **Rencana Pekerjaan**:
  - [ ] Pembuatan backend route proxy (`server/controllers/paymentController.ts`) untuk endpoint `/api/pay/invoice` dan `/api/pay/status`.
  - [ ] Penambahan UI tab atau modal Checkout & Deposit di dashboard untuk simulasi scan QRIS langsung.
  - [ ] Integrasi polling status transaksi otomatis setiap 3-5 detik saat QRIS aktif.
  - [ ] Handler bot WhatsApp otomatis: kirim pesan tagihan invoice QRIS saat pengguna chat memicu perintah order/deposit.

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
| 2026-10-23 | Integrasi Payment Gateway QRIS | Menerapkan integrasi pembayaran otomatis via SairiPedia API | Tahap Diskusi | Direncanakan |
| 2026-10-23 | Standarisasi File Dokumentasi | Menerapkan 4 pilar file `idea.md`, `progress.md`, `langkah_implementasi.md`, `schedule.md` | Selesai | Aktif |
