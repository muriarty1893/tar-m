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
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:py-16 lg:grid-cols-[1fr_auto] lg:items-start">
      <div className="max-w-xl">
        <p className="eyebrow">{siteConfig.name} hesabı</p>
        <h1 className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-3 text-lg text-muted-foreground">Hesap ücretsizdir. E-posta adresinizle ya da Google hesabınızla girebilirsiniz.</p>
        <ul className="mt-8 space-y-4">
          {perks.map(({ Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-lg">
              <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                <Icon weight="duotone" className="size-6" />
              </span>
              <span className="pt-1.5">{text}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex justify-center lg:justify-end">{children}</div>
    </div>
  );
}
