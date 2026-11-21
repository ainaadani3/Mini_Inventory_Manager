'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Loader2, X } from 'lucide-react';
import {
  InventoriFormPayload,
  InventoriItem,
  KATEGORI_OPTIONS,
  KategoriOption,
} from '@/lib/inventory-types';

interface ItemFormModalProps {
  isOpen: boolean;
  editingItem: InventoriItem | null;
  onClose: () => void;
  onSave: (payload: InventoriFormPayload, editingId?: number) => Promise<void>;
}

interface ItemFormContentProps {
  editingItem: InventoriItem | null;
  onClose: () => void;
  onSave: (payload: InventoriFormPayload, editingId?: number) => Promise<void>;
}

function ItemFormContent({
  editingItem,
  onClose,
  onSave,
}: ItemFormContentProps) {
  const initialKategori: KategoriOption =
    editingItem &&
    KATEGORI_OPTIONS.includes(editingItem.kategori as KategoriOption)
      ? (editingItem.kategori as KategoriOption)
      : 'Minuman';

  const [kodItem, setKodItem] = useState(editingItem?.kod_item ?? '');
  const [namaProduk, setNamaProduk] = useState(editingItem?.nama_produk ?? '');
  const [kategori, setKategori] = useState<KategoriOption>(initialKategori);
  const [kuantitiSemasa, setKuantitiSemasa] = useState(
    editingItem ? String(editingItem.kuantiti_semasa) : '0'
  );
  const [parasMinimum, setParasMinimum] = useState(
    editingItem ? String(editingItem.paras_minimum) : '5'
  );
  const [hargaSeunit, setHargaSeunit] = useState(
    editingItem ? editingItem.harga_seunit.toFixed(2) : '0.00'
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedKod = kodItem.trim().toUpperCase();
    const trimmedNama = namaProduk.trim();
    const parsedKuantiti = Number(kuantitiSemasa);
    const parsedMinimum = Number(parasMinimum);
    const parsedHarga = Number(hargaSeunit);

    if (trimmedKod.length < 2 || trimmedKod.length > 40) {
      setFormError('Kod item mestilah antara 2 hingga 40 aksara.');
      return;
    }

    if (trimmedNama.length < 2 || trimmedNama.length > 160) {
      setFormError('Nama produk mestilah antara 2 hingga 160 aksara.');
      return;
    }

    if (!Number.isInteger(parsedKuantiti) || parsedKuantiti < 0) {
      setFormError('Kuantiti semasa mestilah nombor bulat 0 atau lebih.');
      return;
    }

    if (!Number.isInteger(parsedMinimum) || parsedMinimum < 0) {
      setFormError('Paras minimum mestilah nombor bulat 0 atau lebih.');
      return;
    }

    if (!Number.isFinite(parsedHarga) || parsedHarga < 0) {
      setFormError('Harga seunit mestilah nilai RM yang sah (0 atau lebih).');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(
        {
          kod_item: trimmedKod,
          nama_produk: trimmedNama,
          kategori,
          kuantiti_semasa: parsedKuantiti,
          paras_minimum: parsedMinimum,
          harga_seunit: Math.round(parsedHarga * 100) / 100,
        },
        editingItem?.id
      );
      onClose();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Gagal menyimpan rekod inventori.';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="item-modal-title"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={() => !isSubmitting && onClose()}
        className="fixed inset-0 bg-slate-900/45 backdrop-blur-[1px]"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2
              id="item-modal-title"
              className="text-lg font-semibold text-slate-900"
            >
              {editingItem ? 'Kemaskini Item Inventori' : 'Tambah Item Baharu'}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {editingItem
                ? 'Ubah maklumat stok, harga, atau paras peringatan minimum.'
                : 'Masukkan butiran item untuk rekod koperasi, bengkel, atau kafe.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Tutup borang"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {formError && (
            <div
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-800"
            >
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="kod_item"
                className="block text-sm font-medium text-slate-700"
              >
                Kod Item
              </label>
              <input
                id="kod_item"
                type="text"
                required
                value={kodItem}
                onChange={(e) => setKodItem(e.target.value)}
                placeholder="cth. KOP-001"
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
              />
            </div>

            <div>
              <label
                htmlFor="kategori"
                className="block text-sm font-medium text-slate-700"
              >
                Kategori
              </label>
              <select
                id="kategori"
                value={kategori}
                onChange={(e) => setKategori(e.target.value as KategoriOption)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
              >
                {KATEGORI_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="nama_produk"
              className="block text-sm font-medium text-slate-700"
            >
              Nama Produk
            </label>
            <input
              id="nama_produk"
              type="text"
              required
              value={namaProduk}
              onChange={(e) => setNamaProduk(e.target.value)}
              placeholder="cth. Biji Kopi Arabica Panggang (1kg)"
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="kuantiti_semasa"
                className="block text-sm font-medium text-slate-700"
              >
                Kuantiti Semasa
              </label>
              <input
                id="kuantiti_semasa"
                type="number"
                min={0}
                step={1}
                required
                value={kuantitiSemasa}
                onChange={(e) => setKuantitiSemasa(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 tabular-nums focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
              />
            </div>

            <div>
              <label
                htmlFor="paras_minimum"
                className="block text-sm font-medium text-slate-700"
              >
                Paras Minimum
              </label>
              <input
                id="paras_minimum"
                type="number"
                min={0}
                step={1}
                required
                value={parasMinimum}
                onChange={(e) => setParasMinimum(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 tabular-nums focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
              />
            </div>

            <div>
              <label
                htmlFor="harga_seunit"
                className="block text-sm font-medium text-slate-700"
              >
                Harga Seunit (RM)
              </label>
              <input
                id="harga_seunit"
                type="number"
                min={0}
                step="0.01"
                required
                value={hargaSeunit}
                onChange={(e) => setHargaSeunit(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 tabular-nums focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800 disabled:opacity-60 whitespace-nowrap shrink-0"
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              {isSubmitting
                ? 'Menyimpan...'
                : editingItem
                  ? 'Simpan Perubahan'
                  : 'Tambah Item'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export function ItemFormModal({
  isOpen,
  editingItem,
  onClose,
  onSave,
}: ItemFormModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <ItemFormContent
          key={editingItem?.id ?? 'new'}
          editingItem={editingItem}
          onClose={onClose}
          onSave={onSave}
        />
      )}
    </AnimatePresence>
  );
}
