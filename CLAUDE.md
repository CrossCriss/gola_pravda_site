# Gola Pravda

Інтернет-магазин жіночої та чоловічої білизни (Gola Pravda). Каталог з категоріями/розмірами/кольорами і залишками по варіантах, кошик, чекаут без обов'язкової реєстрації, адмінка для керування товарами/категоріями/замовленнями. Увесь контент і UI — виключно українською.

## Стек

- Next.js 14 (App Router, `src/app`)
- TypeScript, Tailwind CSS
- Prisma + PostgreSQL (Supabase)
- Zustand (кошик, client-side, persist у localStorage)
- Zod (валідація форм і API)
- Supabase Storage (фото товарів в адмінці)

## Команди

```bash
npm run dev              # локальний запуск (next dev)
npm run build             # production build
npm run typecheck         # tsc --noEmit

npm run prisma:migrate    # накатити міграції (prisma migrate dev)
npm run prisma:seed       # засіяти БД (категорії, розміри, кольори, демо-товари, admin-акаунт, відгуки)
npm run prisma:studio     # Prisma Studio
```

`.env` містить `DATABASE_URL`/`DIRECT_URL` (Supabase pooler/direct), `ADMIN_SESSION_SECRET`, `ADMIN_EMAIL`/`ADMIN_PASSWORD` (застосовуються тільки через `prisma:seed`), `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` (фото), `NEXTAUTH_URL`/`NEXTAUTH_SECRET` і `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` (кабінет клієнта, Google OAuth — реальні ключі вже підключені).

**Важливо:** зміна `ADMIN_EMAIL`/`ADMIN_PASSWORD` у `.env` не діє сама по собі — потрібно повторно виконати `npm run prisma:seed`, щоб оновити хеш пароля в БД.

## Карта ключових папок

- `prisma/schema.prisma` — уся схема БД (Category, Product, ProductVariant, Size, Color, Order, AdminUser, User/Account/Session/SavedAddress тощо)
- `prisma/seed.ts` — сідування (ідемпотентне, очищує й пересоздає довідники/демо-товари)
- `src/app/(public)/` — публічний сайт: `catalog/`, `catalog/[categorySlug]/`, `product/[productSlug]/`, `search/` (пошук за назвою товару + категорією), `cart/`, `checkout/`, `thank-you/`, статичні сторінки (about/delivery/returns/contacts/privacy)
- `src/app/(admin)/admin/` — адмінка (products/categories/orders/promocodes), захищена `src/middleware.ts`
- `src/app/(admin-auth)/admin/login/` — сторінка логіну, окрема route group, щоб не успадковувати layout адмінки
- `src/app/(account)/account/` — кабінет клієнта (`/account`, `discounts/`, `orders/`, `orders/[id]/`, `profile/`), захищений `src/middleware.ts` через NextAuth JWT
- `src/app/(account-auth)/account/login/` — форма входу/реєстрації, окрема route group (як admin-login)
- `src/app/api/` — route handlers (публічні `products`/`categories`/`orders`, адмінські `api/admin/*`, `api/admin/upload` для фото, кабінет `api/account/*`, NextAuth `api/auth/[...nextauth]`)
- `src/components/catalog/` — `ProductCard`, `ProductGrid`, `CategoryGrid`, `CatalogFilters`
- `src/components/home/` — `Hero`, `FeaturedCategorySection` (секції-підбірки на головній за `Category.isFeaturedOnHome`), `UspBanner`, `FaqSection`
- `src/lib/home-badges.ts` — бейджі на картці товару лише для головної (Топ продажів/Новинка/Останні одиниці), окремо від `isNew`/`isPromo` каталогу
- `src/components/product/` — `ProductGallery`, `ProductOptions` (вибір розміру/кольору, врахування залишку)
- `src/components/cart/` — `CartDrawer`, `CartTriggerButton`
- `src/components/checkout/` — компоненти форми оформлення замовлення
- `src/components/admin/` — `ProductForm`, `CategoryForm`, `OrderStatusControl`, `DeleteButton`, `AdminLogoutButton`
- `src/components/account/` — `AccountNav`, `ProfileForm`, `PasswordForm`, `SavedAddressList`
- `src/lib/cart-store.ts` — Zustand-стор кошика (persist тільки `items`, `isOpen` — ні)
- `src/lib/format-price.ts` — єдина функція форматування ціни (без `Intl`, щоб уникнути hydration mismatch між сервером і клієнтом)
- `src/lib/admin-session.ts` — сесії адмінки (HMAC-cookie, Edge-safe); `src/lib/password.ts` — хешування пароля (Node-only, scrypt), спільне для адмінки й кабінету клієнта
- `src/lib/catalog.ts` — побудова Prisma-фільтрів для категорій (включно з підкатегоріями, "Новинки"/"Акції" по флагах товару)
- `src/lib/auth.ts` — конфіг NextAuth (Credentials за телефоном/email + Google, JWT-сесії, PrismaAdapter)
- `src/lib/loyalty.ts` — рівні накопичувальної знижки, рахуються "наживо" з `Order` (без кешованого поля) за `getLoyaltySummary(userId)`
- `src/lib/phone.ts` / `identifier.ts` — маска й нормалізація українського номера, розбір поля "телефон або email"

## Що НЕ чіпати без явного запиту

- **LiqPay** — на чекауті тільки вибір способу оплати (`paymentMethod`), реального виклику API немає. Не підключати без окремого завдання. Адмін може вручну проставити `paymentStatus = PAID` в деталях замовлення (`OrderStatusControl`) — це тимчасовий тригер накопичувальної знижки для LiqPay-замовлень до підключення реального колбека.
- **Nova Poshta** — відділення на чекауті це звичайне текстове поле, не віджет API. ТТН на сторінці "Дякуємо за замовлення" поки не показується.
- **GA4 / Meta Pixel** — ще не підключені.
- Плейсхолдерний текст на сторінках about/delivery/returns/contacts/privacy — позначений банером у UI й коментарем у коді, чекає реального контенту від клієнтки.

## Статус модулів

| Модуль | Статус |
|---|---|
| Структура проекту, Prisma-схема | ✅ Готово |
| Каталог, картка товару, кошик | ✅ Готово, наповнено реальними товарами |
| Чекаут (UI, без реальної оплати) | ✅ Готово |
| Адмінка (товари/категорії/замовлення/промокоди) | ✅ Готово |
| Імпорт товарів з CRM | ✅ Готово (532 товари) |
| Дизайн-система | ✅ Застосована, дрібні фікси в процесі |
| Опис товару в картці | ✅ Готово (поле вже було в схемі, тестові тексти додані — реальні очікуємо від клієнтки) |
| Анімації/мікро-інтеракції (hover, transitions) | ✅ Промпт відправлено, очікуємо результат/скріни |
| Фільтр колір/принт | ✅ Прибрано з сайдбару каталогу, залишено лише на картці товару |
| Quick-add в кошик з каталогу (popover: колір/розмір/кількість) | ✅ Реалізовано, потребує фінальної перевірки (валідація обов'язкових полів + мобільна версія) |
| Loading-skeleton для сторінки категорії | ✅ Готово |
| Loading-skeleton для головної сторінки | ✅ Готово (під нову структуру: секції-каруселі, банер, FAQ) |
| Редизайн головної: секції-підбірки по категоріях + банер УТП + FAQ | ✅ Готово (isFeaturedOnHome чекбокс в адмінці, бейджі Новинка/Останні одиниці/Топ продажів) |
| Ручний відбір товарів на головну (showOnHomepage) | ✅ Готово |
| Чекбокс "Показувати на головній" для категорій в таблиці | ✅ Готово |
| Діагностика та оптимізація швидкості каталогу | ✅ Готово (relationJoins + кешування findCategoryBySlug/getPrintFilterData, ~35% приріст: 830→550мс на найбільшій категорії) |
| Пошук по сайту | ✅ Готово (поле в шапці, `/search`, пошук за назвою товару + категорією) |
| Пошук товарів в адмінці (/admin/products) | ✅ Готово |
| Особистий кабінет клієнта + накопичувальна система знижок | ✅ Готово (реєстрація/вхід телефон+пароль, Google OAuth, знижки 3-10% за рівнями, історія замовлень, збережені адреси, автозаповнення чекауту) |
| Google OAuth (реальні credentials) | ✅ Підключено та перевірено |
| Telegram-повідомлення про замовлення | 🆕 Заплановано |
| LiqPay (реальні ключі) | ⬜ Не розпочато — чекає модерації LiqPay |
| Nova Poshta API (автокомпліт, ТТН) | ⬜ Не розпочато |
| Реальні фото товарів | ⬜ Чекаємо від клієнтки |
| Тексти сторінок (Про нас/Доставка/Контакти) | ⬜ Чекаємо від клієнтки |
| GA4 / Meta Pixel | ⬜ Не розпочато |
| Домен + хостинг + деплой | ⬜ Не розпочато (ФОП є, можна купувати) |
| Мобільна версія: поле пошуку в шапці обрізалось | ✅ Виправлено |
| Мобільна адаптивність (фінальна перевірка) | ⬜ Не розпочато |
