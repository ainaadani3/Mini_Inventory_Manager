'use client';

import { AlertTriangle, Boxes, Coins } from 'lucide-react';
import { formatRM } from '@/lib/inventory-types';

interface SummaryCardsProps {
  totalProducts: number;
  lowStockCount: number;
  totalStockValue: number;
  isLoading: boolean;
}

export function SummaryCards({
  totalProducts,
  lowStockCount,
  totalStockValue,
  isLoading,
}: SummaryCardsProps) {
  const hasLowStock = lowStockCount > 0;

  return (
    <section
      aria-label="Ringkasan Inventori"
      className="grid grid-cols-1 gap-4 md:grid-cols-3"
    >
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-slate-600">
            Jumlah Produk
          </span>
          <Boxes className="h-4 w-4 text-slate-400" aria-hidden="true" />
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-2">
          {isLoading ? (
            <div className="h-9 w-20 animate-pulse rounded-md bg-slate-100" />
          ) : (
            <p className="font-mono text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">
              {totalProducts}
            </p>
          )}
          <span className="text-xs text-slate-500">Item berdaftar</span>
        </div>
      </div>

      <div
        className={`rounded-xl border p-5 transition-colors duration-150 ${
          hasLowStock
            ? 'border-rose-200 bg-rose-50/70'
            : 'border-slate-200 bg-white'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <span
            className={`text-sm font-medium ${
              hasLowStock ? 'text-rose-900' : 'text-slate-600'
            }`}
          >
            Item Stok Rendah
          </span>
          <AlertTriangle
            className={`h-4 w-4 ${
              hasLowStock ? 'text-rose-600' : 'text-slate-400'
            }`}
            aria-hidden="true"
          />
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-2">
          {isLoading ? (
            <div className="h-9 w-20 animate-pulse rounded-md bg-slate-100" />
          ) : (
            <p
              className={`font-mono text-3xl font-semibold tracking-tight tabular-nums ${
                hasLowStock ? 'text-rose-700' : 'text-slate-900'
              }`}
            >
              {lowStockCount}
            </p>
          )}
          <span
            className={`text-xs font-medium ${
              hasLowStock ? 'text-rose-700' : 'text-emerald-700'
            }`}
          >
            {isLoading
              ? 'Menyemak...'
              : hasLowStock
                ? 'Perlu restok segera'
                : 'Semua stok mencukupi'}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-slate-600">
            Nilai Keseluruhan Stok
          </span>
          <Coins className="h-4 w-4 text-slate-400" aria-hidden="true" />
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-2">
          {isLoading ? (
            <div className="h-9 w-36 animate-pulse rounded-md bg-slate-100" />
          ) : (
            <p className="font-mono text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">
              {formatRM(totalStockValue)}
            </p>
          )}
          <span className="text-xs text-slate-500">Jumlah semasa</span>
        </div>
      </div>
    </section>
  );
}
