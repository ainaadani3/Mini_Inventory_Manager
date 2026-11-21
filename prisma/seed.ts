import { prisma } from '../lib/prisma';

const sampleInventori = [
  {
    kod_item: 'KOP-001',
    nama_produk: 'Biji Kopi Arabica Panggang (1kg)',
    kategori: 'Minuman',
    kuantiti_semasa: 3,
    paras_minimum: 5,
    harga_seunit: 68.5,
  },
  {
    kod_item: 'KOP-002',
    nama_produk: 'Susu Segar Penuh Krim (1L)',
    kategori: 'Minuman',
    kuantiti_semasa: 18,
    paras_minimum: 10,
    harga_seunit: 7.9,
  },
  {
    kod_item: 'MIN-003',
    nama_produk: 'Serbuk Teh Tarik Premium (500g)',
    kategori: 'Minuman',
    kuantiti_semasa: 4,
    paras_minimum: 6,
    harga_seunit: 18.0,
  },
  {
    kod_item: 'MAK-001',
    nama_produk: 'Biskut Crackers Koperasi (Pek Besar)',
    kategori: 'Makanan',
    kuantiti_semasa: 24,
    paras_minimum: 8,
    harga_seunit: 12.5,
  },
  {
    kod_item: 'MAK-002',
    nama_produk: 'Roti Sandwic Gandum Penuh',
    kategori: 'Makanan',
    kuantiti_semasa: 5,
    paras_minimum: 5,
    harga_seunit: 4.8,
  },
  {
    kod_item: 'ALT-001',
    nama_produk: 'Buku Nota Kulit Keras A5 (80 Helaian)',
    kategori: 'Alat Tulis',
    kuantiti_semasa: 32,
    paras_minimum: 10,
    harga_seunit: 6.5,
  },
  {
    kod_item: 'ALT-002',
    nama_produk: 'Pen Mata Bola Hitam 0.5mm (Kotak 12)',
    kategori: 'Alat Tulis',
    kuantiti_semasa: 2,
    paras_minimum: 4,
    harga_seunit: 15.9,
  },
  {
    kod_item: 'BEN-001',
    nama_produk: 'Kit Pematerian Arduino & Breadboard Asas',
    kategori: 'Kit Bengkel',
    kuantiti_semasa: 9,
    paras_minimum: 4,
    harga_seunit: 54.0,
  },
  {
    kod_item: 'BEN-002',
    nama_produk: 'Dawai Pateri Bebas Plumbum (100g)',
    kategori: 'Kit Bengkel',
    kuantiti_semasa: 2,
    paras_minimum: 3,
    harga_seunit: 22.0,
  },
  {
    kod_item: 'LIN-001',
    nama_produk: 'Cawan Kertas Kafe 12oz & Penutup (50 pcs)',
    kategori: 'Lain-lain',
    kuantiti_semasa: 14,
    paras_minimum: 6,
    harga_seunit: 16.5,
  },
];

async function main() {
  await prisma.inventori.deleteMany();
  await prisma.inventori.createMany({
    data: sampleInventori,
  });
  console.log(`Berjaya mengisi ${sampleInventori.length} rekod inventori.`);
}

main()
  .catch((error) => {
    console.error('Ralat semasa mengisi data benih:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
