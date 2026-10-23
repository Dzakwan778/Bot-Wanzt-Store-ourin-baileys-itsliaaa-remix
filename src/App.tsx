import { useState } from 'react';
import { Check } from 'lucide-react';

// Custom Hooks
import { useBotConnection } from './hooks/useBotConnection';
import { useXavieraData } from './hooks/useXavieraData';
import { useWhatsAppGroups } from './hooks/useWhatsAppGroups';
import { useStoreConfig } from './hooks/useStoreConfig';
import { useButtonModal } from './hooks/useButtonModal';

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
  const [selectedTab, setSelectedTab] = useState<string>('Store Info');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Data Integrasi Xaviera API
  const xaviera = useXavieraData(showToast);

  // 2. Data & Pengaturan Toko (Store Info, Command Menu, List, Carousel, Media)
  const storeConfig = useStoreConfig(xaviera.xavieraApiKey, xaviera.xavieraBaseUrl, showToast);

  // 3. Koneksi & Polling Socket WhatsApp Bot
  const botConn = useBotConnection(
    showToast,
    storeConfig.loadInitialConfig,
    (apiKey, baseUrl) => {
      if (apiKey) xaviera.setXavieraApiKey(apiKey);
      if (baseUrl) xaviera.setXavieraBaseUrl(baseUrl);
    }
  );

  // 4. Whitelist Grup WhatsApp
  const groupsData = useWhatsAppGroups(selectedTab, botConn.botData.status, showToast);

  // 5. Modal Tambah & Edit Tombol WhatsApp Native Flow
  const buttonModal = useButtonModal(
    storeConfig.menuButtons,
    storeConfig.setMenuButtons,
    (updatedButtons) =>
      storeConfig.syncConfigToServer(
        storeConfig.menuOutputText,
        updatedButtons,
        storeConfig.listOutputText
      ),
    showToast
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-sky-500/20 antialiased flex flex-col">
      {/* 1. Header & Live Status */}
      <Navbar botData={botConn.botData} />

      {/* Main Workspace */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 space-y-6">
        {/* 2. Profil Toko & Informasi Saldo Xaviera */}
        <StoreProfileHeader
          storeInfo={storeConfig.storeInfo}
          xavieraProfile={xaviera.xavieraProfile}
          onRefreshProfile={xaviera.fetchXavieraProfile}
          onNavigateToConnection={() => setSelectedTab('Connection')}
          showToast={showToast}
        />

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri: WhatsApp Connection Panel & Kode Display (5 Kolom) */}
          <div className="lg:col-span-5 space-y-6">
            <WhatsAppConnectionPanel
              botData={botConn.botData}
              phone={botConn.phone}
              setPhone={botConn.setPhone}
              customCode={botConn.customCode}
              setCustomCode={botConn.setCustomCode}
              loading={botConn.loading}
              copied={botConn.copied}
              onStartPairing={botConn.handleStartPairing}
              onStop={botConn.handleStop}
              onReset={botConn.handleReset}
              onCopyCode={botConn.handleCopyCode}
            />
          </div>

          {/* Kolom Kanan: Live Socket Console & Tab Containers (7 Kolom) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 3. Live Socket Terminal Stream */}
            <LiveTerminal logs={botConn.botData.logs} />

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
                    storeInfo={storeConfig.storeInfo}
                    setStoreInfo={storeConfig.setStoreInfo}
                    isSavingConfig={storeConfig.isSavingConfig}
                    onSave={() => storeConfig.syncConfigToServer({ storeInfo: storeConfig.storeInfo })}
                    showToast={showToast}
                  />
                ) : selectedTab === 'Command' ? (
                  <TabCommand
                    selectedCommand={storeConfig.selectedCommand}
                    setSelectedCommand={storeConfig.setSelectedCommand}
                    menuOutputText={storeConfig.menuOutputText}
                    setMenuOutputText={storeConfig.setMenuOutputText}
                    menuFooterText={storeConfig.menuFooterText}
                    setMenuFooterText={storeConfig.setMenuFooterText}
                    includeMedia={storeConfig.includeMedia}
                    setIncludeMedia={storeConfig.setIncludeMedia}
                    selectedPicture={storeConfig.selectedPicture}
                    setSelectedPicture={storeConfig.setSelectedPicture}
                    availablePictures={storeConfig.availablePictures}
                    setAvailablePictures={storeConfig.setAvailablePictures}
                    menuButtons={storeConfig.menuButtons}
                    onOpenAddButtonModal={buttonModal.handleOpenAddButtonModal}
                    onEditButton={buttonModal.handleEditButton}
                    onDeleteButton={buttonModal.handleDeleteButton}
                    onSaveMenu={() =>
                      storeConfig.syncConfigToServer(
                        storeConfig.menuOutputText,
                        storeConfig.menuButtons,
                        storeConfig.listOutputText,
                        storeConfig.includeMedia,
                        storeConfig.selectedPicture
                      )
                    }
                    listOutputText={storeConfig.listOutputText}
                    setListOutputText={storeConfig.setListOutputText}
                    listFooterText={storeConfig.listFooterText}
                    setListFooterText={storeConfig.setListFooterText}
                    onSaveList={() =>
                      storeConfig.syncConfigToServer(
                        storeConfig.menuOutputText,
                        storeConfig.menuButtons,
                        storeConfig.listOutputText,
                        storeConfig.includeMedia,
                        storeConfig.selectedPicture,
                        xaviera.xavieraApiKey,
                        xaviera.xavieraBaseUrl,
                        storeConfig.carouselOutputText,
                        storeConfig.carouselPicture,
                        storeConfig.storeInfo,
                        storeConfig.menuFooterText,
                        storeConfig.listFooterText
                      )
                    }
                    carouselOutputText={storeConfig.carouselOutputText}
                    setCarouselOutputText={storeConfig.setCarouselOutputText}
                    carouselFooterText={storeConfig.carouselFooterText}
                    setCarouselFooterText={storeConfig.setCarouselFooterText}
                    carouselPicture={storeConfig.carouselPicture}
                    setCarouselPicture={storeConfig.setCarouselPicture}
                    onSaveCarousel={() =>
                      storeConfig.syncConfigToServer(
                        storeConfig.menuOutputText,
                        storeConfig.menuButtons,
                        storeConfig.listOutputText,
                        storeConfig.includeMedia,
                        storeConfig.selectedPicture,
                        xaviera.xavieraApiKey,
                        xaviera.xavieraBaseUrl,
                        storeConfig.carouselOutputText,
                        storeConfig.carouselPicture,
                        storeConfig.storeInfo,
                        storeConfig.menuFooterText,
                        storeConfig.listFooterText,
                        storeConfig.carouselFooterText
                      )
                    }
                    storeInfo={storeConfig.storeInfo}
                    isSavingConfig={storeConfig.isSavingConfig}
                    showToast={showToast}
                  />
                ) : selectedTab === 'Produk' ? (
                  <TabProduk
                    productsList={xaviera.productsList}
                    loadingProducts={xaviera.loadingProducts}
                    productSearch={xaviera.productSearch}
                    setProductSearch={xaviera.setProductSearch}
                    selectedProductCategory={xaviera.selectedProductCategory}
                    setSelectedProductCategory={xaviera.setSelectedProductCategory}
                    onRefreshProducts={xaviera.fetchXavieraProducts}
                    showToast={showToast}
                  />
                ) : selectedTab === 'SSM' || selectedTab === 'tab02' ? (
                  <TabSsm
                    smmList={xaviera.smmList}
                    smmSearch={xaviera.smmSearch}
                    setSmmSearch={xaviera.setSmmSearch}
                    smmPage={xaviera.smmPage}
                    setSmmPage={xaviera.setSmmPage}
                    smmItemsPerPage={xaviera.smmItemsPerPage}
                    setSmmItemsPerPage={xaviera.setSmmItemsPerPage}
                    selectedSmmCategory={xaviera.selectedSmmCategory}
                    setSelectedSmmCategory={xaviera.setSelectedSmmCategory}
                    loadingSmm={xaviera.loadingSmm}
                    fetchXavieraSmm={xaviera.fetchXavieraSmm}
                    showToast={showToast}
                  />
                ) : selectedTab === 'Top Up' || selectedTab === 'tab03' ? (
                  <TabTopUp
                    topUpList={xaviera.topUpList}
                    topUpSearch={xaviera.topUpSearch}
                    setTopUpSearch={xaviera.setTopUpSearch}
                    topUpPage={xaviera.topUpPage}
                    setTopUpPage={xaviera.setTopUpPage}
                    topUpItemsPerPage={xaviera.topUpItemsPerPage}
                    setTopUpItemsPerPage={xaviera.setTopUpItemsPerPage}
                    selectedTopUpCategory={xaviera.selectedTopUpCategory}
                    setSelectedTopUpCategory={xaviera.setSelectedTopUpCategory}
                    loadingTopUp={xaviera.loadingTopUp}
                    fetchXavieraGames={xaviera.fetchXavieraGames}
                    showToast={showToast}
                  />
                ) : selectedTab === 'Connection' || selectedTab === 'tab06' ? (
                  <TabConnection
                    xavieraApiKey={xaviera.xavieraApiKey}
                    setXavieraApiKey={xaviera.setXavieraApiKey}
                    xavieraBaseUrl={xaviera.xavieraBaseUrl}
                    setXavieraBaseUrl={xaviera.setXavieraBaseUrl}
                    showApiKey={xaviera.showApiKey}
                    setShowApiKey={xaviera.setShowApiKey}
                    isSavingConfig={storeConfig.isSavingConfig}
                    syncConfigToServer={storeConfig.syncConfigToServer}
                    menuOutputText={storeConfig.menuOutputText}
                    menuButtons={storeConfig.menuButtons}
                    listOutputText={storeConfig.listOutputText}
                    includeMedia={storeConfig.includeMedia}
                    selectedPicture={storeConfig.selectedPicture}
                    showToast={showToast}
                  />
                ) : selectedTab === 'Grup' || selectedTab === 'tab04' ? (
                  <TabGrup
                    groups={groupsData.groups}
                    groupSearchQuery={groupsData.groupSearchQuery}
                    setGroupSearchQuery={groupsData.setGroupSearchQuery}
                    isLoadingGroups={groupsData.isLoadingGroups}
                    groupsError={groupsData.groupsError}
                    togglingGroupId={groupsData.togglingGroupId}
                    copiedGroupId={groupsData.copiedGroupId}
                    fetchGroups={groupsData.fetchGroups}
                    handleToggleGroup={groupsData.handleToggleGroup}
                    copyGroupIdToClipboard={groupsData.copyGroupIdToClipboard}
                    botStatus={botConn.botData.status}
                  />
                ) : (
                  <div className="py-8 px-4 text-center space-y-2">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 mx-auto flex items-center justify-center font-mono font-bold text-xs">
                      {selectedTab}
                    </div>
                    <h4 className="text-sm font-semibold text-slate-800">
                      Tab: {selectedTab}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Slot tab ini telah disiapkan untuk penambahan modul atau fitur berikutnya.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 5. Modal Popup: Add & Edit Button */}
      <AddEditButtonModal
        isOpen={buttonModal.isAddButtonModalOpen}
        onClose={() => {
          buttonModal.setIsAddButtonModalOpen(false);
          buttonModal.setEditingButtonId(null);
        }}
        editingButtonId={buttonModal.editingButtonId}
        modalBtnType={buttonModal.modalBtnType}
        setModalBtnType={buttonModal.setModalBtnType}
        modalBtnName={buttonModal.modalBtnName}
        setModalBtnName={buttonModal.setModalBtnName}
        quickReplyAction={buttonModal.quickReplyAction}
        setQuickReplyAction={buttonModal.setQuickReplyAction}
        quickReplyOutput={buttonModal.quickReplyOutput}
        setQuickReplyOutput={buttonModal.setQuickReplyOutput}
        urlOutput={buttonModal.urlOutput}
        setUrlOutput={buttonModal.setUrlOutput}
        copyOutput={buttonModal.copyOutput}
        setCopyOutput={buttonModal.setCopyOutput}
        callTarget={buttonModal.callTarget}
        setCallTarget={buttonModal.setCallTarget}
        callPhone={buttonModal.callPhone}
        setCallPhone={buttonModal.setCallPhone}
        reminderOutput={buttonModal.reminderOutput}
        setReminderOutput={buttonModal.setReminderOutput}
        cancelReminderOutput={buttonModal.cancelReminderOutput}
        setCancelReminderOutput={buttonModal.setCancelReminderOutput}
        onSave={buttonModal.handleSaveButton}
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
