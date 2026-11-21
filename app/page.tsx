'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Plus,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import {
  InventoriFormPayload,
  InventoriItem,
  KATEGORI_OPTIONS,
} from '@/lib/inventory-types';
import { SummaryCards } from '@/components/SummaryCards';
import { InventoryTable } from '@/components/InventoryTable';
import { ItemFormModal } from '@/components/ItemFormModal';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { ToastContainer, ToastMessage } from '@/components/ToastContainer';

export default function InventoryDashboardPage() {
  const [items, setItems] = useState<InventoriItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState<string>('Semua');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoriItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<InventoriItem | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (type: 'success' | 'error', message: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev, { id, type, message }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4200);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchInventory = useCallback(async (showSpinner = true) => {
    if (showSpinner) setIsLoading(true);
    setLoadError(null);

    try {
      const res = await fetch('/api/inventori', { cache: 'no-store' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal memuatkan data inventori.');
      }

      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Gagal berhubung dengan pelayan pangkalan data.';
      setLoadError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadInitial() {
      try {
        const res = await fetch('/api/inventori', { cache: 'no-store' });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Gagal memuatkan data inventori.');
        }

        if (active) {
          setItems(Array.isArray(data.items) ? data.items : []);
          setLoadError(null);
        }
      } catch (error) {
        if (active) {
          const message =
            error instanceof Error
              ? error.message
              : 'Gagal berhubung dengan pelayan pangkalan data.';
          setLoadError(message);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadInitial();
    return () => {
      active = false;
    };
  }, []);

  const summary = useMemo(() => {
    const totalProducts = items.length;
    let lowStockCount = 0;
    let totalStockValue = 0;

    for (const item of items) {
      if (item.kuantiti_semasa <= item.paras_minimum) {
        lowStockCount += 1;
      }
      totalStockValue += item.kuantiti_semasa * item.harga_seunit;
    }

    return {
      totalProducts,
      lowStockCount,
      totalStockValue,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return items.filter((item) => {
      if (selectedKategori !== 'Semua' && item.kategori !== selectedKategori) {
        return false;
      }
      if (onlyLowStock && item.kuantiti_semasa > item.paras_minimum) {
        return false;
      }
      if (query) {
        const matchesKod = item.kod_item.toLowerCase().includes(query);
        const matchesNama = item.nama_produk.toLowerCase().includes(query);
        return matchesKod || matchesNama;
      }
      return true;
    });
  }, [items, searchQuery, selectedKategori, onlyLowStock]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedKategori !== 'Semua' ||
    onlyLowStock;

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedKategori('Semua');
    setOnlyLowStock(false);
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: InventoriItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleSaveItem = async (
    payload: InventoriFormPayload,
    editingId?: number
  ) => {
    if (editingId) {
      const res = await fetch(`/api/inventori/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengemas kini item.');
      }

      setItems((prev) =>
        prev.map((row) => (row.id === editingId ? data.item : row))
      );
      addToast('success', `"${data.item.nama_produk}" berjaya dikemas kini.`);
    } else {
      const res = await fetch('/api/inventori', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menambah item baharu.');
      }

      setItems((prev) => [data.item, ...prev]);
      addToast('success', `"${data.item.nama_produk}" berjaya ditambah.`);
    }
  };

  const handleQuickAdjust = async (item: InventoriItem, delta: 1 | -1) => {
    if (delta === -1 && item.kuantiti_semasa <= 0) return;

    const previousQty = item.kuantiti_semasa;
    const optimisticQty = Math.max(0, previousQty + delta);

    // Immediate optimistic UI update
    setItems((prev) =>
      prev.map((row) =>
        row.id === item.id ? { ...row, kuantiti_semasa: optimisticQty } : row
      )
    );

    try {
      const res = await fetch(`/api/inventori/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengemas kini kuantiti stok.');
      }

      setItems((prev) =>
        prev.map((row) => (row.id === item.id ? data.item : row))
      );
      addToast(
        'success',
        `Stok ${data.item.kod_item} dikemas kini kepada ${data.item.kuantiti_semasa}.`
      );
    } catch (error) {
      // Revert optimistic update on failure
      setItems((prev) =>
        prev.map((row) =>
          row.id === item.id ? { ...row, kuantiti_semasa: previousQty } : row
        )
      );
      const message =
        error instanceof Error
          ? error.message
          : 'Gagal mengemas kini kuantiti stok.';
      addToast('error', message);
    }
  };

  const handleDeleteConfirm = async (item: InventoriItem) => {
    try {
      const res = await fetch(`/api/inventori/${item.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal memadam rekod inventori.');
      }

      setItems((prev) => prev.filter((row) => row.id !== item.id));
      addToast('success', `"${item.nama_produk}" telah dipadam.`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Gagal memadam rekod inventori.';
      addToast('error', message);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
          <a
            href="#ringkasan"
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            Mini Inventory Manager
          </a>

          <nav
            aria-label="Navigasi Utama"
            className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex"
          >
            <a
              href="#ringkasan"
              className="transition-colors hover:text-slate-900 whitespace-nowrap shrink-0"
            >
              Ringkasan
            </a>
            <a
              href="#senarai-stok"
              className="transition-colors hover:text-slate-900 whitespace-nowrap shrink-0"
            >
              Senarai Stok
            </a>
            <button
              type="button"
              onClick={() => setOnlyLowStock((prev) => !prev)}
              className={`transition-colors whitespace-nowrap shrink-0 ${
                onlyLowStock
                  ? 'font-semibold text-rose-700'
                  : 'hover:text-slate-900'
              }`}
            >
              Amaran Stok Rendah
            </button>
          </nav>

          <div className="shrink-0">
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800 whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Tambah Item
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header / Workspace Context */}
        <section
          id="ringkasan"
          className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
        >
          <div>
            <p className="text-sm font-medium text-teal-700">
              Koperasi · Bengkel · Kafe
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl text-balance">
              Sistem Inventori Stok &amp; Peringatan Habis
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Pantau baki stok semasa secara masa nyata, laraskan kuantiti terus
              dari jadual, dan kesan item yang mencapai paras minimum dengan
              segera.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fetchInventory(true)}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              Muat Semula
            </button>
          </div>
        </section>

        {/* Database / API Error Banner */}
        {loadError && (
          <div
            role="alert"
            className="flex flex-col justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 sm:flex-row sm:items-center"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle
                className="mt-0.5 h-5 w-5 shrink-0 text-rose-600"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-semibold text-rose-900">
                  Sambungan pangkalan data tergendala
                </p>
                <p className="mt-0.5 text-sm text-rose-800">{loadError}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => fetchInventory(true)}
              className="rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-medium text-rose-800 transition-colors hover:bg-rose-100 whitespace-nowrap shrink-0"
            >
              Cuba Semula
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <SummaryCards
          totalProducts={summary.totalProducts}
          lowStockCount={summary.lowStockCount}
          totalStockValue={summary.totalStockValue}
          isLoading={isLoading}
        />

        {/* Search & Filter Toolbar */}
        <section id="senarai-stok" className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kod item atau nama produk..."
                aria-label="Cari kod item atau nama produk"
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-9 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Kosongkan carian"
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div
                role="tablist"
                aria-label="Penapis Kategori"
                className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-white p-1"
              >
                {(['Semua', ...KATEGORI_OPTIONS] as const).map((category) => {
                  const isActive = selectedKategori === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setSelectedKategori(category)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        isActive
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setOnlyLowStock((prev) => !prev)}
                aria-pressed={onlyLowStock}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  onlyLowStock
                    ? 'border-rose-300 bg-rose-50 text-rose-800'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle
                  className={`h-3.5 w-3.5 ${
                    onlyLowStock ? 'text-rose-600' : 'text-slate-400'
                  }`}
                  aria-hidden="true"
                />
                Stok Rendah ({summary.lowStockCount})
              </button>
            </div>
          </div>

          {/* Count & Reset bar */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="tabular-nums">
              Memaparkan {filteredItems.length} daripada {items.length} rekod
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="font-medium text-teal-700 hover:text-teal-800"
              >
                Set semula penapis
              </button>
            )}
          </div>

          {/* Inventory Data Table */}
          <InventoryTable
            items={filteredItems}
            totalItemCount={items.length}
            isLoading={isLoading}
            hasActiveFilters={hasActiveFilters}
            onQuickAdjust={handleQuickAdjust}
            onEdit={handleOpenEdit}
            onDelete={(item) => setDeletingItem(item)}
            onOpenCreate={handleOpenCreate}
            onResetFilters={resetFilters}
          />
        </section>
      </main>

      <ItemFormModal
        isOpen={isFormOpen}
        editingItem={editingItem}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
      />

      <DeleteConfirmModal
        item={deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
