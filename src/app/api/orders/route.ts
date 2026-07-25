import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createOrderSchema } from "@/lib/checkout-schema";
import { getLoyaltySummary } from "@/lib/loyalty";

export const dynamic = "force-dynamic";

// POST /api/orders — створення замовлення при оформленні чекауту.
// Інтеграція з LiqPay/Nova Poshta — окремі задачі: тут замовлення просто
// зберігається зі статусом NEW і обраним paymentMethod, без реального виклику LiqPay API.
// Клієнт надсилає лише variantId+quantity — ціна, назва, sku, розмір і колір
// підтягуються з БД тут, а не приймаються від клієнта як є.
export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некоректні дані замовлення", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { items, email, comment, ...customer } = parsed.data;

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: items.map((item) => item.variantId) } },
    include: { product: true, size: true, color: true },
  });

  if (variants.length !== items.length) {
    return NextResponse.json(
      { error: "Один або декілька товарів у кошику більше не доступні" },
      { status: 400 }
    );
  }

  const variantById = new Map(variants.map((variant) => [variant.id, variant]));

  const orderItems = items.map((item) => {
    const variant = variantById.get(item.variantId)!;
    const price = variant.product.discountPrice ?? variant.product.price;

    return {
      productId: variant.product.id,
      variantId: variant.id,
      productName: variant.product.name,
      sku: variant.sku ?? variant.product.sku,
      size: variant.size.value,
      color: variant.color.name,
      price,
      quantity: item.quantity,
      total: Number(price) * item.quantity,
    };
  });

  const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);

  // Знижку за накопичувальним рівнем рахуємо тільки на сервері (з сесії),
  // клієнт не може передати userId/відсоток самостійно.
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  let discountTotal = 0;
  if (userId) {
    const { tier } = await getLoyaltySummary(userId);
    discountTotal = Math.round(subtotal * (tier.percent / 100));
  }

  const order = await prisma.order.create({
    data: {
      orderNumber: `GP-${Date.now()}`,
      status: "NEW",
      paymentMethod: customer.paymentMethod,
      customerName: customer.customerName,
      phone: customer.phone,
      email: email || undefined,
      shippingCity: customer.shippingCity,
      shippingWarehouse: customer.shippingWarehouse,
      comment: comment || undefined,
      subtotal,
      discountTotal,
      total: subtotal - discountTotal,
      userId,
      items: { create: orderItems },
    },
    include: { items: true },
  });

  if (userId) {
    const existing = await prisma.savedAddress.findFirst({
      where: { userId, city: customer.shippingCity, warehouse: customer.shippingWarehouse },
    });

    if (existing) {
      await prisma.savedAddress.update({
        where: { id: existing.id },
        data: { recipientName: customer.customerName, phone: customer.phone },
      });
    } else {
      await prisma.savedAddress.updateMany({ where: { userId }, data: { isDefault: false } });
      await prisma.savedAddress.create({
        data: {
          userId,
          recipientName: customer.customerName,
          phone: customer.phone,
          city: customer.shippingCity,
          warehouse: customer.shippingWarehouse,
          isDefault: true,
        },
      });
    }
  }

  return NextResponse.json(order, { status: 201 });
}
