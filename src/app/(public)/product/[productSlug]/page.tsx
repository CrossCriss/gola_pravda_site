import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductOptions } from "@/components/product/ProductOptions";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: { productSlug: string };
}) {
  const product = await prisma.product.findUnique({
    where: { slug: params.productSlug, isPublished: true },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { include: { size: true, color: true } },
    },
  });

  if (!product) notFound();

  const variants = product.variants
    .slice()
    .sort((a, b) => a.size.sortOrder - b.size.sortOrder)
    .map((variant) => ({
      id: variant.id,
      size: variant.size.value,
      color: variant.color.name,
      colorHex: variant.color.hex,
      stock: variant.stock,
    }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery images={product.images.map((image) => ({ url: image.url, alt: image.alt }))} />

        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="mt-1 text-sm text-neutral-400">Артикул: {product.sku}</p>

          <div className="mt-6">
            <ProductOptions
              productSlug={product.slug}
              name={product.name}
              price={Number(product.price)}
              discountPrice={product.discountPrice ? Number(product.discountPrice) : null}
              image={product.images[0]?.url}
              variants={variants}
            />
          </div>

          {product.description && (
            <p className="mt-8 text-sm leading-relaxed text-neutral-600">{product.description}</p>
          )}

          {product.fabricComposition && (
            <p className="mt-4 text-sm text-neutral-500">
              <span className="font-medium text-neutral-700">Склад тканини: </span>
              {product.fabricComposition}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
