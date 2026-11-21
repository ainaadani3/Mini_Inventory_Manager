export const KATEGORI_OPTIONS = [
  'Alat Tulis',
  'Makanan',
  'Minuman',
  'Kit Bengkel',
  'Lain-lain',
] as const;

export type KategoriOption = (typeof KATEGORI_OPTIONS)[number];

export interface InventoriItem {
  id: number;
  kod_item: string;
  nama_produk: string;
  kategori: string;
  kuantiti_semasa: number;
  paras_minimum: number;
  harga_seunit: number;
  createdAt: string;
}

export interface InventoriFormPayload {
  kod_item: string;
  nama_produk: string;
  kategori: KategoriOption;
  kuantiti_semasa: number;
  paras_minimum: number;
  harga_seunit: number;
}

export function isValidKategori(value: string): value is KategoriOption {
  return (KATEGORI_OPTIONS as readonly string[]).includes(value);
}

export function formatRM(value: number): string {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(value)
    .replace('MYR', 'RM');
}
