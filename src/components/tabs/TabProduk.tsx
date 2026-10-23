import React from 'react';
import { Package, RefreshCw, Search } from 'lucide-react';
import { PremiumProduct } from '../../types/dashboard.types';

interface TabProdukProps {
  productsList: PremiumProduct[];
  loadingProducts: boolean;
  productSearch: string;
  setProductSearch: (val: string) => void;
  selectedProductCategory: string;
  setSelectedProductCategory: (cat: string) => void;
  onRefreshProducts: () => void;
  showToast: (msg: string) => void;
}

export const TabProduk: React.FC<TabProdukProps> = ({
  productsList,
  loadingProducts,
  productSearch,
  setProductSearch,
  selectedProductCategory,
  setSelectedProductCategory,
  onRefreshProducts,
  showToast,
}) => {
  return (
    <div className="space-y-5">
      {/* Header Tab Produk */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Katalog Aplikasi &amp; Akun Premium
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar akun premium aktif, varian paket, ketersediaan stok, dan tarif harga Xaviera Store.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onRefreshProducts();
              showToast('Menyinkronkan data katalog produk...');
            }}
            disabled={loadingProducts}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingProducts ? 'animate-spin text-sky-600' : 'text-slate-500'}`} />
            <span>Sinkronkan Produk</span>
          </button>
        </div>
      </div>

      {/* Filter Kategori & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder="Cari aplikasi atau varian (contoh: Netflix, Spotify)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 transition shadow-2xs"
          />
          {productSearch && (
            <button
              type="button"
              onClick={() => setProductSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Kategori Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          {['Semua', 'Streaming', 'Music', 'Design', 'Editing', 'AI Tool'].map((cat) => {
            const isActive = selectedProductCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedProductCategory(cat)}
                className={`px-2.5 py-1.5 text-xs rounded-md transition cursor-pointer whitespace-nowrap font-medium ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabel Produk Premium */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-5 w-40">Nama</th>
                <th className="py-3 px-4">Varian</th>
                <th className="py-3 px-4 text-center w-24">Stok</th>
                <th className="py-3 px-4 text-right w-32">Harga Asli</th>
                <th className="py-3 px-5 text-right w-44">Harga Jual (+10%)</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {(() => {
                const filtered = productsList.filter((prod) => {
                  const matchesSearch =
                    prod.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                    prod.variant.toLowerCase().includes(productSearch.toLowerCase());
                  const matchesCategory =
                    selectedProductCategory === 'Semua' || prod.category === selectedProductCategory;
                  return matchesSearch && matchesCategory;
                });

                if (filtered.length === 0) {
                  return (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500 space-y-1">
                        <Package className="w-8 h-8 mx-auto text-slate-400" />
                        <div className="font-medium text-slate-700">
                          {productsList.length === 0
                            ? 'Katalog Produk Kosong'
                            : 'Tidak ada produk ditemukan'}
                        </div>
                        <div className="text-[11px] text-slate-400 max-w-sm mx-auto">
                          {productsList.length === 0
                            ? 'Data produk murni diambil dari API Xaviera. API Key belum diisi atau tidak valid di tab Connection.'
                            : 'Coba ubah kata kunci pencarian atau ganti filter kategori.'}
                        </div>
                      </td>
                    </tr>
                  );
                }

                return filtered.map((prod, index) => {
                  const prevProd = index > 0 ? filtered[index - 1] : null;
                  const isNewGroup = !prevProd || prevProd.name !== prod.name;
                  const isOutOfStock = Number(prod.stock) <= 0;

                  const originalPrice = Number(prod.price) || 0;
                  const margin = Math.round(originalPrice * 0.1);
                  const sellingPrice = originalPrice + margin;

                  return (
                    <tr
                      key={prod.id}
                      className={`transition-colors hover:bg-sky-50/30 ${
                        isNewGroup
                          ? index === 0
                            ? 'bg-slate-50/50'
                            : 'border-t-2 border-slate-200 bg-slate-50/50'
                          : 'border-t border-slate-100 bg-white'
                      }`}
                    >
                      <td className="py-3 px-5 align-middle whitespace-nowrap">
                        {isNewGroup ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-white border border-slate-200 text-sky-600 flex items-center justify-center shrink-0 shadow-2xs font-bold text-[11px]">
                              <Package className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-bold text-slate-900 text-sm tracking-tight">
                              {prod.name}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center pl-7 text-slate-400 select-none">
                            <span className="inline-block w-4 h-px bg-slate-300 mr-2"></span>
                            <span className="font-mono text-slate-400 font-bold">-</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 align-middle">
                        <div className="font-medium text-slate-800 text-xs">
                          {prod.variant}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center align-middle">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            0
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center gap-1 font-mono font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded text-xs border border-slate-200/60 min-w-[36px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>{prod.stock}</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right align-middle">
                        <span className="font-mono text-xs text-slate-600">
                          Rp{originalPrice.toLocaleString('id-ID')}
                        </span>
                      </td>

                      <td className="py-3 px-5 text-right align-middle whitespace-nowrap">
                        <div className="inline-flex items-baseline gap-1.5 font-mono">
                          <span className="font-bold text-sm text-slate-900 tracking-tight">
                            Rp{sellingPrice.toLocaleString('id-ID')}
                          </span>
                          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                            ({margin.toLocaleString('id-ID')})
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>

        {/* Footer Tabel */}
        <div className="bg-slate-50 px-5 py-2.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <span>
            Menampilkan{' '}
            <strong className="text-slate-800 font-mono">
              {
                productsList.filter((prod) => {
                  const matchesSearch =
                    prod.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                    prod.variant.toLowerCase().includes(productSearch.toLowerCase());
                  const matchesCategory =
                    selectedProductCategory === 'Semua' || prod.category === selectedProductCategory;
                  return matchesSearch && matchesCategory;
                }).length
              }
            </strong>{' '}
            varian dari <span className="font-mono font-semibold text-slate-700">{productsList.length}</span> total item
          </span>
          <span className="text-slate-400 font-mono">
            Format harga: IDR • Data langsung dari Xaviera Store
          </span>
        </div>
      </div>
    </div>
  );
};
