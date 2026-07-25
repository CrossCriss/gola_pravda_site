import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { findCategoryBySlug, buildProductWhereForCategory, getPrintFilterData } from "@/lib/catalog";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { CatalogPagination } from "@/components/catalog/CatalogPagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

function parseListParam(value?: string) {
  return value ? value.split(",").filter(Boolean) : [];
}

// Сторінка категорії: фільтри (розмір/принт/ціна) + сітка товарів, все —
// реальні запити до Prisma, фільтри прив'язані до query-параметрів
// (?size=&print=&minPrice=&maxPrice=&page=).
// Батьківські категорії (напр. "Жіноча білизна") включають усі підкатегорії —
// це може бути кілька сотень товарів, тож сітка завжди пагінована.
export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { categorySlug: string };
  searchParams: {
    size?: string;
    print?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  };
}) {
  const category = await findCategoryBySlug(params.categorySlug);
  if (!category) notFound();

  const baseWhere = buildProductWhereForCategory(category);

  const selectedSizes = parseListParam(searchParams.size);
  const selectedPrints = parseListParam(searchParams.print);
  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : undefined;
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined;
  const requestedPage = Math.max(1, Number(searchParams.page) || 1);

  // availableSizes/printFilterData обидва рахуються від baseWhere (масштаб
  // категорії) — список опцій фільтра не звужується від інших активних
  // фільтрів. "Принт" — не поле в БД, а похідне значення з назви товару
  // (color-print.ts), тому для нього потрібен окремий запит:
  // getPrintFilterData одразу повертає і список доступних принтів (для
  // чипсів), і id товарів, що відповідають обраним — останнє йде у
  // filteredWhere нижче.
  const [availableSizes, printFilterData] = await Promise.all([
    prisma.size.findMany({
      where: { variants: { some: { stock: { gt: 0 }, product: baseWhere } } },
      orderBy: { sortOrder: "asc" },
    }),
    getPrintFilterData(baseWhere, selectedPrints),
  ]);

  const filteredWhere = {
    ...baseWhere,
    ...(selectedSizes.length
      ? { variants: { some: { size: { value: { in: selectedSizes } } } } }
      : {}),
    ...(selectedPrints.length ? { id: { in: printFilterData.matchedProductIds } } : {}),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? { price: { gte: minPrice, lte: maxPrice } }
      : {}),
  };

  // Продукти на "оптимістичній" (запитаній) сторінці запитуємо в тому ж
  // Promise.all, що й count — один раунд-трип до Supabase замість двох
  // послідовних. Правильним він виявляється майже завжди; рідкісний
  // випадок "page" за межами діапазону (ручна зміна URL) обробляється
  // нижче окремим (другим) запитом.
  const [totalCount, optimisticProducts] = await Promise.all([
    prisma.product.count({ where: filteredWhere }),
    prisma.product.findMany({
      where: filteredWhere,
      include: {
        images: { orderBy: { position: "asc" }, take: 2 },
        variants: { include: { size: true, color: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (requestedPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      relationLoadStrategy: "join",
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);

  const rawProducts =
    page === requestedPage
      ? optimisticProducts
      : await prisma.product.findMany({
          where: filteredWhere,
          include: {
            images: { orderBy: { position: "asc" }, take: 2 },
            variants: { include: { size: true, color: true } },
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
          relationLoadStrategy: "join",
        });

  const products = rawProducts.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: Number(product.price),
    discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
    isNew: product.isNew,
    isPromo: product.isPromo,
    images: product.images,
    variants: product.variants
      .slice()
      .sort((a, b) => a.size.sortOrder - b.size.sortOrder)
      .map((variant) => ({
        id: variant.id,
        size: variant.size.value,
        color: variant.color.name,
        colorHex: variant.color.hex,
        stock: variant.stock,
      })),
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold">{category.name}</h1>

      <div className="mt-6 flex flex-col gap-8 md:flex-row">
        <CatalogFilters
          sizes={availableSizes.map((size) => size.value)}
          prints={printFilterData.availablePrints}
        />
        <div key={JSON.stringify(searchParams)} className="flex-1 animate-fade-in-up">
          <ProductGrid
            products={products}
            emptyMessage="За обраними фільтрами нічого не знайдено."
          />
          <CatalogPagination currentPage={page} totalPages={totalPages} searchParams={searchParams} />
        </div>
      </div>
    </div>
  );
}
