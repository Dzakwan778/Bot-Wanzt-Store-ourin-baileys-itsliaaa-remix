/**
 * Service untuk integrasi Payment Gateway SairiPedia (api.sairibot.my.id)
 * Dokumentasi: https://api.sairibot.my.id/docs
 */

export interface SairiCreateInvoiceResponse {
  success: boolean;
  invoice_id: string;
  amount: number;
  fee: number;
  total: number;
  qris_image: string;
  expired_at: string;
}

export interface SairiInvoiceStatusResponse {
  invoice_id: string;
  amount: number;
  fee: number;
  total: number;
  status: 'unpaid' | 'pending' | 'paid' | 'expired';
  qris_image: string;
  expired_at: string;
  created_at?: string;
}

export interface SairiBalanceResponse {
  balance: number;
  error?: string;
}

const DEFAULT_SAIRI_BASE_URL = 'https://api.sairibot.my.id';

/**
 * Cek saldo akun SairiPedia merchant
 */
export async function getSairiBalance(
  apiKey: string,
  baseUrl: string = DEFAULT_SAIRI_BASE_URL
): Promise<{ success: boolean; balance: number; error?: string }> {
  const cleanKey = apiKey?.trim();
  if (!cleanKey) {
    return { success: false, balance: 0, error: 'API Key Sairi belum diisi' };
  }

  const cleanBase = (baseUrl?.trim() || DEFAULT_SAIRI_BASE_URL).replace(/\/+$/, '');
  const url = `${cleanBase}/api/balance?apikey=${encodeURIComponent(cleanKey)}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        balance: 0,
        error: data.error || `HTTP ${res.status}: Gagal memverifikasi API Key Sairi`,
      };
    }

    const bal = typeof data.balance === 'number' ? data.balance : Number(data.balance || 0);
    return { success: true, balance: bal };
  } catch (err: any) {
    return {
      success: false,
      balance: 0,
      error: err?.message || 'Gagal terhubung ke server SairiPedia',
    };
  }
}

/**
 * Buat invoice QRIS dinamis baru
 */
export async function createSairiInvoice(
  apiKey: string,
  amount: number,
  baseUrl: string = DEFAULT_SAIRI_BASE_URL
): Promise<SairiCreateInvoiceResponse> {
  const cleanKey = apiKey?.trim();
  if (!cleanKey) {
    throw new Error('API Key SairiPedia belum dikonfigurasi di tab Connection.');
  }

  if (amount <= 0) {
    throw new Error('Nominal amount transaksi harus lebih besar dari 0.');
  }

  const cleanBase = (baseUrl?.trim() || DEFAULT_SAIRI_BASE_URL).replace(/\/+$/, '');
  const url = `${cleanBase}/api/invoice?apikey=${encodeURIComponent(cleanKey)}&amount=${Math.round(amount)}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || `Gagal membuat invoice QRIS Sairi (HTTP ${res.status})`);
  }

  return {
    success: true,
    invoice_id: data.invoice_id,
    amount: Number(data.amount || amount),
    fee: Number(data.fee || 0),
    total: Number(data.total || amount),
    qris_image: data.qris_image,
    expired_at: data.expired_at,
  };
}

/**
 * Cek status pembayaran transaksi
 */
export async function checkSairiInvoiceStatus(
  apiKey: string,
  invoiceId: string,
  baseUrl: string = DEFAULT_SAIRI_BASE_URL
): Promise<SairiInvoiceStatusResponse> {
  const cleanKey = apiKey?.trim();
  if (!cleanKey) {
    throw new Error('API Key Sairi belum dikonfigurasi.');
  }

  const cleanBase = (baseUrl?.trim() || DEFAULT_SAIRI_BASE_URL).replace(/\/+$/, '');
  const url = `${cleanBase}/api/invoice/status?apikey=${encodeURIComponent(cleanKey)}&invoice_id=${encodeURIComponent(invoiceId)}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Gagal mengecek status invoice Sairi (HTTP ${res.status})`);
  }

  return {
    invoice_id: data.invoice_id || invoiceId,
    amount: Number(data.amount || 0),
    fee: Number(data.fee || 0),
    total: Number(data.total || 0),
    status: (data.status || 'unpaid').toLowerCase() as any,
    qris_image: data.qris_image || '',
    expired_at: data.expired_at || '',
    created_at: data.created_at,
  };
}

export interface ActivePollingOrder {
  invoiceId: string;
  senderJid: string; // JID personal pembeli
  groupJid?: string; // JID grup jika dipicu dari grup
  senderName: string;
  productName: string;
  variantName: string;
  price: number;
  total: number;
  apiKey: string;
  baseUrl: string;
  onPaid: () => Promise<void>;
  onExpired: () => Promise<void>;
}

// Map invoice aktif yang sedang dipantau
const activePollers = new Map<string, NodeJS.Timeout>();

/**
 * Mendaftarkan background poller berkala (3-5 detik) untuk sebuah invoice
 */
export function startInvoicePolling(
  pollConfig: ActivePollingOrder,
  addLog?: (type: 'info' | 'success' | 'warning' | 'error' | 'code', msg: string) => void
) {
  // Hentikan poller lama jika ada
  stopInvoicePolling(pollConfig.invoiceId);

  let pollCount = 0;
  const maxPolls = 180; // ~12 menit (180 * 4s)

  if (addLog) {
    addLog('info', `⏳ Memulai pemantauan status QRIS Sairi (Invoice: ${pollConfig.invoiceId}) untuk ${pollConfig.senderName}...`);
  }

  const timer = setInterval(async () => {
    pollCount++;

    try {
      const statusRes = await checkSairiInvoiceStatus(
        pollConfig.apiKey,
        pollConfig.invoiceId,
        pollConfig.baseUrl
      );

      const status = statusRes.status;

      if (status === 'paid') {
        stopInvoicePolling(pollConfig.invoiceId);
        if (addLog) {
          addLog('success', `💰 Pembayaran QRIS LUNAS! Invoice: ${pollConfig.invoiceId} (Rp ${pollConfig.total.toLocaleString('id-ID')}) dari ${pollConfig.senderName}`);
        }
        await pollConfig.onPaid();
        return;
      }

      if (status === 'expired' || pollCount >= maxPolls) {
        stopInvoicePolling(pollConfig.invoiceId);
        if (addLog) {
          addLog('warning', `⚠️ Invoice ${pollConfig.invoiceId} telah kedaluwarsa atau timeout.`);
        }
        await pollConfig.onExpired();
        return;
      }
    } catch (pollErr: any) {
      // Abaikan transient error selama polling
    }
  }, 4000);

  activePollers.set(pollConfig.invoiceId, timer);
}

/**
 * Menghentikan poller untuk invoice tertentu
 */
export function stopInvoicePolling(invoiceId: string) {
  const existing = activePollers.get(invoiceId);
  if (existing) {
    clearInterval(existing);
    activePollers.delete(invoiceId);
  }
}
