import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { isValidKategori } from '@/lib/inventory-types';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseItemId(rawId: string): number | null {
  const numeric = Number(rawId);
  if (!Number.isInteger(numeric) || numeric <= 0) {
    return null;
  }
  return numeric;
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const itemId = parseItemId(id);

    if (itemId === null) {
      return NextResponse.json(
        { error: 'ID item tidak sah.' },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Muatan JSON tidak sah.' },
        { status: 400 }
      );
    }

    // Quick +1 / -1 stock delta adjustment
    if (typeof body.delta === 'number') {
      if (body.delta !== 1 && body.delta !== -1) {
        return NextResponse.json(
          { error: 'Pelarasan pantas hanya menyokong delta +1 atau -1.' },
          { status: 400 }
        );
      }

      const existing = await prisma.inventori.findUnique({
        where: { id: itemId },
      });

      if (!existing) {
        return NextResponse.json(
          { error: 'Rekod inventori tidak ditemui.' },
          { status: 404 }
        );
      }

      const nextQuantity = Math.max(0, existing.kuantiti_semasa + body.delta);
      const updated = await prisma.inventori.update({
        where: { id: itemId },
        data: { kuantiti_semasa: nextQuantity },
      });

      return NextResponse.json({ item: updated }, { status: 200 });
    }

    const updateData: {
      kod_item?: string;
      nama_produk?: string;
      kategori?: string;
      kuantiti_semasa?: number;
      paras_minimum?: number;
      harga_seunit?: number;
    } = {};

    if (body.kod_item !== undefined) {
      const kod_item =
        typeof body.kod_item === 'string' ? body.kod_item.trim().toUpperCase() : '';
      if (!kod_item || kod_item.length < 2 || kod_item.length > 40) {
        return NextResponse.json(
          { error: 'Kod item mesti diisi (2 hingga 40 aksara).' },
          { status: 400 }
        );
      }
      updateData.kod_item = kod_item;
    }

    if (body.nama_produk !== undefined) {
      const nama_produk =
        typeof body.nama_produk === 'string' ? body.nama_produk.trim() : '';
      if (!nama_produk || nama_produk.length < 2 || nama_produk.length > 160) {
        return NextResponse.json(
          { error: 'Nama produk mesti diisi (2 hingga 160 aksara).' },
          { status: 400 }
        );
      }
      updateData.nama_produk = nama_produk;
    }

    if (body.kategori !== undefined) {
      const kategori =
        typeof body.kategori === 'string' ? body.kategori.trim() : '';
      if (!isValidKategori(kategori)) {
        return NextResponse.json(
          { error: 'Kategori yang dipilih tidak sah.' },
          { status: 400 }
        );
      }
      updateData.kategori = kategori;
    }

    if (body.kuantiti_semasa !== undefined) {
      const kuantiti_semasa = Number(body.kuantiti_semasa);
      if (!Number.isInteger(kuantiti_semasa) || kuantiti_semasa < 0) {
        return NextResponse.json(
          { error: 'Kuantiti semasa mestilah nombor bulat 0 atau lebih.' },
          { status: 400 }
        );
      }
      updateData.kuantiti_semasa = kuantiti_semasa;
    }

    if (body.paras_minimum !== undefined) {
      const paras_minimum = Number(body.paras_minimum);
      if (!Number.isInteger(paras_minimum) || paras_minimum < 0) {
        return NextResponse.json(
          { error: 'Paras minimum mestilah nombor bulat 0 atau lebih.' },
          { status: 400 }
        );
      }
      updateData.paras_minimum = paras_minimum;
    }

    if (body.harga_seunit !== undefined) {
      const harga_seunit = Number(body.harga_seunit);
      if (!Number.isFinite(harga_seunit) || harga_seunit < 0) {
        return NextResponse.json(
          { error: 'Harga seunit mestilah nilai RM yang sah (0 atau lebih).' },
          { status: 400 }
        );
      }
      updateData.harga_seunit = Math.round(harga_seunit * 100) / 100;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Tiada medan sah diberikan untuk dikemas kini.' },
        { status: 400 }
      );
    }

    const updated = await prisma.inventori.update({
      where: { id: itemId },
      data: updateData,
    });

    return NextResponse.json({ item: updated }, { status: 200 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Rekod inventori tidak ditemui.' },
          { status: 404 }
        );
      }
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Kod item sudah wujud. Sila gunakan kod item yang unik.' },
          { status: 409 }
        );
      }
    }

    console.error('PATCH /api/inventori/[id] error:', error);
    return NextResponse.json(
      { error: 'Gagal mengemas kini rekod inventori.' },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const itemId = parseItemId(id);

    if (itemId === null) {
      return NextResponse.json(
        { error: 'ID item tidak sah.' },
        { status: 400 }
      );
    }

    await prisma.inventori.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ success: true, id: itemId }, { status: 200 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Rekod inventori tidak ditemui.' },
          { status: 404 }
        );
      }
    }

    console.error('DELETE /api/inventori/[id] error:', error);
    return NextResponse.json(
      { error: 'Gagal memadam rekod inventori.' },
      { status: 500 }
    );
  }
}
