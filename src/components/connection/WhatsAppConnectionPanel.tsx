import React, { FormEvent } from 'react';
import {
  Smartphone,
  CheckCircle2,
  Play,
  Clock,
  Square,
  RotateCcw,
  KeyRound,
  Check,
  Copy,
  ShieldCheck,
} from 'lucide-react';
import { BotStatusResponse } from '../../types/dashboard.types';

interface WhatsAppConnectionPanelProps {
  botData: BotStatusResponse;
  phone: string;
  setPhone: (val: string) => void;
  customCode: string;
  setCustomCode: (val: string) => void;
  loading: boolean;
  copied: boolean;
  onStartPairing: (e: FormEvent) => void;
  onStop: () => void;
  onReset: () => void;
  onCopyCode: () => void;
}

export const WhatsAppConnectionPanel: React.FC<WhatsAppConnectionPanelProps> = ({
  botData,
  phone,
  setPhone,
  customCode,
  setCustomCode,
  loading,
  copied,
  onStartPairing,
  onStop,
  onReset,
  onCopyCode,
}) => {
  return (
    <div className="space-y-6">
      {/* Kartu Form Koneksi */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-sky-600" />
            <h2 className="font-semibold text-sm text-slate-900">WhatsApp Connection</h2>
          </div>
          {botData.hasSession && (
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Sesi Tersimpan
            </span>
          )}
        </div>

        <form onSubmit={onStartPairing} className="space-y-4">
          {/* Input Nomor WhatsApp */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nomor WhatsApp Target
            </label>
            <div className="relative flex rounded-lg border border-slate-300 focus-within:border-sky-600 focus-within:ring-2 focus-within:ring-sky-600/20 transition-all bg-white overflow-hidden shadow-2xs">
              <div className="bg-slate-100 px-3 py-2.5 flex items-center gap-1 border-r border-slate-200 text-slate-700 text-xs font-mono font-semibold select-none">
                <span>🇮🇩</span>
                <span>+62</span>
              </div>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="857xxxxxxxx"
                disabled={loading || botData.status === 'connected'}
                className="w-full px-3 py-2.5 text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Masukkan nomor tanpa angka 0 di depan (contoh: 81234567890).
            </p>
          </div>

          {/* Input Custom Pairing Code */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Custom Pairing Code (8 Karakter)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={8}
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                placeholder=""
                disabled={loading || botData.status === 'connected'}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-mono font-bold text-sky-800 tracking-widest focus:outline-none focus:bg-white focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 uppercase transition shadow-2xs"
              />
              <span className="text-xs px-2.5 py-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 font-mono font-medium shrink-0">
                8 Chars
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Kode alfanumerik tepat 8 karakter untuk dimasukkan di WhatsApp ponsel.
            </p>
          </div>

          {/* Tombol Aksi */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={loading || botData.status === 'connecting' || botData.status === 'connected'}
              className="w-full py-2.5 px-4 rounded-lg font-semibold text-sm text-white bg-sky-600 hover:bg-sky-700 active:scale-[0.99] transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <Clock className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
              {botData.status === 'connected' ? 'WhatsApp Bot Telah Terhubung' : 'Minta Kode Pairing (WANZTSTR)'}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onStop}
                disabled={loading || botData.status === 'idle'}
                className="flex-1 py-2 px-3 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 active:scale-[0.99] border border-slate-300 text-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Square className="w-3.5 h-3.5 fill-current text-slate-500" />
                Putuskan
              </button>
              <button
                type="button"
                onClick={onReset}
                disabled={loading}
                className="flex-1 py-2 px-3 rounded-lg text-xs font-medium bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 active:scale-[0.99] border border-slate-300 text-slate-600 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Sesi
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Display Box Kode Pairing */}
      {(botData.pairingCode || botData.status === 'code_ready' || botData.status === 'waiting_code') && (
        <div className="bg-white border-2 border-sky-600/30 rounded-xl p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-800 uppercase tracking-wider">
              <KeyRound className="w-4 h-4 text-sky-600" />
              Kode Pairing Tersedia
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              Status: {botData.status}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 text-center space-y-3">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Ketik kode ini di aplikasi WhatsApp ponsel Anda:
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-widest text-slate-900 select-all py-1">
              {botData.pairingCode || customCode || 'WANZTSTR'}
            </div>
            <button
              onClick={onCopyCode}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 active:scale-[0.99] text-white text-xs font-semibold transition shadow-xs cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Tersalin ke Clipboard!' : 'Salin Kode Pairing'}
            </button>
          </div>

          {/* Panduan 4 Langkah di HP */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Panduan Memasukkan Kode di WhatsApp HP:
            </div>
            <ol className="space-y-1.5 list-decimal list-inside leading-relaxed text-slate-600">
              <li>Buka aplikasi WhatsApp di smartphone Anda.</li>
              <li>
                Buka menu <strong className="text-slate-800 font-medium">Titik 3</strong> (Android) atau <strong className="text-slate-800 font-medium">Pengaturan</strong> (iOS).
              </li>
              <li>
                Pilih <strong className="text-sky-700 font-semibold">Perangkat Tertaut</strong> &gt; <strong className="text-slate-800 font-medium">Tautkan Perangkat</strong>.
              </li>
              <li>
                Ketuk tautan teks di bawah scanner:{' '}
                <strong className="text-sky-700 font-semibold">&quot;Tautkan dengan nomor telepon saja&quot;</strong>.
              </li>
              <li>
                Ketikkan 8 karakter kode:{' '}
                <strong className="font-mono text-slate-900 bg-slate-100 px-1 py-0.5 rounded border border-slate-200">
                  {botData.pairingCode || customCode || 'WANZTSTR'}
                </strong>
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* Info Bot Ketika Connected */}
      {botData.status === 'connected' && (
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-semibold text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Bot WhatsApp Aktif &amp; Terhubung
          </div>
          <p className="text-slate-600">
            Nomor Bot: <span className="font-mono font-semibold text-slate-900">+{botData.phoneNumber}</span>
          </p>
          <p className="text-slate-600">
            ID JID: <span className="font-mono text-[11px] text-slate-700">{botData.user?.id || 'Connected'}</span>
          </p>
        </div>
      )}
    </div>
  );
};
