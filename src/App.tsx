import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

// Shared types
import {
  BotStatusResponse,
  WhatsAppButton,
  WhatsAppButtonType,
  StoreInfoConfig,
  PremiumProduct,
  SmmService,
  TopUpItem,
  WhatsAppGroupItem,
  XavieraProfileState,
  detectSmmPlatform,
} from './types/dashboard.types';

// Layout components
import { Navbar } from './components/layout/Navbar';
import { StoreProfileHeader } from './components/layout/StoreProfileHeader';

// Connection & Terminal components
import { WhatsAppConnectionPanel } from './components/connection/WhatsAppConnectionPanel';
import { LiveTerminal } from './components/terminal/LiveTerminal';

// Tab components
import { TabStoreInfo } from './components/tabs/TabStoreInfo';
import { TabCommand } from './components/tabs/TabCommand';
import { TabProduk } from './components/tabs/TabProduk';
import { TabSsm } from './components/tabs/TabSsm';
import { TabTopUp } from './components/tabs/TabTopUp';
import { TabConnection } from './components/tabs/TabConnection';
import { TabGrup } from './components/tabs/TabGrup';

// Modal components
import { AddEditButtonModal } from './components/modals/AddEditButtonModal';

export default function App() {
  const [phone, setPhone] = useState('81234567890');
  const [customCode, setCustomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>('Store Info');

  // Store Info State
  const [storeInfo, setStoreInfo] = useState<StoreInfoConfig>({
    storeName: '',
    ownerName: '',
    ownerNumber: '',
    adminName: '',
    adminNumber: '',
    webLink: '',
    telegramBot: '',
    waLink: '',
  });

  // Footer States per Command
  const [menuFooterText, setMenuFooterText] = useState<string>('{webLink} • Otomatis');
  const [listFooterText, setListFooterText] = useState<string>('{webLink} • Pilih Produk');
  const [carouselFooterText, setCarouselFooterText] = useState<string>('{storeName} Official');

  // Command State
  const [selectedCommand, setSelectedCommand] = useState<'Menu' | 'List' | 'Carousel'>('Menu');
  const [carouselOutputText, setCarouselOutputText] = useState<string>(
    `*Wanzt Store*\n\n*{produkName} | {category}*\n\nNikmati produk pilihanmu dengan harga terbaik di Wanzt Store.\n\n*Detail Produk:*\n- Varian: {varian}\n- Harga: {price}\n- Stok: {stock} tersedia\n\nProduk tersedia selama stok masih ada. Silakan pilih tindakan di bawah ini untuk melanjutkan.`
  );
  const [carouselPicture, setCarouselPicture] = useState<string>('snaptik-app-7690985506468908308-slide-2.jpg');
  const [menuOutputText, setMenuOutputText] = useState<string>(
    'Halo kak! Selamat datang di wanztstore.web.id ✨\n\nSilakan pilih layanan yang ingin Anda pesan melalui tombol interaktif di bawah ini:'
  );
  const [menuButtons, setMenuButtons] = useState<WhatsAppButton[]>([]);
  const [listOutputText, setListOutputText] = useState<string>(
    'Silakan pilih kategori produk dari daftar list di bawah ini untuk melihat detail produk:'
  );

  // Media Menu from ./src/media/picture
  const [includeMedia, setIncludeMedia] = useState<boolean>(false);
  const [selectedPicture, setSelectedPicture] = useState<string>('');
  const [availablePictures, setAvailablePictures] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/media/pictures')
      .then((res) => res.json())
      .then((data) => {
        if (data.pictures) {
          setAvailablePictures(data.pictures);
          if (data.pictures.length > 0 && !selectedPicture) {
            setSelectedPicture(data.pictures[0]);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Modal Add / Edit Button State
  const [isAddButtonModalOpen, setIsAddButtonModalOpen] = useState(false);
  const [editingButtonId, setEditingButtonId] = useState<string | null>(null);
  const [modalBtnType, setModalBtnType] = useState<WhatsAppButtonType>('quick_reply');
  const [modalBtnName, setModalBtnName] = useState('');

  // Dedicated inputs per type
  const [quickReplyOutput, setQuickReplyOutput] = useState('');
  const [quickReplyAction, setQuickReplyAction] = useState<'list' | 'unknown'>('unknown');
  const [urlOutput, setUrlOutput] = useState('https://');
  const [copyOutput, setCopyOutput] = useState('');
  const [reminderOutput, setReminderOutput] = useState('');
  const [cancelReminderOutput, setCancelReminderOutput] = useState('');
  const [callTarget, setCallTarget] = useState('');
  const [callPhone, setCallPhone] = useState('');

  const [botData, setBotData] = useState<BotStatusResponse>({
    status: 'idle',
    phoneNumber: '',
    pairingCode: '',
    customCode: '',
    user: null,
    logs: [],
    hasSession: false,
    isRegistered: false,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // WhatsApp Grup State (Tab 04 / Grup)
  const [groups, setGroups] = useState<WhatsAppGroupItem[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState<boolean>(false);
  const [groupsError, setGroupsError] = useState<string | null>(null);
  const [groupSearchQuery, setGroupSearchQuery] = useState<string>('');
  const [copiedGroupId, setCopiedGroupId] = useState<string | null>(null);
  const [togglingGroupId, setTogglingGroupId] = useState<string | null>(null);

  const fetchGroups = async () => {
    setIsLoadingGroups(true);
    setGroupsError(null);
    try {
      const res = await fetch('/api/bot/groups');
      const data = await res.json();
      if (data.connected === false) {
        setGroupsError(data.message || 'Bot belum terhubung ke WhatsApp.');
        setGroups([]);
      } else if (data.groups) {
        setGroups(data.groups);
      }
    } catch (err: any) {
      setGroupsError(err?.message || 'Gagal memuat grup WhatsApp.');
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const handleToggleGroup = async (groupId: string, currentEnabled: boolean) => {
    const nextVal = !currentEnabled;
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, enabled: nextVal } : g))
    );
    setTogglingGroupId(groupId);
    try {
      const res = await fetch('/api/bot/groups/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, enabled: nextVal }),
      });
      if (!res.ok) {
        setGroups((prev) =>
          prev.map((g) => (g.id === groupId ? { ...g, enabled: currentEnabled } : g))
        );
        showToast('Gagal memperbarui status toggle grup.');
      } else {
        showToast(`Grup ${nextVal ? 'diaktifkan' : 'dinonaktifkan'}.`);
      }
    } catch {
      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, enabled: currentEnabled } : g))
      );
      showToast('Koneksi gagal saat mengubah status grup.');
    } finally {
      setTogglingGroupId(null);
    }
  };

  const copyGroupIdToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedGroupId(id);
    showToast('ID Grup berhasil disalin ke clipboard!');
    setTimeout(() => setCopiedGroupId(null), 2000);
  };

  // Xaviera API State (Connection)
  const [xavieraApiKey, setXavieraApiKey] = useState<string>('');
  const [xavieraBaseUrl, setXavieraBaseUrl] = useState<string>('https://xavierastore.com/api/v1');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);

  const [xavieraProfile, setXavieraProfile] = useState<XavieraProfileState>({
    loading: false,
    configured: false,
    data: null,
    error: null,
  });

  const fetchXavieraProfile = async () => {
    try {
      setXavieraProfile((prev) => ({ ...prev, loading: true }));
      const res = await fetch('/api/xaviera/profile');
      if (res.ok) {
        const json = await res.json();
        if (!json.configured) {
          setXavieraProfile({
            loading: false,
            configured: false,
            data: null,
            error: null,
          });
        } else if (json.success && json.data) {
          const raw = json.data;
          const userObj = raw.data || raw.user || raw;
          setXavieraProfile({
            loading: false,
            configured: true,
            data: {
              storeName:
                userObj.store_name ||
                userObj.storeName ||
                userObj.store ||
                userObj.username ||
                userObj.name ||
                'Wanzt Store',
              username: userObj.username || 'wanztstore',
              name: userObj.name || userObj.nama || 'Store Owner',
              email: userObj.email || '-',
              balance:
                userObj.balance !== undefined
                  ? userObj.balance
                  : userObj.saldo !== undefined
                  ? userObj.saldo
                  : 0,
              role: userObj.role || 'Member / Reseller',
              status: userObj.status || (userObj.is_active !== false ? 'Aktif' : 'Nonaktif'),
              isVerified: userObj.is_verified ?? true,
            },
            error: null,
          });
        } else {
          setXavieraProfile({
            loading: false,
            configured: true,
            data: null,
            error: json.error || 'Gagal memuat profil',
          });
        }
      }
    } catch (err: any) {
      setXavieraProfile((prev) => ({
        ...prev,
        loading: false,
        error: err?.message || 'Koneksi gagal',
      }));
    }
  };

  useEffect(() => {
    fetchXavieraProfile();
  }, [xavieraApiKey, xavieraBaseUrl]);

  // Premium Products Data (Tab Produk)
  const [productsList, setProductsList] = useState<PremiumProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>('Semua');

  // SMM Services State
  const [smmList, setSmmList] = useState<SmmService[]>([]);
  const [loadingSmm, setLoadingSmm] = useState<boolean>(false);
  const [smmSearch, setSmmSearch] = useState<string>('');
  const [selectedSmmCategory, setSelectedSmmCategory] = useState<string>('Semua');
  const [smmPage, setSmmPage] = useState<number>(1);
  const [smmItemsPerPage, setSmmItemsPerPage] = useState<number>(25);

  const fetchXavieraProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch('/api/xaviera/products');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const rawItems = Array.isArray(json.data)
            ? json.data
            : json.data.products || json.data.items || [];
          if (Array.isArray(rawItems) && rawItems.length > 0) {
            const mapped: PremiumProduct[] = rawItems.map((item: any, idx: number) => ({
              id: item.id || idx + 1,
              name: item.name || item.title || item.product_name || 'Akun Premium',
              variant: item.variant || item.type || item.durasi || '1 Bulan',
              stock: item.stock !== undefined ? item.stock : 'Tersedia',
              price: Number(item.price || item.harga || 0),
              category: item.category || 'Premium Apps',
              status: item.status || 'available',
            }));
            setProductsList(mapped);
            return;
          }
        }
      }
      setProductsList([]);
    } catch {
      setProductsList([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchXavieraSmm = async () => {
    try {
      setLoadingSmm(true);
      const res = await fetch('/api/xaviera/smm');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const rawServices = Array.isArray(json.data)
            ? json.data
            : json.data.services || json.data.items || json.data.data || [];

          if (Array.isArray(rawServices) && rawServices.length > 0) {
            const mapped: SmmService[] = rawServices.map((item: any, idx: number) => {
              const cat = item.category || item.kategori || 'Layanan SMM';
              const name = item.name || item.service_name || 'Layanan SMM';
              return {
                service: item.service || item.id || idx + 1,
                name: name,
                category: cat,
                rate: Number(item.rate || item.price || item.harga || 0),
                min: Number(item.min || 1),
                max: Number(item.max || 1000000),
                refill: item.refill === true || item.refill === 1 || String(item.refill).toLowerCase() === 'true',
                platformCategory: detectSmmPlatform(cat, name),
              };
            });
            setSmmList(mapped);
            setSmmPage(1);
            return;
          }
        }
      }
      setSmmList([]);
    } catch {
      setSmmList([]);
    } finally {
      setLoadingSmm(false);
    }
  };

  // Top Up Games & Digital Services State
  const [topUpList, setTopUpList] = useState<TopUpItem[]>([]);
  const [loadingTopUp, setLoadingTopUp] = useState<boolean>(false);
  const [topUpSearch, setTopUpSearch] = useState<string>('');
  const [selectedTopUpCategory, setSelectedTopUpCategory] = useState<string>('Semua');
  const [topUpPage, setTopUpPage] = useState<number>(1);
  const [topUpItemsPerPage, setTopUpItemsPerPage] = useState<number>(25);

  const fetchXavieraGames = async () => {
    try {
      setLoadingTopUp(true);
      const res = await fetch('/api/xaviera/games');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const rawGames = Array.isArray(json.data.games)
            ? json.data.games
            : Array.isArray(json.data)
            ? json.data
            : [];
          if (rawGames.length > 0) {
            const mapped: TopUpItem[] = [];
            for (const g of rawGames) {
              const gameTitle = g.name || g.title || g.game || 'Game';
              const items = Array.isArray(g.items) ? g.items : Array.isArray(g.variants) ? g.variants : [];
              if (items.length > 0) {
                for (const it of items) {
                  mapped.push({
                    id: it.id || `${g.id}-${it.name}`,
                    game: gameTitle,
                    item: it.name || it.item || `${gameTitle} Item`,
                    category: gameTitle,
                    originalPrice: Number(it.price || it.harga || 0),
                    stock: it.stock !== undefined ? String(it.stock) : 'Tersedia',
                    server: it.server || g.target || 'Server/ID',
                    badge: it.badge,
                    status: 'available',
                  });
                }
              } else {
                mapped.push({
                  id: g.id || `game-${mapped.length}`,
                  game: gameTitle,
                  item: g.desc || `${gameTitle} Voucher / Top Up`,
                  category: gameTitle,
                  originalPrice: Number(g.price || g.harga || 0),
                  stock: 'Tersedia',
                  server: g.target || 'User ID & Server',
                  status: 'available',
                });
              }
            }
            if (mapped.length > 0) {
              setTopUpList(mapped);
              return;
            }
          }
        }
      }
      setTopUpList([]);
    } catch {
      setTopUpList([]);
    } finally {
      setLoadingTopUp(false);
    }
  };

  useEffect(() => {
    if (xavieraApiKey && xavieraApiKey.trim()) {
      fetchXavieraProducts();
      fetchXavieraSmm();
      fetchXavieraGames();
    } else {
      setProductsList([]);
      setSmmList([]);
      setTopUpList([]);
    }
  }, [xavieraApiKey, xavieraBaseUrl]);

  // Polling status secara real-time
  useEffect(() => {
    let hasLoadedInitialConfig = false;
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/bot/status');
        if (res.ok) {
          const data: any = await res.json();
          setBotData(data);
          if (data.customCode && customCode === 'WANZTSTR') {
            setCustomCode(data.customCode);
          }
          if (!hasLoadedInitialConfig && data.config) {
            hasLoadedInitialConfig = true;
            if (data.config.menuOutputText) setMenuOutputText(data.config.menuOutputText);
            if (data.config.menuButtons) setMenuButtons(data.config.menuButtons);
            if (data.config.listOutputText) setListOutputText(data.config.listOutputText);
            if (data.config.includeMedia !== undefined) setIncludeMedia(data.config.includeMedia);
            if (data.config.selectedPicture) setSelectedPicture(data.config.selectedPicture);
            if (data.config.xavieraApiKey !== undefined) setXavieraApiKey(data.config.xavieraApiKey);
            if (data.config.xavieraBaseUrl) setXavieraBaseUrl(data.config.xavieraBaseUrl);
            if (data.config.carouselOutputText) setCarouselOutputText(data.config.carouselOutputText);
            if (data.config.carouselPicture) setCarouselPicture(data.config.carouselPicture);
            if (data.config.storeInfo) setStoreInfo(data.config.storeInfo);
            if (data.config.menuFooterText) setMenuFooterText(data.config.menuFooterText);
            if (data.config.listFooterText) setListFooterText(data.config.listFooterText);
            if (data.config.carouselFooterText) setCarouselFooterText(data.config.carouselFooterText);
          }
        }
      } catch {}
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 1500);
    return () => clearInterval(interval);
  }, [customCode]);

  useEffect(() => {
    if (selectedTab === 'Grup' || selectedTab === 'tab04') {
      fetchGroups();
    }
  }, [selectedTab, botData.status]);

  // Simpan otomatis perubahan konfigurasi ke database
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const syncConfigToServer = async (
    firstArg?: any,
    newButtons?: WhatsAppButton[],
    newListText?: string,
    newIncludeMedia?: boolean,
    newSelectedPicture?: string,
    newApiKey?: string,
    newBaseUrl?: string,
    newCarouselText?: string,
    newCarouselPicture?: string,
    newStoreInfo?: StoreInfoConfig,
    newMenuFooter?: string,
    newListFooter?: string,
    newCarouselFooter?: string
  ) => {
    setIsSavingConfig(true);
    try {
      let payload: any = {
        storeInfo,
        menuOutputText,
        menuFooterText,
        menuButtons,
        listOutputText,
        listFooterText,
        includeMedia,
        selectedPicture,
        carouselOutputText,
        carouselFooterText,
        carouselPicture,
        xavieraApiKey,
        xavieraBaseUrl,
      };

      if (firstArg && typeof firstArg === 'object' && !Array.isArray(firstArg)) {
        payload = { ...payload, ...firstArg };
      } else {
        if (firstArg !== undefined && typeof firstArg === 'string') payload.menuOutputText = firstArg;
        if (newButtons !== undefined) payload.menuButtons = newButtons;
        if (newListText !== undefined) payload.listOutputText = newListText;
        if (newIncludeMedia !== undefined) payload.includeMedia = newIncludeMedia;
        if (newSelectedPicture !== undefined) payload.selectedPicture = newSelectedPicture;
        if (newApiKey !== undefined) payload.xavieraApiKey = newApiKey;
        if (newBaseUrl !== undefined) payload.xavieraBaseUrl = newBaseUrl;
        if (newCarouselText !== undefined) payload.carouselOutputText = newCarouselText;
        if (newCarouselPicture !== undefined) payload.carouselPicture = newCarouselPicture;
        if (newStoreInfo !== undefined) payload.storeInfo = newStoreInfo;
        if (newMenuFooter !== undefined) payload.menuFooterText = newMenuFooter;
        if (newListFooter !== undefined) payload.listFooterText = newListFooter;
        if (newCarouselFooter !== undefined) payload.carouselFooterText = newCarouselFooter;
      }

      await fetch('/api/bot/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.error('Gagal menyimpan config ke server', e);
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleStartPairing = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const fullPhone = cleanPhone.startsWith('62')
      ? cleanPhone
      : cleanPhone.startsWith('0')
      ? '62' + cleanPhone.slice(1)
      : '62' + cleanPhone;

    if (fullPhone.length < 10) {
      showToast('Nomor WhatsApp tidak valid (minimal 10 digit).');
      return;
    }

    const code = customCode.trim().toUpperCase();
    if (code.length !== 8) {
      showToast('Custom pairing code wajib tepat 8 karakter.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/bot/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: fullPhone,
          customCode: code,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Memulai permintaan pairing code...');
      } else {
        showToast(data.error || 'Gagal memulai penautan');
      }
    } catch (err: any) {
      showToast('Koneksi ke backend gagal: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      await fetch('/api/bot/stop', { method: 'POST' });
      showToast('Koneksi bot dimatikan.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Hapus seluruh folder sesi penautan? Anda perlu menautkan ulang WhatsApp.')) return;
    setLoading(true);
    try {
      await fetch('/api/bot/reset', { method: 'POST' });
      showToast('Sesi lama berhasil dibersihkan.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    const code = botData.pairingCode || customCode || 'WANZTSTR';
    navigator.clipboard.writeText(code);
    setCopied(true);
    showToast(`Kode ${code} berhasil disalin ke clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenAddButtonModal = () => {
    setEditingButtonId(null);
    setModalBtnType('quick_reply');
    setModalBtnName('');
    setQuickReplyOutput('');
    setQuickReplyAction('unknown');
    setUrlOutput('https://');
    setCopyOutput('');
    setReminderOutput('');
    setCancelReminderOutput('');
    setCallTarget('');
    setCallPhone('');
    setIsAddButtonModalOpen(true);
  };

  const handleEditButton = (btn: WhatsAppButton) => {
    setEditingButtonId(btn.id);
    setModalBtnType(btn.type);
    setModalBtnName(btn.name);
    setQuickReplyOutput('');
    setQuickReplyAction(btn.triggerAction || 'unknown');
    setUrlOutput('https://');
    setCopyOutput('');
    setReminderOutput('');
    setCancelReminderOutput('');
    setCallTarget('');
    setCallPhone('');

    if (btn.type === 'quick_reply') {
      setQuickReplyOutput(btn.output);
    } else if (btn.type === 'cta_url') {
      setUrlOutput(btn.output.startsWith('https://') ? btn.output : `https://${btn.output}`);
    } else if (btn.type === 'cta_copy') {
      setCopyOutput(btn.output);
    } else if (btn.type === 'vcard' || btn.type === 'cta_call') {
      if (btn.callTargetName) setCallTarget(btn.callTargetName);
      if (btn.callPhoneNumber) setCallPhone(btn.callPhoneNumber);
      if (!btn.callTargetName && !btn.callPhoneNumber && btn.output.includes('(')) {
        const match = btn.output.match(/^(.*?)\s*\((.*?)\)$/);
        if (match) {
          setCallTarget(match[1].trim());
          setCallPhone(match[2].trim());
        } else {
          setCallTarget('Admin Store');
          setCallPhone(btn.output.replace(/[^0-9+]/g, ''));
        }
      }
    } else if (btn.type === 'cta_reminder') {
      setReminderOutput(btn.output);
    } else if (btn.type === 'cta_cancel_reminder') {
      setCancelReminderOutput(btn.output);
    }
    setIsAddButtonModalOpen(true);
  };

  const handleSaveButton = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalBtnName.trim()) {
      showToast('Nama tombol wajib diisi.');
      return;
    }

    let finalOutput = '';
    if (modalBtnType === 'quick_reply') {
      if (!quickReplyOutput.trim()) {
        showToast('Output respon balasan wajib diisi.');
        return;
      }
      finalOutput = quickReplyOutput.trim();
    } else if (modalBtnType === 'cta_url') {
      const cleanUrl = urlOutput.trim();
      const hasUrlPlaceholder = cleanUrl.includes('{') && cleanUrl.includes('}');
      if (!hasUrlPlaceholder && !cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        showToast('Output cta_url wajib diisi dengan URL valid (diawali https:// atau placeholder {webLink}).');
        return;
      }
      finalOutput = cleanUrl;
    } else if (modalBtnType === 'cta_copy') {
      if (!copyOutput.trim()) {
        showToast('Teks yang akan disalin wajib diisi.');
        return;
      }
      finalOutput = copyOutput.trim();
    } else if (modalBtnType === 'vcard' || modalBtnType === 'cta_call') {
      if (!callTarget.trim()) {
        showToast('Nama kontak vCard wajib diisi (misal: Admin Store, Owner, atau {adminName}).');
        return;
      }
      const hasPhonePlaceholder = callPhone.includes('{') && callPhone.includes('}');
      const cleanPhone = callPhone.replace(/[^0-9+]/g, '');
      if (!hasPhonePlaceholder && (!cleanPhone || cleanPhone.length < 8)) {
        showToast('Nomor WhatsApp kontak vCard tidak valid (minimal 8 digit atau placeholder {ownerNumber}).');
        return;
      }
      finalOutput = `${callTarget.trim()} (${callPhone.trim()})`;
    } else if (modalBtnType === 'cta_reminder') {
      if (!reminderOutput.trim()) {
        showToast('Judul atau ID pengingat wajib diisi.');
        return;
      }
      finalOutput = reminderOutput.trim();
    } else if (modalBtnType === 'cta_cancel_reminder') {
      if (!cancelReminderOutput.trim()) {
        showToast('ID pengingat yang dibatalkan wajib diisi.');
        return;
      }
      finalOutput = cancelReminderOutput.trim();
    }

    const isContactBtn = modalBtnType === 'vcard' || modalBtnType === 'cta_call';

    if (editingButtonId) {
      const updatedButtons = menuButtons.map((btn) => {
        if (btn.id === editingButtonId) {
          return {
            ...btn,
            type: modalBtnType,
            name: modalBtnName.trim(),
            output: finalOutput,
            triggerAction: modalBtnType === 'quick_reply' ? quickReplyAction : undefined,
            callTargetName: isContactBtn ? callTarget.trim() : undefined,
            callPhoneNumber: isContactBtn ? callPhone.trim() : undefined,
          };
        }
        return btn;
      });
      setMenuButtons(updatedButtons);
      syncConfigToServer(menuOutputText, updatedButtons, listOutputText);
      setIsAddButtonModalOpen(false);
      setEditingButtonId(null);
      showToast(`Tombol "${modalBtnName.trim()}" berhasil diperbarui & disimpan!`);
    } else {
      const newBtn: WhatsAppButton = {
        id: 'btn-' + Date.now(),
        type: modalBtnType,
        name: modalBtnName.trim(),
        output: finalOutput,
        triggerAction: modalBtnType === 'quick_reply' ? quickReplyAction : undefined,
        callTargetName: isContactBtn ? callTarget.trim() : undefined,
        callPhoneNumber: isContactBtn ? callPhone.trim() : undefined,
      };
      const updatedButtons = [...menuButtons, newBtn];
      setMenuButtons(updatedButtons);
      syncConfigToServer(menuOutputText, updatedButtons, listOutputText);
      setIsAddButtonModalOpen(false);
      showToast(`Tombol "${newBtn.name}" berhasil ditambahkan & disimpan!`);
    }
  };

  const handleDeleteButton = (id: string) => {
    const updatedButtons = menuButtons.filter((b) => b.id !== id);
    setMenuButtons(updatedButtons);
    syncConfigToServer(menuOutputText, updatedButtons, listOutputText);
    showToast('Tombol berhasil dihapus & disimpan.');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-sky-500/20 antialiased flex flex-col">
      {/* 1. Header & Live Status */}
      <Navbar botData={botData} />

      {/* Main Workspace */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 space-y-6">
        {/* 2. Profil Toko & Informasi Saldo Xaviera */}
        <StoreProfileHeader
          storeInfo={storeInfo}
          xavieraProfile={xavieraProfile}
          onRefreshProfile={fetchXavieraProfile}
          onNavigateToConnection={() => setSelectedTab('Connection')}
          showToast={showToast}
        />

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri: WhatsApp Connection Panel & Kode Display (5 Kolom) */}
          <div className="lg:col-span-5 space-y-6">
            <WhatsAppConnectionPanel
              botData={botData}
              phone={phone}
              setPhone={setPhone}
              customCode={customCode}
              setCustomCode={setCustomCode}
              loading={loading}
              copied={copied}
              onStartPairing={handleStartPairing}
              onStop={handleStop}
              onReset={handleReset}
              onCopyCode={handleCopyCode}
            />
          </div>

          {/* Kolom Kanan: Live Socket Console & Tab Containers (7 Kolom) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 3. Live Socket Terminal Stream */}
            <LiveTerminal logs={botData.logs} />

            {/* 4. Tab Container */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              {/* Tab Navigation Bar */}
              <div className="border-b border-slate-200 bg-slate-50/70 px-2 sm:px-4 flex items-center gap-1 overflow-x-auto scrollbar-none">
                {['Store Info', 'Command', 'Produk', 'SSM', 'Top Up', 'Grup', 'tab05', 'Connection'].map(
                  (tabName) => {
                    const isActive =
                      selectedTab === tabName ||
                      (tabName === 'SSM' && selectedTab === 'tab02') ||
                      (tabName === 'Top Up' && selectedTab === 'tab03') ||
                      (tabName === 'Grup' && (selectedTab === 'tab04' || selectedTab === 'Grup'));
                    return (
                      <button
                        key={tabName}
                        type="button"
                        onClick={() => setSelectedTab(tabName)}
                        className={`px-3.5 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                          isActive
                            ? 'border-sky-600 text-sky-700 font-semibold bg-white -mb-px'
                            : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                        }`}
                      >
                        {tabName}
                      </button>
                    );
                  }
                )}
              </div>

              {/* Tab Content Body */}
              <div className="p-4 sm:p-5">
                {selectedTab === 'Store Info' ? (
                  <TabStoreInfo
                    storeInfo={storeInfo}
                    setStoreInfo={setStoreInfo}
                    isSavingConfig={isSavingConfig}
                    onSave={() => syncConfigToServer({ storeInfo })}
                    showToast={showToast}
                  />
                ) : selectedTab === 'Command' ? (
                  <TabCommand
                    selectedCommand={selectedCommand}
                    setSelectedCommand={setSelectedCommand}
                    menuOutputText={menuOutputText}
                    setMenuOutputText={setMenuOutputText}
                    menuFooterText={menuFooterText}
                    setMenuFooterText={setMenuFooterText}
                    includeMedia={includeMedia}
                    setIncludeMedia={setIncludeMedia}
                    selectedPicture={selectedPicture}
                    setSelectedPicture={setSelectedPicture}
                    availablePictures={availablePictures}
                    setAvailablePictures={setAvailablePictures}
                    menuButtons={menuButtons}
                    onOpenAddButtonModal={handleOpenAddButtonModal}
                    onEditButton={handleEditButton}
                    onDeleteButton={handleDeleteButton}
                    onSaveMenu={() =>
                      syncConfigToServer(menuOutputText, menuButtons, listOutputText, includeMedia, selectedPicture)
                    }
                    listOutputText={listOutputText}
                    setListOutputText={setListOutputText}
                    listFooterText={listFooterText}
                    setListFooterText={setListFooterText}
                    onSaveList={() =>
                      syncConfigToServer(
                        menuOutputText,
                        menuButtons,
                        listOutputText,
                        includeMedia,
                        selectedPicture,
                        xavieraApiKey,
                        xavieraBaseUrl,
                        carouselOutputText,
                        carouselPicture,
                        storeInfo,
                        menuFooterText,
                        listFooterText
                      )
                    }
                    carouselOutputText={carouselOutputText}
                    setCarouselOutputText={setCarouselOutputText}
                    carouselFooterText={carouselFooterText}
                    setCarouselFooterText={setCarouselFooterText}
                    carouselPicture={carouselPicture}
                    setCarouselPicture={setCarouselPicture}
                    onSaveCarousel={() =>
                      syncConfigToServer(
                        menuOutputText,
                        menuButtons,
                        listOutputText,
                        includeMedia,
                        selectedPicture,
                        xavieraApiKey,
                        xavieraBaseUrl,
                        carouselOutputText,
                        carouselPicture,
                        storeInfo,
                        menuFooterText,
                        listFooterText,
                        carouselFooterText
                      )
                    }
                    storeInfo={storeInfo}
                    isSavingConfig={isSavingConfig}
                    showToast={showToast}
                  />
                ) : selectedTab === 'Produk' ? (
                  <TabProduk
                    productsList={productsList}
                    loadingProducts={loadingProducts}
                    productSearch={productSearch}
                    setProductSearch={setProductSearch}
                    selectedProductCategory={selectedProductCategory}
                    setSelectedProductCategory={setSelectedProductCategory}
                    onRefreshProducts={fetchXavieraProducts}
                    showToast={showToast}
                  />
                ) : selectedTab === 'SSM' || selectedTab === 'tab02' ? (
                  <TabSsm
                    smmList={smmList}
                    smmSearch={smmSearch}
                    setSmmSearch={setSmmSearch}
                    smmPage={smmPage}
                    setSmmPage={setSmmPage}
                    smmItemsPerPage={smmItemsPerPage}
                    setSmmItemsPerPage={setSmmItemsPerPage}
                    selectedSmmCategory={selectedSmmCategory}
                    setSelectedSmmCategory={setSelectedSmmCategory}
                    loadingSmm={loadingSmm}
                    fetchXavieraSmm={fetchXavieraSmm}
                    showToast={showToast}
                  />
                ) : selectedTab === 'Top Up' || selectedTab === 'tab03' ? (
                  <TabTopUp
                    topUpList={topUpList}
                    topUpSearch={topUpSearch}
                    setTopUpSearch={setTopUpSearch}
                    topUpPage={topUpPage}
                    setTopUpPage={setTopUpPage}
                    topUpItemsPerPage={topUpItemsPerPage}
                    setTopUpItemsPerPage={setTopUpItemsPerPage}
                    selectedTopUpCategory={selectedTopUpCategory}
                    setSelectedTopUpCategory={setSelectedTopUpCategory}
                    loadingTopUp={loadingTopUp}
                    fetchXavieraGames={fetchXavieraGames}
                    showToast={showToast}
                  />
                ) : selectedTab === 'Connection' || selectedTab === 'tab06' ? (
                  <TabConnection
                    xavieraApiKey={xavieraApiKey}
                    setXavieraApiKey={setXavieraApiKey}
                    xavieraBaseUrl={xavieraBaseUrl}
                    setXavieraBaseUrl={setXavieraBaseUrl}
                    showApiKey={showApiKey}
                    setShowApiKey={setShowApiKey}
                    isSavingConfig={isSavingConfig}
                    syncConfigToServer={syncConfigToServer}
                    menuOutputText={menuOutputText}
                    menuButtons={menuButtons}
                    listOutputText={listOutputText}
                    includeMedia={includeMedia}
                    selectedPicture={selectedPicture}
                    showToast={showToast}
                  />
                ) : selectedTab === 'Grup' || selectedTab === 'tab04' ? (
                  <TabGrup
                    groups={groups}
                    groupSearchQuery={groupSearchQuery}
                    setGroupSearchQuery={setGroupSearchQuery}
                    isLoadingGroups={isLoadingGroups}
                    groupsError={groupsError}
                    togglingGroupId={togglingGroupId}
                    copiedGroupId={copiedGroupId}
                    fetchGroups={fetchGroups}
                    handleToggleGroup={handleToggleGroup}
                    copyGroupIdToClipboard={copyGroupIdToClipboard}
                    botStatus={botData.status}
                  />
                ) : (
                  <div className="py-8 px-4 text-center space-y-2">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 mx-auto flex items-center justify-center font-mono font-bold text-xs">
                      {selectedTab}
                    </div>
                    <h4 className="text-sm font-semibold text-slate-800">
                      Tab Dummy: {selectedTab}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Slot tab ini telah disiapkan untuk penambahan modul atau fitur berikutnya.
                    </p>
                    <div className="pt-2">
                      <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                        Placeholder Ready
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 5. Modal Popup: Add & Edit Button */}
      <AddEditButtonModal
        isOpen={isAddButtonModalOpen}
        onClose={() => {
          setIsAddButtonModalOpen(false);
          setEditingButtonId(null);
        }}
        editingButtonId={editingButtonId}
        modalBtnType={modalBtnType}
        setModalBtnType={setModalBtnType}
        modalBtnName={modalBtnName}
        setModalBtnName={setModalBtnName}
        quickReplyAction={quickReplyAction}
        setQuickReplyAction={setQuickReplyAction}
        quickReplyOutput={quickReplyOutput}
        setQuickReplyOutput={setQuickReplyOutput}
        urlOutput={urlOutput}
        setUrlOutput={setUrlOutput}
        copyOutput={copyOutput}
        setCopyOutput={setCopyOutput}
        callTarget={callTarget}
        setCallTarget={setCallTarget}
        callPhone={callPhone}
        setCallPhone={setCallPhone}
        reminderOutput={reminderOutput}
        setReminderOutput={setReminderOutput}
        cancelReminderOutput={cancelReminderOutput}
        setCancelReminderOutput={setCancelReminderOutput}
        onSave={handleSaveButton}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; wanztstore.web.id • Minimalist Admin Dashboard</span>
          <span className="text-slate-400">Filosofi: Clean Utility &amp; Anti-AI Slop</span>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-medium flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
