'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { InventoriItem } from '@/lib/inventory-types';

interface DeleteConfirmModalProps {
  item: InventoriItem | null;
  onClose: () => void;
  onConfirm: (item: InventoriItem) => Promise<void>;
}

interface DeleteConfirmContentProps {
  item: InventoriItem;
  onClose: () => void;
  onConfirm: (item: InventoriItem) => Promise<void>;
}

function DeleteConfirmContent({
  item,
  onClose,
  onConfirm,
}: DeleteConfirmContentProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDeleting, onClose]);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(item);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={() => !isDeleting && onClose()}
        className="fixed inset-0 bg-slate-900/45 backdrop-blur-[1px]"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="delete-modal-title"
                className="text-base font-semibold text-slate-900"
              >
                Sahkan Pemadaman Item
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Adakah anda pasti mahu memadam{' '}
                <span className="font-semibold text-slate-900">
                  {item.nama_produk}
                </span>{' '}
                (<span className="font-mono text-xs">{item.kod_item}</span>)?
                Tindakan ini tidak boleh dipulihkan.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Tutup pengesahan"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:opacity-60 whitespace-nowrap shrink-0"
          >
            {isDeleting && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            {isDeleting ? 'Memadam...' : 'Padam Item'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function DeleteConfirmModal({
  item,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <AnimatePresence>
      {item && (
        <DeleteConfirmContent
          key={item.id}
          item={item}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      )}
    </AnimatePresence>
  );
}
