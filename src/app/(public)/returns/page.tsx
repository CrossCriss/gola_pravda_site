import { PlaceholderNotice } from "@/components/ui/PlaceholderNotice";

// ТИМЧАСОВИЙ ТЕКСТ для демонстрації клієнтці — узгодити реальні умови
// повернення/обміну з чинним законодавством про захист прав споживачів.
export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Повернення/обмін</h1>
      <PlaceholderNotice />
      <div className="space-y-4 text-sm leading-relaxed text-neutral-700">
        <p>
          Ми хочемо, щоб ви залишились задоволені покупкою. Якщо розмір не підійшов або товар не
          відповідає опису — зв&apos;яжіться з нами протягом 14 днів з дня отримання замовлення.
        </p>
        <p>
          Обмін і повернення можливі за умови збереження товарного вигляду, бирок та упаковки. З
          міркувань гігієни повернення білизни, що контактує з тілом, можливе лише за наявності
          виробничого браку.
        </p>
      </div>
    </div>
  );
}
