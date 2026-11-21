'use client';

import {
  AlertTriangle,
  Minus,
  PackageOpen,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { InventoriItem, formatRM } from '@/lib/inventory-types';

interface InventoryTableProps {
  items: InventoriItem[];
  totalItemCount: number;
  isLoading: boolean;
  hasActiveFilters: boolean;
  onQuickAdjust: (item: InventoriItem, delta: 1 | -1) => void;
  onEdit: (item: InventoriItem) => void;
  onDelete: (item: InventoriItem) => void;
  onOpenCreate: () => void;
  onResetFilters: () => void;
}

export function InventoryTable({
  items,
  totalItemCount,
  isLoading,
  hasActiveFilters,
  onQuickAdjust,
  onEdit,
  onDelete,
  onOpenCreate,
  onResetFilters,
}: InventoryTableProps) {
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="flex items-center gap-4">
                <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-52 animate-pulse rounded bg-slate-100" />
              </div>
              <div className="flex items-center gap-4">
                <div className="h-7 w-24 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
          <PackageOpen className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-900">
          {totalItemCount === 0
            ? 'Belum ada rekod inventori'
            : 'Tiada item sepadan dengan carian'}
        </h3>
        <p className="mt-1 max-w-md text-sm text-slate-500">
          {totalItemCount === 0
            ? 'Mulakan dengan menambah produk pertama untuk memantau kuantiti stok dan peringatan paras minimum.'
            : 'Cuba ubah kata kunci carian, pilih kategori lain, atau paparkan semua status stok.'}
        </p>
        <div className="mt-5">
          {totalItemCount === 0 || !hasActiveFilters ? (
            <button
              type="button"
              onClick={onOpenCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800 whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Tambah Item Pertama
            </button>
          ) : (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
            >
              Set Semula Penapis
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* Desktop Table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-600">
              <th className="px-4 py-3 whitespace-nowrap">Kod Item</th>
              <th className="px-4 py-3">Nama Produk</th>
              <th className="px-4 py-3 whitespace-nowrap">Kategori</th>
              <th className="px-4 py-3 text-center whitespace-nowrap">
                Kuantiti Semasa
              </th>
              <th className="px-4 py-3 text-right whitespace-nowrap">
                Paras Min.
              </th>
              <th className="px-4 py-3 text-right whitespace-nowrap">
                Harga Seunit
              </th>
              <th className="px-4 py-3 text-right whitespace-nowrap">
                Nilai Stok
              </th>
              <th className="px-4 py-3 text-right whitespace-nowrap">
                Tindakan
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {items.map((item) => {
              const isLowStock = item.kuantiti_semasa <= item.paras_minimum;
              const stockValue = item.kuantiti_semasa * item.harga_seunit;

              return (
                <tr
                  key={item.id}
                  className={`transition-colors duration-150 ${
                    isLowStock
                      ? 'bg-rose-50/85 hover:bg-rose-100/70'
                      : 'bg-white hover:bg-slate-50/80'
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-xs font-medium text-slate-700 whitespace-nowrap">
                    {item.kod_item}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-medium text-slate-900">
                        {item.nama_produk}
                      </span>
                      {isLowStock ? (
                        <span className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800 whitespace-nowrap shrink-0">
                          <AlertTriangle
                            className="h-3 w-3 text-rose-700"
                            aria-hidden="true"
                          />
                          Stok Rendah
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-emerald-700 whitespace-nowrap">
                          Stok Mencukupi
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {item.kategori}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onQuickAdjust(item, -1)}
                        disabled={item.kuantiti_semasa <= 0}
                        aria-label={`Kurangkan stok ${item.nama_produk} sebanyak 1`}
                        title="Kurang 1 (-1)"
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span
                        className={`min-w-[2.75rem] text-center font-mono text-sm font-semibold tabular-nums ${
                          isLowStock ? 'text-rose-800' : 'text-slate-900'
                        }`}
                      >
                        {item.kuantiti_semasa}
                      </span>
                      <button
                        type="button"
                        onClick={() => onQuickAdjust(item, 1)}
                        aria-label={`Tambah stok ${item.nama_produk} sebanyak 1`}
                        title="Tambah 1 (+1)"
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-100 active:scale-95"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-600 tabular-nums whitespace-nowrap">
                    {item.paras_minimum}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-700 tabular-nums whitespace-nowrap">
                    {formatRM(item.harga_seunit)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-slate-900 tabular-nums whitespace-nowrap">
                    {formatRM(stockValue)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        aria-label={`Sunting ${item.nama_produk}`}
                        title="Sunting item"
                        className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        aria-label={`Padam ${item.nama_produk}`}
                        title="Padam item"
                        className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-rose-100 hover:text-rose-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="divide-y divide-slate-200 md:hidden">
        {items.map((item) => {
          const isLowStock = item.kuantiti_semasa <= item.paras_minimum;
          const stockValue = item.kuantiti_semasa * item.harga_seunit;

          return (
            <div
              key={item.id}
              className={`p-4 transition-colors ${
                isLowStock ? 'bg-rose-50/85' : 'bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono font-medium text-slate-700">
                      {item.kod_item}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{item.kategori}</span>
                  </div>
                  <h3 className="mt-1 text-sm font-semibold text-slate-900">
                    {item.nama_produk}
                  </h3>
                </div>
                {isLowStock && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800 whitespace-nowrap shrink-0">
                    <AlertTriangle
                      className="h-3 w-3 text-rose-700"
                      aria-hidden="true"
                    />
                    Stok Rendah
                  </span>
                )}
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-200/70 pt-3 text-xs">
                <div>
                  <span className="text-slate-500">Paras Min.</span>
                  <p className="mt-0.5 font-mono font-medium text-slate-800 tabular-nums">
                    {item.paras_minimum}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Harga Seunit</span>
                  <p className="mt-0.5 font-mono font-medium text-slate-800 tabular-nums">
                    {formatRM(item.harga_seunit)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Nilai Stok</span>
                  <p className="mt-0.5 font-mono font-semibold text-slate-900 tabular-nums">
                    {formatRM(stockValue)}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onQuickAdjust(item, -1)}
                    disabled={item.kuantiti_semasa <= 0}
                    aria-label={`Kurangkan stok ${item.nama_produk} sebanyak 1`}
                    className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-40"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span
                    className={`min-w-[2.5rem] text-center font-mono text-base font-semibold tabular-nums ${
                      isLowStock ? 'text-rose-800' : 'text-slate-900'
                    }`}
                  >
                    {item.kuantiti_semasa}
                  </span>
                  <button
                    type="button"
                    onClick={() => onQuickAdjust(item, 1)}
                    aria-label={`Tambah stok ${item.nama_produk} sebanyak 1`}
                    className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    aria-label={`Sunting ${item.nama_produk}`}
                    className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    aria-label={`Padam ${item.nama_produk}`}
                    className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-rose-100 hover:text-rose-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
