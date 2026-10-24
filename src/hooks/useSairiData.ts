import { useState, useEffect } from 'react';
import { SairiBalanceState } from '../types/dashboard.types';

export function useSairiData(
  sairiApiKey: string,
  sairiBaseUrl: string,
  showToast: (msg: string) => void
) {
  const [sairiBalance, setSairiBalance] = useState<SairiBalanceState>({
    loading: false,
    configured: false,
    balance: null,
    error: null,
  });

  const fetchSairiBalance = async (isManual = false) => {
    const cleanKey = sairiApiKey?.trim();
    const cleanBase = sairiBaseUrl?.trim() || 'https://api.sairibot.my.id';

    if (!cleanKey) {
      setSairiBalance({
        loading: false,
        configured: false,
        balance: null,
        error: null,
      });
      if (isManual) {
        showToast('API Key Sairi belum diisi di tab Connection.');
      }
      return;
    }

    try {
      setSairiBalance((prev) => ({ ...prev, loading: true, error: null }));
      const res = await fetch(
        `/api/sairi/balance?apikey=${encodeURIComponent(cleanKey)}&baseurl=${encodeURIComponent(cleanBase)}`
      );
      const data = await res.json();
      if (data.success) {
        setSairiBalance({
          loading: false,
          configured: true,
          balance: Number(data.balance || 0),
          error: null,
        });
        if (isManual) {
          showToast(`Saldo Sairi berhasil diperbarui: Rp ${Number(data.balance || 0).toLocaleString('id-ID')}`);
        }
      } else {
        setSairiBalance({
          loading: false,
          configured: true,
          balance: null,
          error: data.error || 'API Key Sairi tidak valid',
        });
        if (isManual) {
          showToast(data.error || 'Gagal memverifikasi saldo Sairi');
        }
      }
    } catch (err: any) {
      setSairiBalance({
        loading: false,
        configured: true,
        balance: null,
        error: err?.message || 'Gagal terhubung ke API Sairi',
      });
      if (isManual) {
        showToast('Koneksi ke API Sairi gagal');
      }
    }
  };

  useEffect(() => {
    if (sairiApiKey && sairiApiKey.trim()) {
      fetchSairiBalance(false);
    } else {
      setSairiBalance({
        loading: false,
        configured: false,
        balance: null,
        error: null,
      });
    }
  }, [sairiApiKey, sairiBaseUrl]);

  return {
    sairiBalance,
    fetchSairiBalance,
  };
}
