import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  // Сид ідемпотентний і повністю перезаписує довідники/демо-товари —
  // безпечно, поки в базі немає реальних замовлень.
  await prisma.review.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.size.deleteMany({});
  await prisma.color.deleteMany({});

  // --- Категорії верхнього рівня + підкатегорії жіночої білизни ---
  const women = await prisma.category.upsert({
    where: { slug: "zhinocha-bilyzna" },
    update: {},
    create: { name: "Жіноча білизна", slug: "zhinocha-bilyzna", sortOrder: 1 },
  });

  const womenSubcategories = [
    { name: "Бюстгальтери", slug: "byustgaltery" },
    { name: "Труси", slug: "trusy" },
    { name: "Комплекти", slug: "komplekty" },
    { name: "Піжами", slug: "pizhamy" },
  ];

  const subcategoryBySlug: Record<string, { id: string }> = {};
  for (const [index, sub] of womenSubcategories.entries()) {
    subcategoryBySlug[sub.slug] = await prisma.category.upsert({
      where: { slug: sub.slug },
      update: {},
      create: { ...sub, parentId: women.id, sortOrder: index },
    });
  }

  const men = await prisma.category.upsert({
    where: { slug: "cholovicha-bilyzna" },
    update: {},
    create: { name: "Чоловіча білизна", slug: "cholovicha-bilyzna", sortOrder: 2 },
  });

  await prisma.category.upsert({
    where: { slug: "novynky" },
    update: {},
    create: {
      name: "Новинки",
      slug: "novynky",
      kind: "NEW_ARRIVALS",
      sortOrder: 3,
    },
  });

  await prisma.category.upsert({
    where: { slug: "aktsii" },
    update: {},
    create: {
      name: "Акції",
      slug: "aktsii",
      kind: "PROMO",
      sortOrder: 4,
    },
  });

  // --- Базова розмірна сітка (буквена) ---
  const sizeValues = ["XS", "S", "M", "L", "XL", "XXL"];
  const sizeByValue: Record<string, { id: string }> = {};
  for (const [index, value] of sizeValues.entries()) {
    sizeByValue[value] = await prisma.size.upsert({
      where: { value },
      update: {},
      create: { value, sortOrder: index },
    });
  }

  // --- Базові кольори зі swatch ---
  const colorDefs = [
    { name: "Чорний", hex: "#111111" },
    { name: "Білий", hex: "#FFFFFF" },
    { name: "Бежевий", hex: "#E8D3B9" },
    { name: "Червоний", hex: "#D6222A" },
    { name: "Рожевий", hex: "#E14B81" },
  ];
  const colorByName: Record<string, { id: string }> = {};
  for (const color of colorDefs) {
    colorByName[color.name] = await prisma.color.upsert({
      where: { name: color.name },
      update: {},
      create: color,
    });
  }

  // --- Демо-товари (для перевірки каталогу/фільтрів/картки до завантаження реального контенту) ---
  type DemoProduct = {
    slug: string;
    name: string;
    sku: string;
    categoryId: string;
    price: number;
    discountPrice?: number;
    fabricComposition?: string;
    description?: string;
    isNew?: boolean;
    isPromo?: boolean;
    variants: { size: string; color: string; stock: number }[];
  };

  const products: DemoProduct[] = [
    {
      slug: "bra-lace-touch",
      name: "Бюстгальтер Lace Touch",
      sku: "BRA-001",
      categoryId: subcategoryBySlug["byustgaltery"].id,
      price: 899,
      fabricComposition: "80% поліамід, 20% еластан",
      description: "Мереживний бюстгальтер без кісточок з м'якою підтримкою.",
      isNew: true,
      variants: [
        { size: "S", color: "Чорний", stock: 8 },
        { size: "M", color: "Чорний", stock: 5 },
        { size: "L", color: "Чорний", stock: 0 },
        { size: "S", color: "Бежевий", stock: 6 },
        { size: "M", color: "Бежевий", stock: 3 },
      ],
    },
    {
      slug: "panties-classic-comfort",
      name: "Труси Classic Comfort",
      sku: "PAN-001",
      categoryId: subcategoryBySlug["trusy"].id,
      price: 249,
      discountPrice: 199,
      fabricComposition: "95% бавовна, 5% еластан",
      description: "Базові бавовняні труси середньої посадки.",
      isPromo: true,
      variants: [
        { size: "S", color: "Чорний", stock: 12 },
        { size: "M", color: "Чорний", stock: 10 },
        { size: "L", color: "Чорний", stock: 7 },
        { size: "S", color: "Білий", stock: 9 },
        { size: "M", color: "Рожевий", stock: 4 },
        { size: "XL", color: "Білий", stock: 0 },
      ],
    },
    {
      slug: "set-silk-dream",
      name: "Комплект Silk Dream",
      sku: "SET-001",
      categoryId: subcategoryBySlug["komplekty"].id,
      price: 1499,
      discountPrice: 1199,
      fabricComposition: "Верх: 70% поліамід, 30% еластан",
      description: "Білизняний комплект бюстгальтер + труси в тон.",
      isNew: true,
      isPromo: true,
      variants: [
        { size: "S", color: "Червоний", stock: 4 },
        { size: "M", color: "Червоний", stock: 6 },
        { size: "L", color: "Червоний", stock: 0 },
        { size: "M", color: "Чорний", stock: 5 },
      ],
    },
    {
      slug: "pajama-cozy-night",
      name: "Піжама Cozy Night",
      sku: "PIJ-001",
      categoryId: subcategoryBySlug["pizhamy"].id,
      price: 799,
      fabricComposition: "100% бавовна",
      description: "Бавовняна піжама: сорочка на ґудзиках + штани.",
      isNew: true,
      variants: [
        { size: "S", color: "Бежевий", stock: 5 },
        { size: "M", color: "Бежевий", stock: 7 },
        { size: "L", color: "Білий", stock: 3 },
        { size: "XL", color: "Білий", stock: 2 },
      ],
    },
    {
      slug: "men-boxers-basic",
      name: "Чоловічі боксери Basic",
      sku: "MEN-001",
      categoryId: men.id,
      price: 349,
      fabricComposition: "95% бавовна, 5% еластан",
      description: "Базові бавовняні боксери, набір з 1 шт.",
      variants: [
        { size: "M", color: "Чорний", stock: 10 },
        { size: "L", color: "Чорний", stock: 8 },
        { size: "XL", color: "Чорний", stock: 6 },
        { size: "M", color: "Білий", stock: 0 },
      ],
    },
    {
      slug: "men-pajama-home",
      name: "Чоловіча піжама Home",
      sku: "MEN-002",
      categoryId: men.id,
      price: 999,
      discountPrice: 849,
      fabricComposition: "100% бавовна",
      description: "Домашній комплект: футболка + шорти.",
      isPromo: true,
      variants: [
        { size: "L", color: "Чорний", stock: 4 },
        { size: "XL", color: "Чорний", stock: 3 },
        { size: "XL", color: "Бежевий", stock: 2 },
        { size: "XXL", color: "Бежевий", stock: 0 },
      ],
    },
  ];

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        name: p.name,
        sku: p.sku,
        categoryId: p.categoryId,
        price: p.price,
        discountPrice: p.discountPrice,
        fabricComposition: p.fabricComposition,
        description: p.description,
        isNew: p.isNew ?? false,
        isPromo: p.isPromo ?? false,
      },
    });

    for (const v of p.variants) {
      await prisma.productVariant.upsert({
        where: {
          productId_sizeId_colorId: {
            productId: product.id,
            sizeId: sizeByValue[v.size].id,
            colorId: colorByName[v.color].id,
          },
        },
        update: { stock: v.stock },
        create: {
          productId: product.id,
          sizeId: sizeByValue[v.size].id,
          colorId: colorByName[v.color].id,
          stock: v.stock,
        },
      });
    }
  }

  // --- Демо-відгуки для блоку "Відгуки" на головній ---
  const reviews = [
    {
      authorName: "Оксана",
      rating: 5,
      text: "Замовляла комплект Silk Dream — сидить ідеально, тканина приємна. Доставка швидка.",
    },
    {
      authorName: "Марина",
      rating: 5,
      text: "Беру вже втретє, якість стабільно хороша, розміри відповідають таблиці.",
    },
    {
      authorName: "Ірина",
      rating: 4,
      text: "Все сподобалось, єдине — хотілося б більше кольорів.",
    },
  ];
  for (const review of reviews) {
    await prisma.review.upsert({
      where: { id: `seed-${review.authorName}` },
      update: {},
      create: { id: `seed-${review.authorName}`, ...review, isPublished: true },
    });
  }

  // --- Єдиний admin-акаунт (email/пароль беруться з .env, хеш оновлюється при кожному сіді) ---
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@golapravda.local").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash: hashPassword(adminPassword) },
    create: {
      email: adminEmail,
      passwordHash: hashPassword(adminPassword),
      name: "Адміністратор",
      role: "ADMIN",
    },
  });

  console.log("Seed завершено.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
