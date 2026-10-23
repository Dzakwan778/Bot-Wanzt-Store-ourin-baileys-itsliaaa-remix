import React from 'react';
import {
  Key,
  KeyRound,
  Eye,
  EyeOff,
  Globe,
  FileText,
  RefreshCw,
  Check,
} from 'lucide-react';
import { WhatsAppButton } from '../../types/dashboard.types';

interface TabConnectionProps {
  xavieraApiKey: string;
  setXavieraApiKey: (val: string) => void;
  xavieraBaseUrl: string;
  setXavieraBaseUrl: (val: string) => void;
  showApiKey: boolean;
  setShowApiKey: React.Dispatch<React.SetStateAction<boolean>>;
  isSavingConfig: boolean;
  syncConfigToServer: (
    menuText?: string,
    buttons?: WhatsAppButton[],
    listText?: string,
    incMedia?: boolean,
    pic?: string,
    apiKey?: string,
    baseUrl?: string
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
  return (
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

      {/* Kolom 1: Input API Key */}
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
              syncConfigToServer(
                menuOutputText,
                menuButtons,
                listOutputText,
                includeMedia,
                selectedPicture,
                val,
                xavieraBaseUrl
              );
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

      {/* Kolom 2: Input Base URL API */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-sky-600" />
            Base URL API
          </label>
          {xavieraBaseUrl !== 'https://xavierastore.com/api/v1' && (
            <button
              type="button"
              onClick={() => {
                const defaultUrl = 'https://xavierastore.com/api/v1';
                setXavieraBaseUrl(defaultUrl);
                syncConfigToServer(
                  menuOutputText,
                  menuButtons,
                  listOutputText,
                  includeMedia,
                  selectedPicture,
                  xavieraApiKey,
                  defaultUrl
                );
                showToast('Base URL dikembalikan ke default dokumentasi!');
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
              syncConfigToServer(
                menuOutputText,
                menuButtons,
                listOutputText,
                includeMedia,
                selectedPicture,
                xavieraApiKey,
                val
              );
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

      {/* Informasi Endpoint & Dokumentasi */}
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
  );
};
