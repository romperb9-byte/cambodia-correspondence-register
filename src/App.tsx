/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { OutgoingLetter, IncomingLetter, SystemSettings } from './types';
import {
  loadSettings,
  saveSettings,
  loadOutgoingLetters,
  saveOutgoingLetters,
  loadIncomingLetters,
  saveIncomingLetters,
  syncWithGoogleSheets,
} from './services/storageService';
import { INITIAL_OUTGOING_LETTERS, INITIAL_INCOMING_LETTERS, INITIAL_SETTINGS } from './data/initialData';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { OutgoingLettersView } from './components/OutgoingLettersView';
import { IncomingLettersView } from './components/IncomingLettersView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { OutgoingLetterModal } from './components/OutgoingLetterModal';
import { IncomingLetterModal } from './components/IncomingLetterModal';
import { PrintPreviewModal } from './components/PrintPreviewModal';
import { LetterDetailModal } from './components/LetterDetailModal';

export default function App() {
  // Navigation tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'outgoing' | 'incoming' | 'reports' | 'settings'>('dashboard');

  // Sidebar collapsed state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Core Data
  const [settings, setSettings] = useState<SystemSettings>(loadSettings);
  const [outgoingLetters, setOutgoingLetters] = useState<OutgoingLetter[]>(loadOutgoingLetters);
  const [incomingLetters, setIncomingLetters] = useState<IncomingLetter[]>(loadIncomingLetters);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ status: 'idle' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: '',
  });

  // Modals state
  const [isOutgoingModalOpen, setIsOutgoingModalOpen] = useState(false);
  const [editingOutgoing, setEditingOutgoing] = useState<OutgoingLetter | null>(null);

  const [isIncomingModalOpen, setIsIncomingModalOpen] = useState(false);
  const [editingIncoming, setEditingIncoming] = useState<IncomingLetter | null>(null);

  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [printPreviewType, setPrintPreviewType] = useState<'outgoing' | 'incoming'>('outgoing');

  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    type: 'outgoing' | 'incoming';
    letter: OutgoingLetter | IncomingLetter | null;
  }>({
    isOpen: false,
    type: 'outgoing',
    letter: null,
  });

  // Calculate next suggested sequential numbers
  const nextOutgoingNumber = useMemo(() => {
    if (outgoingLetters.length === 0) return 1;
    const maxNum = Math.max(...outgoingLetters.map((l) => Number(l.recordNumber) || 0));
    return maxNum + 1;
  }, [outgoingLetters]);

  const nextIncomingNumber = useMemo(() => {
    if (incomingLetters.length === 0) return 1;
    const maxNum = Math.max(...incomingLetters.map((l) => Number(l.recordNumber) || 0));
    return maxNum + 1;
  }, [incomingLetters]);

  // Sync with Google Sheets handler
  const handleSyncWithGoogleSheets = useCallback(async () => {
    if (!settings.googleScriptUrl || !settings.googleScriptUrl.trim()) {
      setActiveTab('settings');
      setSyncStatus({
        status: 'error',
        message: 'សូមបញ្ចូល Google Apps Script URL ក្នុង Settings ជាមុនសិន',
      });
      return;
    }

    setIsSyncing(true);
    setSyncStatus({ status: 'idle', message: 'កំពុងសមកាលកម្មទិន្នន័យ...' });

    const res = await syncWithGoogleSheets(settings.googleScriptUrl, outgoingLetters, incomingLetters);

    setIsSyncing(false);
    if (res.success) {
      setSyncStatus({ status: 'success', message: res.message });
      const nowStr = new Date().toLocaleString('km-KH');
      const updatedSettings = { ...settings, lastSyncedAt: nowStr };
      setSettings(updatedSettings);
      saveSettings(updatedSettings);

      if (res.outgoing) {
        setOutgoingLetters(res.outgoing);
        saveOutgoingLetters(res.outgoing);
      }
      if (res.incoming) {
        setIncomingLetters(res.incoming);
        saveIncomingLetters(res.incoming);
      }
    } else {
      setSyncStatus({ status: 'error', message: res.message });
    }

    setTimeout(() => {
      setSyncStatus({ status: 'idle', message: '' });
    }, 6000);
  }, [settings, outgoingLetters, incomingLetters]);

  // Save settings handler
  const handleSaveSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Add / Edit Outgoing Letter
  const handleSaveOutgoing = (letter: OutgoingLetter) => {
    let updated: OutgoingLetter[];
    const exists = outgoingLetters.some((l) => l.id === letter.id);
    if (exists) {
      updated = outgoingLetters.map((l) => (l.id === letter.id ? letter : l));
    } else {
      updated = [...outgoingLetters, letter];
    }

    setOutgoingLetters(updated);
    saveOutgoingLetters(updated);
    setIsOutgoingModalOpen(false);
    setEditingOutgoing(null);
  };

  // Delete Outgoing Letter
  const handleDeleteOutgoing = (letter: OutgoingLetter) => {
    if (confirm(`តើអ្នកពិតជាចង់លុបលិខិតចេញលេខ "${letter.recordNumber}" មែនទេ?`)) {
      const updated = outgoingLetters.filter((l) => l.id !== letter.id);
      setOutgoingLetters(updated);
      saveOutgoingLetters(updated);
      if (detailModal.isOpen && detailModal.letter?.id === letter.id) {
        setDetailModal({ isOpen: false, type: 'outgoing', letter: null });
      }
    }
  };

  // Add / Edit Incoming Letter
  const handleSaveIncoming = (letter: IncomingLetter) => {
    let updated: IncomingLetter[];
    const exists = incomingLetters.some((l) => l.id === letter.id);
    if (exists) {
      updated = incomingLetters.map((l) => (l.id === letter.id ? letter : l));
    } else {
      updated = [...incomingLetters, letter];
    }

    setIncomingLetters(updated);
    saveIncomingLetters(updated);
    setIsIncomingModalOpen(false);
    setEditingIncoming(null);
  };

  // Delete Incoming Letter
  const handleDeleteIncoming = (letter: IncomingLetter) => {
    if (confirm(`តើអ្នកពិតជាចង់លុបលិខិតចូលលេខ "${letter.recordNumber}" មែនទេ?`)) {
      const updated = incomingLetters.filter((l) => l.id !== letter.id);
      setIncomingLetters(updated);
      saveIncomingLetters(updated);
      if (detailModal.isOpen && detailModal.letter?.id === letter.id) {
        setDetailModal({ isOpen: false, type: 'incoming', letter: null });
      }
    }
  };

  // Open Print Preview
  const handleOpenPrintPreview = (type: 'outgoing' | 'incoming') => {
    setPrintPreviewType(type);
    setIsPrintPreviewOpen(true);
  };

  // Import all data
  const handleImportAllData = (outList: OutgoingLetter[], inList: IncomingLetter[]) => {
    setOutgoingLetters(outList);
    saveOutgoingLetters(outList);
    setIncomingLetters(inList);
    saveIncomingLetters(inList);
  };

  // Reset to default sample data
  const handleResetSampleData = () => {
    setOutgoingLetters(INITIAL_OUTGOING_LETTERS);
    saveOutgoingLetters(INITIAL_OUTGOING_LETTERS);
    setIncomingLetters(INITIAL_INCOMING_LETTERS);
    saveIncomingLetters(INITIAL_INCOMING_LETTERS);
    setSettings(INITIAL_SETTINGS);
    saveSettings(INITIAL_SETTINGS);
    alert('បានកំណត់ទិន្នន័យគំរូឡើងវិញរួចរាល់!');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Left Collapsible Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewOutgoing={() => {
          setEditingOutgoing(null);
          setIsOutgoingModalOpen(true);
        }}
        onOpenNewIncoming={() => {
          setEditingIncoming(null);
          setIsIncomingModalOpen(true);
        }}
        onOpenPrintPreview={handleOpenPrintPreview}
        isSyncing={isSyncing}
        onSync={handleSyncWithGoogleSheets}
        syncStatus={syncStatus}
        lastSyncedAt={settings.lastSyncedAt}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Content Area with dynamic left margin for Sidebar */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            outgoingLetters={outgoingLetters}
            incomingLetters={incomingLetters}
            settings={settings}
            onNavigateTab={setActiveTab}
            onOpenNewOutgoing={() => {
              setEditingOutgoing(null);
              setIsOutgoingModalOpen(true);
            }}
            onOpenNewIncoming={() => {
              setEditingIncoming(null);
              setIsIncomingModalOpen(true);
            }}
            onOpenPrintPreview={handleOpenPrintPreview}
          />
        )}

        {activeTab === 'outgoing' && (
          <OutgoingLettersView
            letters={outgoingLetters}
            settings={settings}
            onAddLetter={() => {
              setEditingOutgoing(null);
              setIsOutgoingModalOpen(true);
            }}
            onEditLetter={(letter) => {
              setEditingOutgoing(letter);
              setIsOutgoingModalOpen(true);
            }}
            onDeleteLetter={handleDeleteOutgoing}
            onViewLetter={(letter) => {
              setDetailModal({ isOpen: true, type: 'outgoing', letter });
            }}
            onOpenPrintPreview={() => handleOpenPrintPreview('outgoing')}
          />
        )}

        {activeTab === 'incoming' && (
          <IncomingLettersView
            letters={incomingLetters}
            settings={settings}
            onAddLetter={() => {
              setEditingIncoming(null);
              setIsIncomingModalOpen(true);
            }}
            onEditLetter={(letter) => {
              setEditingIncoming(letter);
              setIsIncomingModalOpen(true);
            }}
            onDeleteLetter={handleDeleteIncoming}
            onViewLetter={(letter) => {
              setDetailModal({ isOpen: true, type: 'incoming', letter });
            }}
            onOpenPrintPreview={() => handleOpenPrintPreview('incoming')}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            outgoingLetters={outgoingLetters}
            incomingLetters={incomingLetters}
            settings={settings}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onSaveSettings={handleSaveSettings}
            outgoingLetters={outgoingLetters}
            incomingLetters={incomingLetters}
            onImportAllData={handleImportAllData}
            onResetSampleData={handleResetSampleData}
            onSyncNow={handleSyncWithGoogleSheets}
            isSyncing={isSyncing}
            syncStatus={syncStatus}
          />
        )}
        </main>

        {/* Footer */}
        <footer className="no-print bg-white border-t border-slate-200 py-4 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">{settings.institutionName}</span>
              <span aria-hidden="true">·</span>
              <span>{settings.departmentName}</span>
            </div>
            <div className="text-center sm:text-right">
              <span>ប្រព័ន្ធគ្រប់គ្រងសៀវភៅចុះលិខិតចេញ-ចូល (រដ្ឋបាលអប់រំកម្ពុជា) · ឆ្នាំ {settings.currentYear}</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Outgoing Letter Modal */}
      <OutgoingLetterModal
        isOpen={isOutgoingModalOpen}
        onClose={() => {
          setIsOutgoingModalOpen(false);
          setEditingOutgoing(null);
        }}
        onSave={handleSaveOutgoing}
        existingLetter={editingOutgoing}
        nextSuggestedNumber={nextOutgoingNumber}
        currentYear={settings.currentYear || new Date().getFullYear()}
      />

      {/* Incoming Letter Modal */}
      <IncomingLetterModal
        isOpen={isIncomingModalOpen}
        onClose={() => {
          setIsIncomingModalOpen(false);
          setEditingIncoming(null);
        }}
        onSave={handleSaveIncoming}
        existingLetter={editingIncoming}
        nextSuggestedNumber={nextIncomingNumber}
        currentYear={settings.currentYear || new Date().getFullYear()}
      />

      {/* Print Preview Modal */}
      <PrintPreviewModal
        isOpen={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
        type={printPreviewType}
        outgoingLetters={outgoingLetters}
        incomingLetters={incomingLetters}
        settings={settings}
      />

      {/* Letter Detail Modal */}
      <LetterDetailModal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, type: 'outgoing', letter: null })}
        type={detailModal.type}
        letter={detailModal.letter}
        settings={settings}
        onEdit={() => {
          if (detailModal.type === 'outgoing') {
            setEditingOutgoing(detailModal.letter as OutgoingLetter);
            setIsOutgoingModalOpen(true);
          } else {
            setEditingIncoming(detailModal.letter as IncomingLetter);
            setIsIncomingModalOpen(true);
          }
        }}
        onDelete={() => {
          if (detailModal.type === 'outgoing') {
            handleDeleteOutgoing(detailModal.letter as OutgoingLetter);
          } else {
            handleDeleteIncoming(detailModal.letter as IncomingLetter);
          }
        }}
      />
    </div>
  );
}
