import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";
import { ChatsCircleIcon, NotebookIcon, PlantIcon, StorefrontIcon } from "@phosphor-icons/react/dist/ssr";

const perks = [
  { Icon: StorefrontIcon, text: "Pazar’da ürününüzü, aletinizi ya da aracınızı ilan edin." },
  { Icon: ChatsCircleIcon, text: "Alıcı ve satıcılarla site içinden mesajlaşın, teklif verin." },
  { Icon: PlantIcon, text: "Tarlalarınızı ve sezon masraflarınızı kaydedin." },
  { Icon: NotebookIcon, text: "Tarım takviminizde işlerinizi planlayın, yaptıklarınızı işaretleyin." },
];

/** The sign-in and sign-up pages: Clerk's form beside what an account gives you. */
export function AuthShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto grid max-w-6xl gap-5 px-4 py-4 sm:py-10 lg:grid-cols-[1fr_auto] lg:items-start">
      <div className="max-w-xl">
        <p className="eyebrow">{siteConfig.name} hesabı</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-1.5 text-muted-foreground">Hesap ücretsizdir. E-posta adresinizle ya da Google hesabınızla girebilirsiniz.</p>
        <ul className="mt-4 divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
          {perks.map(({ Icon, text }) => (
            <li key={text} className="flex items-center gap-2.5 px-3 py-2.5 text-[0.9375rem]">
              <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
                <Icon weight="fill" className="size-4" />
              </span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex justify-center lg:justify-end">{children}</div>
    </div>
  );
}
