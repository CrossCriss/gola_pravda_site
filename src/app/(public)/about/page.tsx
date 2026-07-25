import { PlaceholderNotice } from "@/components/ui/PlaceholderNotice";

// ТИМЧАСОВИЙ ТЕКСТ для демонстрації клієнтці — замінити на реальну історію
// бренду, коли вона надасть контент.
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Про нас</h1>
      <PlaceholderNotice />
      <div className="space-y-4 text-sm leading-relaxed text-neutral-700">
        <p>
          Gola Pravda — бренд жіночої та чоловічої білизни, який ми створюємо з любов&apos;ю до
          якісних тканин і зручного крою. Ми віримо, що білизна має бути не лише красивою, а й
          комфортною у щоденному носінні.
        </p>
        <p>
          Наша команда уважно добирає матеріали та тестує кожну модель, перш ніж вона потрапляє в
          каталог. Ми прагнемо, щоб кожна покупка приносила задоволення — від вибору моделі до
          отримання посилки.
        </p>
      </div>
    </div>
  );
}
