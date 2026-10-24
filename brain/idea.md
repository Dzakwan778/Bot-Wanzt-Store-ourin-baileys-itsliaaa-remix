# Dokumentasi & Spesifikasi Integrasi API Payment Gateway SairiBot (SairiPedia)

Dokumen ini berisi rangkuman komprehensif hasil analisis dan pengujian langsung dari dokumentasi API Payment Gateway **SairiPedia** yang dapat diakses melalui [https://api.sairibot.my.id/docs](https://api.sairibot.my.id/docs).

---

## 1. Ringkasan Platform & Layanan

- **Nama Layanan**: SairiPedia API Payment Gateway
- **Base URL**: `https://api.sairibot.my.id`
- **Tipe Integrasi**: Lightweight REST API (berbasis HTTP `GET` query-driven)
- **Metode Pembayaran Utama**: **QRIS Dinamis (All Payment)**
  - Mendukung seluruh e-Wallet: GoPay, OVO, DANA, ShopeePay, LinkAja, AstraPay, dll.
  - Mendukung Seluruh Mobile Banking: BCA Mobile, Livin' by Mandiri, BRImo, BNI Mobile, Seabank, Bank Jago, dll.
- **Karakteristik & Keunggulan**:
  - **Aktivasi Instant**: Merchant dapat langsung menerima pembayaran QRIS tanpa verifikasi rumit berhari-hari.
  - **Arsitektur Minimalis**: Terdiri dari 3 endpoint utama yang simpel tanpa payload kompleks.
  - **Real-Time Settlement**: Pembayaran pelanggan langsung masuk ke saldo akun merchant secara otomatis.
  - **Instant Withdrawal**: Penarikan saldo dapat diproses dengan cepat melalui dashboard.

---

## 2. Autentikasi & Keamanan

### 2.1. Memperoleh API Key
1. Kunjungi [https://api.sairibot.my.id](https://api.sairibot.my.id) dan buat akun (atau login).
2. Masuk ke menu **Profil**.
3. Salin **API Key** unik akun Anda.

### 2.2. Cara Mengirimkan API Key
Backend SairiPedia mendukung autentikasi melalui dua metode:

1. **Query Parameter (Standar Resmi Dokumentasi)**:
   ```
   ?apikey=YOUR_API_KEY
   ```
2. **HTTP Header (Terverifikasi dari Pengujian Backend)**:
   ```http
   x-api-key: YOUR_API_KEY
   ```

### 2.3. Respon Error Terkait Autentikasi
| HTTP Status | Respon JSON | Keterangan |
| :--- | :--- | :--- |
| `401 Unauthorized` | `{"error": "API key diperlukan"}` | Parameter atau header `apikey` tidak disertakan dalam request. |
| `401 Unauthorized` | `{"error": "API key tidak valid"}` | `apikey` yang dikirimkan salah, tidak terdaftar, atau tidak aktif. |

> **⚠️ PENTING (Security Best Practice)**:
> Jangan pernah memanggil API SairiPedia langsung dari kode sisi klien (Frontend React/Vue/Aplikasi Mobile) menggunakan API Key Anda, karena kunci rahasia dapat dibaca oleh publik melalui inspect element/network tab. Selalu gunakan server backend sebagai proxy (Express/Node.js, Laravel, Go, dll.) dan simpan API Key di file `.env`.

---

## 3. Spesifikasi Lengkap Endpoint API

### 3.1. Cek Saldo Akun (Balance)
Digunakan untuk memeriksa saldo akun merchant secara *real-time* yang siap ditarik (withdraw).

- **Method**: `GET`
- **Endpoint**: `/api/balance`
- **URL Lengkap**: `https://api.sairibot.my.id/api/balance`

#### Parameter Request
| Nama Parameter | Tipe Data | Wajib? | Penjelasan |
| :--- | :--- | :--- | :--- |
| `apikey` | `string` | **Ya** | API Key akun merchant Anda |

#### Contoh Request
```http
GET https://api.sairibot.my.id/api/balance?apikey=YOUR_API_KEY
```

#### Contoh Respon Berhasil (`200 OK`)
```json
{
  "balance": 150000
}
```

---

### 3.2. Membuat Invoice Baru (Generate QRIS Dinamis)
Digunakan untuk membuat transaksi baru dan menghasilkan QRIS dinamis unik sesuai nominal yang ditentukan.

- **Method**: `GET`
- **Endpoint**: `/api/invoice`
- **URL Lengkap**: `https://api.sairibot.my.id/api/invoice`

#### Parameter Request
| Nama Parameter | Tipe Data | Wajib? | Penjelasan |
| :--- | :--- | :--- | :--- |
| `apikey` | `string` | **Ya** | API Key akun merchant Anda |
| `amount` | `integer` | **Ya** | Nominal dasar pembayaran dalam Rupiah (contoh: `50000`) |

#### Contoh Request
```http
GET https://api.sairibot.my.id/api/invoice?apikey=YOUR_API_KEY&amount=50000
```

#### Contoh Respon Berhasil (`200 OK`)
```json
{
  "success": true,
  "invoice_id": "64c8d9e1a2b3c4d5e6f7a8b9",
  "amount": 50000,
  "fee": 500,
  "total": 50500,
  "qris_image": "https://api.sairibot.my.id/qris/...",
  "expired_at": "2025-01-01 12:00:00"
}
```

#### Struktur Kolom Respon
- `success` (`boolean`): Indikator status pembuatan invoice (`true` jika berhasil).
- `invoice_id` (`string`): ID unik transaksi yang digunakan untuk referensi pelacakan dan verifikasi status pembayaran.
- `amount` (`number`): Nominal transaksi awal yang diajukan oleh merchant/pengguna.
- `fee` (`number`): Biaya layanan transaksi / admin fee.
- `total` (`number`): Total nominal akhir yang wajib dibayar pelanggan saat memindai QRIS (`amount` + `fee`).
- `qris_image` (`string`): URL gambar QRIS dinamis yang siap ditampilkan di antarmuka pengguna (UI).
- `expired_at` (`string`): Batas waktu toleransi pembayaran QRIS (format: `YYYY-MM-DD HH:mm:ss`).

---

### 3.3. Cek Status Invoice (Verifikasi Pembayaran)
Setelah invoice dibuat dan pengguna memindai QRIS, endpoint ini dipanggil untuk mengecek apakah pembayaran telah berhasil diselesaikan oleh pembeli.

- **Method**: `GET`
- **Endpoint**: `/api/invoice/status`
- **URL Lengkap**: `https://api.sairibot.my.id/api/invoice/status`

#### Parameter Request
| Nama Parameter | Tipe Data | Wajib? | Penjelasan |
| :--- | :--- | :--- | :--- |
| `apikey` | `string` | **Ya** | API Key akun merchant Anda |
| `invoice_id` | `string` | **Ya** | ID invoice yang didapatkan saat pembuatan invoice |

#### Contoh Request
```http
GET https://api.sairibot.my.id/api/invoice/status?apikey=YOUR_API_KEY&invoice_id=64c8d9e1a2b3c4d5e6f7a8b9
```

#### Contoh Respon Berhasil (`200 OK`)
```json
{
  "invoice_id": "64c8d9e1a2b3c4d5e6f7a8b9",
  "amount": 50000,
  "fee": 500,
  "total": 50500,
  "status": "paid",
  "qris_image": "https://api.sairibot.my.id/qris/...",
  "expired_at": "2025-01-01 12:00:00",
  "created_at": "2025-01-01 11:30:00"
}
```

#### Nilai Status Transaksi (`status`)
| Status | Penjelasan |
| :--- | :--- |
| `unpaid` / `pending` | Pengguna belum melakukan transfer/scan atau pembayaran belum terkonfirmasi oleh sistem bank. |
| `paid` | Pembayaran telah lunas diterima. Saldo telah masuk ke akun merchant, proses pemenuhan pesanan dapat dijalankan. |
| `expired` | Waktu pembayaran telah melewati `expired_at` dan transaksi dibatalkan secara otomatis. |

---

## 4. Alur Kerja Integrasi Sistem (Lifecycle & Polling)

Karena API SairiPedia berfokus pada kesederhanaan (tidak mewajibkan webhook URL yang rumit), arsitektur integrasinya menggunakan alur **Long Polling / Periodic Interval Checking**:

```
[ Pelanggan / User ]         [ Backend Aplikasi Anda ]          [ API SairiPedia ]
        |                               |                              |
        | 1. Memilih Produk & Bayar     |                              |
        |------------------------------>|                              |
        |                               | 2. GET /api/invoice          |
        |                               |    ?apikey=KEY&amount=TOTAL  |
        |                               |----------------------------->|
        |                               | 3. Kembalikan Invoice Data   |
        |                               |<-----------------------------|
        | 4. Tampilkan Gambar QRIS      |                              |
        |<------------------------------|                              |
        |                               |                              |
        | 5. Pelanggan Scan & Bayar     |                              |
        |    (via e-wallet / m-banking) |                              |
        |                               | 6. Interval Polling (tiap 3-5 detik)
        |                               |    GET /api/invoice/status   |
        |                               |----------------------------->|
        |                               |<-----------------------------|
        |                               |    Response: "status": "unpaid"
        |                               |                              |
        |                               |    ... (Setelah bayar) ...   |
        |                               |    GET /api/invoice/status   |
        |                               |----------------------------->|
        |                               |<-----------------------------|
        |                               |    Response: "status": "paid"|
        |                               |                              |
        | 7. Notifikasi Pembayaran      | 8. Update DB (Order Success) |
        |    Berhasil (Lunas)           |    & Kirim Produk/Fitur      |
        |<------------------------------|------------------------------|
```

### Tips Pengaturan Polling:
1. **Interval**: Atur interval polling status antara **3 sampai 5 detik** agar tidak terjadi rate-limiting namun tetap responsif bagi pengguna.
2. **Auto-Stop saat Expired**: Bandingkan waktu sekarang dengan `expired_at`. Jika waktu telah lewat atau status bernilai `expired`, hentikan interval pengecekan dan infokan kepada pembeli bahwa transaksi telah kedaluwarsa.
3. **Auto-Stop saat Paid**: Segera hentikan polling saat status `paid` diterima untuk menghemat resource server.

---

## 5. Contoh Implementasi Kode (Production-Ready)

### 5.1. Implementasi Node.js / TypeScript (Service Class)

```typescript
// services/sairiPayment.ts

interface CreateInvoiceResponse {
  success: boolean;
  invoice_id: string;
  amount: number;
  fee: number;
  total: number;
  qris_image: string;
  expired_at: string;
}

interface InvoiceStatusResponse {
  invoice_id: string;
  amount: number;
  fee: number;
  total: number;
  status: 'unpaid' | 'pending' | 'paid' | 'expired';
  qris_image: string;
  expired_at: string;
  created_at: string;
}

export class SairiPaymentService {
  private baseUrl = 'https://api.sairibot.my.id';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Cek saldo akun SairiPedia
   */
  async getBalance(): Promise<number> {
    const url = `${this.baseUrl}/api/balance?apikey=${encodeURIComponent(this.apiKey)}`;
    const response = await fetch(url);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `HTTP error ${response.status}`);
    }
    const data = await response.json();
    return data.balance;
  }

  /**
   * Buat invoice QRIS dinamis baru
   */
  async createInvoice(amount: number): Promise<CreateInvoiceResponse> {
    if (amount <= 0) {
      throw new Error('Nominal amount harus lebih besar dari 0');
    }
    const url = `${this.baseUrl}/api/invoice?apikey=${encodeURIComponent(this.apiKey)}&amount=${amount}`;
    const response = await fetch(url);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Gagal membuat invoice: HTTP ${response.status}`);
    }
    return await response.json();
  }

  /**
   * Cek status pembayaran transaksi
   */
  async checkInvoiceStatus(invoiceId: string): Promise<InvoiceStatusResponse> {
    const url = `${this.baseUrl}/api/invoice/status?apikey=${encodeURIComponent(this.apiKey)}&invoice_id=${encodeURIComponent(invoiceId)}`;
    const response = await fetch(url);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Gagal cek status: HTTP ${response.status}`);
    }
    return await response.json();
  }
}
```

---

### 5.2. Implementasi Python

```python
import requests

class SairiPayment:
    BASE_URL = "https://api.sairibot.my.id"

    def __init__(self, api_key: str):
        self.api_key = api_key

    def get_balance(self):
        url = f"{self.BASE_URL}/api/balance"
        resp = requests.get(url, params={"apikey": self.api_key})
        resp.raise_for_status()
        return resp.json().get("balance", 0)

    def create_invoice(self, amount: int):
        url = f"{self.BASE_URL}/api/invoice"
        resp = requests.get(url, params={"apikey": self.api_key, "amount": amount})
        resp.raise_for_status()
        return resp.json()

    def check_status(self, invoice_id: str):
        url = f"{self.BASE_URL}/api/invoice/status"
        resp = requests.get(url, params={"apikey": self.api_key, "invoice_id": invoice_id})
        resp.raise_for_status()
        return resp.json()
```

---

### 5.3. Contoh Request cURL

```bash
# 1. Cek Saldo
curl -X GET "https://api.sairibot.my.id/api/balance?apikey=YOUR_API_KEY"

# 2. Buat Invoice QRIS
curl -X GET "https://api.sairibot.my.id/api/invoice?apikey=YOUR_API_KEY&amount=25000"

# 3. Cek Status Invoice
curl -X GET "https://api.sairibot.my.id/api/invoice/status?apikey=YOUR_API_KEY&invoice_id=INVOICE_ID"
```

---

## 6. Rangkuman & Rekomendasi Integrasi

1. **Format Request Seragam**: Semua interaksi API saat ini menggunakan protokol `HTTP GET` dengan query parameters.
2. **Kesesuaian Fitur**: Sangat cocok untuk:
   - Bot WhatsApp / Telegram transaksi otomatis.
   - Toko digital, top up voucher game, dan sistem deposit saldo member.
   - SaaS atau donasi instan.
3. **Penyimpanan Lokal**: Rekomendasikan menyimpan riwayat setiap transaksi ke database lokal dengan schema:
   - `order_id` (ID pesanan lokal)
   - `sairi_invoice_id` (ID invoice dari SairiPedia)
   - `user_id` / `phone_number`
   - `amount` (Nominal produk)
   - `fee` (Biaya admin)
   - `total` (Total tagihan QRIS)
   - `qris_image_url`
   - `status` (`pending`, `paid`, `expired`)
   - `created_at` & `expired_at`
