import { PlaceholderNotice } from "@/components/ui/PlaceholderNotice";

// ТИМЧАСОВИЙ ТЕКСТ для демонстрації клієнтці — замінити на реальні
// контактні дані (телефон, email, соцмережі, графік роботи).
export default function ContactsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Контакти</h1>
      <PlaceholderNotice />
      <dl className="space-y-3 text-sm text-neutral-700">
        <div>
          <dt className="font-medium text-neutral-900">Телефон</dt>
          <dd>+380 (00) 000-00-00</dd>
        </div>
        <div>
          <dt className="font-medium text-neutral-900">Email</dt>
          <dd>hello@golapravda.example</dd>
        </div>
        <div>
          <dt className="font-medium text-neutral-900">Instagram</dt>
          <dd>@golapravda</dd>
        </div>
        <div>
          <dt className="font-medium text-neutral-900">Графік роботи</dt>
          <dd>Пн–Пт, 09:00–18:00</dd>
        </div>
      </dl>
    </div>
  );
}
