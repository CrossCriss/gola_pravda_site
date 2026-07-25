import { prisma } from "@/lib/prisma";
import { Hero } from "@/components/home/Hero";
import { FeaturedCategorySection } from "@/components/home/FeaturedCategorySection";
import { UspBanner } from "@/components/home/UspBanner";
import { FaqSection } from "@/components/home/FaqSection";
import { buildProductWhereForCategory } from "@/lib/catalog";
import { getHomeBadges } from "@/lib/home-badges";

export const dynamic = "force-dynamic";

async function getFeaturedCategorySections() {
  const categories = await prisma.category.findMany({
    where: { isFeaturedOnHome: true, isVisible: true },
    include: { children: true },
    orderBy: { sortOrder: "asc" },
  });

  const productInclude = {
    images: { orderBy: { position: "asc" as const }, take: 2 },
    variants: { include: { size: true, color: true } },
  };

  return Promise.all(
    categories.map(async (category) => {
      const where = buildProductWhereForCategory(category);

      // Спочатку ручний відбір (showOnHomepage), відсортований за останнім
      // оновленням — без ручного порядку, як домовились. Якщо позначених
      // менше 4, решту місць добираємо найновішими товарами категорії.
      const pinned = await prisma.product.findMany({
        where: { ...where, showOnHomepage: true },
        orderBy: { updatedAt: "desc" },
        take: 4,
        include: productInclude,
      });

      const products =
        pinned.length >= 4
          ? pinned
          : [
              ...pinned,
              ...(await prisma.product.findMany({
                where: { ...where, id: { notIn: pinned.map((p) => p.id) } },
                orderBy: { createdAt: "desc" },
                take: 4 - pinned.length,
                include: productInclude,
              })),
            ];

      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        products: products.map((product) => {
          const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
          return {
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: Number(product.price),
            discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
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
            badges: getHomeBadges({
              isFeatured: product.isFeatured,
              createdAt: product.createdAt,
              totalStock,
            }),
          };
        }),
      };
    })
  );
}

async function getReviews() {
  return prisma.review.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
}

// Головна: hero-банер, секції-підбірки по обраних в адмінці категоріях,
// УТП-банер, відгуки, FAQ (редизайн за референс-структурою).
export default async function HomePage() {
  const [featuredSections, reviews] = await Promise.all([
    getFeaturedCategorySections(),
    getReviews(),
  ]);

  return (
    <div>
      <Hero
        title="Білизна, в якій зручно бути собою"
        subtitle="Жіноча та чоловіча білизна, комплекти й піжами — доставка по всій Україні."
        ctaLabel="До каталогу"
        ctaHref="/catalog"
        image="/images/hero-placeholder.jpg"
      />

      <div className="mx-auto max-w-6xl px-4 py-8">
        {featuredSections.map((section) => (
          <FeaturedCategorySection
            key={section.id}
            name={section.name}
            slug={section.slug}
            products={section.products}
          />
        ))}

        <UspBanner />

        <section className="mt-12">
          <h2 className="font-display text-xl font-bold">Відгуки</h2>
          {reviews.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">Відгуків поки немає.</p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-card border border-border bg-surface p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-ink">{review.authorName}</p>
                    <span className="text-sm text-accent">{"★".repeat(review.rating)}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{review.text}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <FaqSection />
      </div>
    </div>
  );
}
