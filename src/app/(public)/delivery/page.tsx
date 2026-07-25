import { PlaceholderNotice } from "@/components/ui/PlaceholderNotice";

// ТИМЧАСОВИЙ ТЕКСТ для демонстрації клієнтці — уточнити реальні терміни,
// вартість доставки та точні умови оплати.
export default function DeliveryPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Доставка та оплата</h1>
      <PlaceholderNotice />

      <div className="space-y-6 text-sm leading-relaxed text-neutral-700">
        <section>
          <h2 className="mb-2 font-semibold text-neutral-900">Доставка</h2>
          <p>
            Ми надсилаємо замовлення по всій Україні через Нову Пошту — у відділення або кур&apos;єром
            за вказаною адресою. Термін доставки — зазвичай 1–3 робочі дні залежно від міста.
          </p>
          <p className="mt-2">
            Вартість доставки розраховується Новою Поштою під час оформлення замовлення і
            сплачується окремо від вартості товару.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-neutral-900">Оплата</h2>
          <p>На сторінці оформлення замовлення доступні два способи оплати:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>LiqPay — онлайн-оплата карткою;</li>
            <li>Накладений платіж — оплата при отриманні на відділенні Нової Пошти.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
