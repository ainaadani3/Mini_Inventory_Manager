import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { isValidKategori } from '@/lib/inventory-types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await prisma.inventori.findMany({
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error('GET /api/inventori error:', error);
    return NextResponse.json(
      {
        error:
          'Gagal memuatkan senarai inventori daripada pangkalan data. Pastikan DATABASE_URL telah dikonfigurasi dan jadual telah disegerakkan.',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Muatan JSON tidak sah.' },
        { status: 400 }
      );
    }

    const kod_item =
      typeof body.kod_item === 'string' ? body.kod_item.trim().toUpperCase() : '';
    const nama_produk =
      typeof body.nama_produk === 'string' ? body.nama_produk.trim() : '';
    const kategori =
      typeof body.kategori === 'string' ? body.kategori.trim() : '';
    const kuantiti_semasa = Number(body.kuantiti_semasa);
    const paras_minimum = Number(body.paras_minimum);
    const harga_seunit = Number(body.harga_seunit);

    if (!kod_item || kod_item.length < 2 || kod_item.length > 40) {
      return NextResponse.json(
        { error: 'Kod item mesti diisi (2 hingga 40 aksara).' },
        { status: 400 }
      );
    }

    if (!nama_produk || nama_produk.length < 2 || nama_produk.length > 160) {
      return NextResponse.json(
        { error: 'Nama produk mesti diisi (2 hingga 160 aksara).' },
        { status: 400 }
      );
    }

    if (!isValidKategori(kategori)) {
      return NextResponse.json(
        { error: 'Kategori yang dipilih tidak sah.' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(kuantiti_semasa) || kuantiti_semasa < 0) {
      return NextResponse.json(
        { error: 'Kuantiti semasa mestilah nombor bulat 0 atau lebih.' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(paras_minimum) || paras_minimum < 0) {
      return NextResponse.json(
        { error: 'Paras minimum mestilah nombor bulat 0 atau lebih.' },
        { status: 400 }
      );
    }

    if (!Number.isFinite(harga_seunit) || harga_seunit < 0) {
      return NextResponse.json(
        { error: 'Harga seunit mestilah nilai RM yang sah (0 atau lebih).' },
        { status: 400 }
      );
    }

    const roundedHarga = Math.round(harga_seunit * 100) / 100;

    const created = await prisma.inventori.create({
      data: {
        kod_item,
        nama_produk,
        kategori,
        kuantiti_semasa,
        paras_minimum,
        harga_seunit: roundedHarga,
      },
    });

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Kod item sudah wujud. Sila gunakan kod item yang unik.' },
          { status: 409 }
        );
      }
    }

    console.error('POST /api/inventori error:', error);
    return NextResponse.json(
      { error: 'Gagal menyimpan rekod inventori baharu.' },
      { status: 500 }
    );
  }
}
