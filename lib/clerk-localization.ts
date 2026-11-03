import { trTR } from "@clerk/localizations";
import { siteConfig } from "@/config/site";

/** Clerk's Turkish texts with the site's name in place of the Clerk app's ("ciftci-destek-auth"), plus a missing placeholder. */
function withSiteName<T>(value: T): T {
  if (typeof value === "string") return value.replaceAll("{{applicationName}}", siteConfig.name) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, withSiteName(v)])) as T;
  }
  return value;
}

export const clerkLocalization = {
  ...withSiteName(trTR),
  formFieldInputPlaceholder__signUpPassword: "Bir şifre belirleyin",
};
