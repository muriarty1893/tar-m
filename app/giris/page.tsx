import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/tool/AuthShell";
import { SignInForm } from "@/components/tool/AuthForms";
import { SignedInRedirect } from "@/components/tool/SignedInRedirect";

export const metadata: Metadata = { title: "Giriş yap", robots: { index: false } };

const formSpace = <div aria-hidden="true" className="h-[28rem] w-full max-w-[25rem] rounded-2xl bg-muted motion-safe:animate-pulse" />;

export default function SignInPage() {
  return (
    <AuthShell title="Giriş yapın">
      {/* Hash routing keeps every step on /giris, so the page stays static; the return address is read in the browser. */}
      <SignedInRedirect>
        <Suspense fallback={formSpace}>
          <SignInForm />
        </Suspense>
      </SignedInRedirect>
    </AuthShell>
  );
}
