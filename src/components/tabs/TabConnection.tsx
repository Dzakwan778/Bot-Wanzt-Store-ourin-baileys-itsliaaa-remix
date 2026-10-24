import React, { useState } from 'react';
import {
  Key,
  KeyRound,
  Eye,
  EyeOff,
  Globe,
  FileText,
  RefreshCw,
  Check,
  Wallet,
  QrCode,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { WhatsAppButton } from '../../types/dashboard.types';

interface TabConnectionProps {
  xavieraApiKey: string;
  setXavieraApiKey: (val: string) => void;
  xavieraBaseUrl: string;
  setXavieraBaseUrl: (val: string) => void;
  sairiApiKey: string;
  setSairiApiKey: (val: string) => void;
  sairiBaseUrl: string;
  setSairiBaseUrl: (val: string) => void;
  showApiKey: boolean;
  setShowApiKey: React.Dispatch<React.SetStateAction<boolean>>;
  isSavingConfig: boolean;
  syncConfigToServer: (
    menuText?: any,
    buttons?: WhatsAppButton[],
    listText?: string,
    incMedia?: boolean,
    pic?: string,
    apiKey?: string,
    baseUrl?: string,
    carouselText?: string,
    carouselPicture?: string,
    storeInfo?: any,
    menuFooter?: string,
    listFooter?: string,
    carouselFooter?: string,
    newSairiApiKey?: string,
    newSairiBaseUrl?: string
  ) => void;
  menuOutputText: string;
  menuButtons: WhatsAppButton[];
  listOutputText: string;
  includeMedia: boolean;
  selectedPicture: string;
  showToast: (msg: string) => void;
}

export const TabConnection: React.FC<TabConnectionProps> = ({
  xavieraApiKey,
  setXavieraApiKey,
  xavieraBaseUrl,
  setXavieraBaseUrl,
  sairiApiKey,
  setSairiApiKey,
  sairiBaseUrl,
  setSairiBaseUrl,
  showApiKey,
  setShowApiKey,
  isSavingConfig,
  syncConfigToServer,
  menuOutputText,
  menuButtons,
  listOutputText,
  includeMedia,
  selectedPicture,
  showToast,
}) => {
  const [showSairiKey, setShowSairiKey] = useState<boolean>(false);
  const [sairiBalance, setSairiBalance] = useState<{
    loading: boolean;
    balance: number | null;
    error: string | null;
    checked: boolean;
  }>({
    loading: false,
    balance: null,
    error: null,
    checked: false,
  });

  const handleCheckSairiBalance = async () => {
    if (!sairiApiKey || !sairiApiKey.trim()) {
      showToast('Silakan masukkan API Key Sairi terlebih dahulu.');
      return;
    }
    setSairiBalance((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(
        `/api/sairi/balance?apikey=${encodeURIComponent(sairiApiKey.trim())}&baseurl=${encodeURIComponent(
          sairiBaseUrl || 'https://api.sairibot.my.id'
        )}`
      );
      const data = await res.json();
      if (data.success) {
        setSairiBalance({
          loading: false,
          balance: Number(data.balance || 0),
          error: null,
          checked: true,
        });
        showToast(`Saldo Sairi berhasil dicek: Rp ${Number(data.balance || 0).toLocaleString('id-ID')}`);
      } else {
        setSairiBalance({
          loading: false,
          balance: null,
          error: data.error || 'API Key Sairi tidak valid',
          checked: true,
        });
        showToast(data.error || 'Gagal memverifikasi API Key Sairi');
      }
    } catch (err: any) {
      setSairiBalance({
        loading: false,
        balance: null,
        error: err?.message || 'Gagal terhubung ke API Sairi',
        checked: true,
      });
      showToast('Koneksi ke API Sairi gagal');
    }
  };

  return (
    <div className="space-y-8">
      {/* ============================================================ */}
      {/* SEKSI 1: KONFIGURASI XAVIERA STORE API                       */}
      {/* ============================================================ */}
      <div className="space-y-6">
        {/* Header Tab Connection - Xaviera API */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Konfigurasi Xaviera Store API
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Atur integrasi Developer API Xaviera untuk katalog produk, SMM, dan transaksi bot otomatis.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isSavingConfig ? (
              <span className="text-[11px] font-mono text-sky-600 bg-sky-50 px-2.5 py-1 rounded border border-sky-200 flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3 animate-spin" /> Menyimpan...
              </span>
            ) : (
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 flex items-center gap-1.5">
                <Check className="w-3 h-3" /> Tersimpan Otomatis
              </span>
            )}
          </div>
        </div>

        {/* Kolom 1: Input API Key Xaviera */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-sky-600" />
              API Key Xaviera
            </span>
            <span className="text-[11px] font-normal text-slate-400">
              Bearer Token Autentikasi
            </span>
          </label>
          <div className="relative flex rounded-lg border border-slate-300 focus-within:border-sky-600 focus-within:ring-2 focus-within:ring-sky-600/20 transition-all bg-white overflow-hidden shadow-2xs">
            <div className="bg-slate-50 px-3 py-2.5 flex items-center text-slate-400 border-r border-slate-200">
              <KeyRound className="w-4 h-4 text-slate-500" />
            </div>
            <input
              type={showApiKey ? 'text' : 'password'}
              value={xavieraApiKey}
              onChange={(e) => {
                const val = e.target.value;
                setXavieraApiKey(val);
                syncConfigToServer({ xavieraApiKey: val });
              }}
              placeholder="Masukkan API Key (contoh: xvs_xxxxxxxxxxxxxxxxxxxxxxxx)"
              className="w-full px-3 py-2.5 text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="px-3 text-slate-400 hover:text-slate-600 transition flex items-center justify-center cursor-pointer"
              title={showApiKey ? 'Sembunyikan API Key' : 'Tampilkan API Key'}
            >
              {showApiKey ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-1">
            <span>💡</span>
            <span>
              Dapatkan API Key melalui dashboard akun Xaviera Anda di menu <strong>Profil &gt; Developer API &gt; Generate API Key</strong>.
            </span>
          </p>
        </div>

        {/* Kolom 2: Input Base URL API Xaviera */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-sky-600" />
              Base URL API Xaviera
            </label>
            {xavieraBaseUrl !== 'https://xavierastore.com/api/v1' && (
              <button
                type="button"
                onClick={() => {
                  const defaultUrl = 'https://xavierastore.com/api/v1';
                  setXavieraBaseUrl(defaultUrl);
                  syncConfigToServer({ xavieraBaseUrl: defaultUrl });
                  showToast('Base URL Xaviera dikembalikan ke default dokumentasi!');
                }}
                className="text-[11px] text-sky-600 hover:text-sky-700 font-medium hover:underline cursor-pointer"
              >
                Reset ke Default
              </button>
            )}
          </div>
          <div className="relative flex rounded-lg border border-slate-300 focus-within:border-sky-600 focus-within:ring-2 focus-within:ring-sky-600/20 transition-all bg-white overflow-hidden shadow-2xs">
            <div className="bg-slate-100 px-3 py-2.5 flex items-center text-slate-600 border-r border-slate-200 text-xs font-mono select-none">
              URL
            </div>
            <input
              type="text"
              value={xavieraBaseUrl}
              onChange={(e) => {
                const val = e.target.value;
                setXavieraBaseUrl(val);
                syncConfigToServer({ xavieraBaseUrl: val });
              }}
              placeholder="https://xavierastore.com/api/v1"
              className="w-full px-3 py-2.5 text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>
          <p className="text-[11px] text-slate-500">
            Default resmi sesuai dokumentasi Xaviera Store:{' '}
            <code className="text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded font-mono font-medium">
              https://xavierastore.com/api/v1
            </code>
          </p>
        </div>

        {/* Ringkasan Integrasi Endpoint Xaviera Store */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <FileText className="w-4 h-4 text-sky-600" />
            Ringkasan Integrasi Endpoint Xaviera Store:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
              <span className="font-semibold text-slate-800 block">💎 Premium Account</span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Akses daftar katalog produk premium, pemesanan instan, serta pengecekan status pesanan.
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
              <span className="font-semibold text-slate-800 block">📱 Layanan SMM</span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Layanan followers, like, view, dan interaksi medsos otomatis dengan status pesanan real-time.
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
              <span className="font-semibold text-slate-800 block">🎮 Top Up Game</span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Daftar game populer, pilihan item/diamond, transaksi voucher, dan cek status top-up.
              </p>
            </div>
          </div>
          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/80">
            <span>
              Format Autentikasi:{' '}
              <code className="font-mono text-slate-700">Authorization: Bearer [API_KEY]</code>
            </span>
            <span className="text-sky-600 font-medium">Data format: JSON RESTful</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SEKSI 2: KONFIGURASI SAIRI PAYMENT GATEWAY API (QRIS DINAMIS) */}
      {/* ============================================================ */}
      <div className="space-y-6 pt-4 border-t-2 border-slate-100">
        {/* Header Seksi Sairi Payment Gateway */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Konfigurasi Sairi Payment Gateway API</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full">
                  QRIS Dinamis
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Atur integrasi API SairiPedia (api.sairibot.my.id) untuk pembuatan QRIS otomatis dan verifikasi pembayaran instan.
            </p>
          </div>

          {/* Tombol Uji & Cek Saldo Sairi */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCheckSairiBalance}
              disabled={sairiBalance.loading || !sairiApiKey?.trim()}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition shadow-2xs cursor-pointer ${
                sairiApiKey?.trim()
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {sairiBalance.loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Wallet className="w-3.5 h-3.5" />
              )}
              <span>Cek Saldo Sairi</span>
            </button>
          </div>
        </div>

        {/* Status Saldo Sairi Box (Jika sudah pernah dicek) */}
        {sairiBalance.checked && (
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              sairiBalance.error
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  sairiBalance.error ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold">
                  {sairiBalance.error ? 'Verifikasi API Sairi Gagal' : 'Saldo Akun Merchant SairiPedia'}
                </div>
                <div className="text-[11px] opacity-80">
                  {sairiBalance.error ? sairiBalance.error : 'Saldo siap ditarik (instant settlement)'}
                </div>
              </div>
            </div>
            {!sairiBalance.error && sairiBalance.balance !== null && (
              <div className="text-right">
                <span className="text-xs text-emerald-600 block font-medium">Saldo Utama</span>
                <span className="text-base font-bold font-mono text-emerald-800">
                  Rp {sairiBalance.balance.toLocaleString('id-ID')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Kolom 1: Input API Key Sairi */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-emerald-600" />
              API Key SairiPedia
            </span>
            <span className="text-[11px] font-normal text-slate-400">
              Query Parameter / Header Autentikasi
            </span>
          </label>
          <div className="relative flex rounded-lg border border-slate-300 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/20 transition-all bg-white overflow-hidden shadow-2xs">
            <div className="bg-slate-50 px-3 py-2.5 flex items-center text-slate-400 border-r border-slate-200">
              <KeyRound className="w-4 h-4 text-emerald-600" />
            </div>
            <input
              type={showSairiKey ? 'text' : 'password'}
              value={sairiApiKey}
              onChange={(e) => {
                const val = e.target.value;
                setSairiApiKey(val);
                syncConfigToServer({ sairiApiKey: val });
              }}
              placeholder="Masukkan API Key Sairi (contoh: sairi_xxxxxxxxxxxxxxxxxxxxxxxx)"
              className="w-full px-3 py-2.5 text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowSairiKey(!showSairiKey)}
              className="px-3 text-slate-400 hover:text-slate-600 transition flex items-center justify-center cursor-pointer"
              title={showSairiKey ? 'Sembunyikan API Key' : 'Tampilkan API Key'}
            >
              {showSairiKey ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-1">
            <span>💡</span>
            <span>
              Dapatkan API Key melalui dashboard akun SairiPedia Anda di menu <strong>Profil &gt; API Key</strong> (pada{' '}
              <a
                href="https://api.sairibot.my.id"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 font-semibold hover:underline"
              >
                https://api.sairibot.my.id
              </a>
              ).
            </span>
          </p>
        </div>

        {/* Kolom 2: Input Base URL API Sairi */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              Base URL API Sairi
            </label>
            {sairiBaseUrl !== 'https://api.sairibot.my.id' && (
              <button
                type="button"
                onClick={() => {
                  const defaultUrl = 'https://api.sairibot.my.id';
                  setSairiBaseUrl(defaultUrl);
                  syncConfigToServer({ sairiBaseUrl: defaultUrl });
                  showToast('Base URL Sairi dikembalikan ke default dokumentasi!');
                }}
                className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium hover:underline cursor-pointer"
              >
                Reset ke Default
              </button>
            )}
          </div>
          <div className="relative flex rounded-lg border border-slate-300 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/20 transition-all bg-white overflow-hidden shadow-2xs">
            <div className="bg-slate-100 px-3 py-2.5 flex items-center text-slate-600 border-r border-slate-200 text-xs font-mono select-none">
              URL
            </div>
            <input
              type="text"
              value={sairiBaseUrl}
              onChange={(e) => {
                const val = e.target.value;
                setSairiBaseUrl(val);
                syncConfigToServer({ sairiBaseUrl: val });
              }}
              placeholder="https://api.sairibot.my.id"
              className="w-full px-3 py-2.5 text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>
          <p className="text-[11px] text-slate-500">
            Default resmi sesuai dokumentasi SairiPedia API:{' '}
            <code className="text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded font-mono font-medium">
              https://api.sairibot.my.id
            </code>
          </p>
        </div>

        {/* Informasi Endpoint & Fitur Utama Sairi */}
        <div className="rounded-xl bg-emerald-50/40 border border-emerald-200/80 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
            <QrCode className="w-4 h-4 text-emerald-600" />
            Fitur Utama Payment Gateway SairiPedia:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 bg-white rounded-lg border border-emerald-100 space-y-1">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                QRIS All Payment
              </span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Mendukung GoPay, OVO, DANA, ShopeePay, LinkAja, BCA, Mandiri, BRI, BNI, dan seluruh bank.
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-emerald-100 space-y-1">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                Auto-Polling Status
              </span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Backend bot mengecek otomatis status pembayaran tiap 4 detik dan mendeteksi pembayaran lunas secara real-time.
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-emerald-100 space-y-1">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Privacy-First (DM)
              </span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Invoice QRIS dan hasil produk akun premium dikirim langsung ke chat pribadi pembeli, bukan di grup.
              </p>
            </div>
          </div>
          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-emerald-200/60">
            <span>
              Format Autentikasi:{' '}
              <code className="font-mono text-slate-700">?apikey=[API_KEY]</code> atau{' '}
              <code className="font-mono text-slate-700">x-api-key: [API_KEY]</code>
            </span>
            <span className="text-emerald-700 font-medium">Auto Verification Enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
};
