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

/**
 * Clerk's bot check ("Protect": a Cloudflare "Verify you are human" box after the e-mail and password).
 * Clerk's Turkish pack has no texts for it yet, so it showed in English.
 */
const protectCheck = {
  title: "Güvenlik kontrolü",
  subtitle: "Robot olmadığınızı doğruluyoruz. Kutu çıkarsa işaretleyin.",
  loading: "Yükleniyor…",
  retryButton: "Yeniden dene",
};

export const clerkLocalization = {
  ...withSiteName(trTR),
  formFieldInputPlaceholder__signUpPassword: "Bir şifre belirleyin",
  signUp: { ...withSiteName(trTR.signUp), protectCheck },
  signIn: { ...withSiteName(trTR.signIn), protectCheck },
  unstable__errors: {
    ...trTR.unstable__errors,
    protect_check_execution_failed: "Doğrulama tamamlanamadı. “Yeniden dene”ye basın ya da Google ile devam edin.",
    protect_check_timed_out: "Doğrulama zamanında tamamlanamadı. “Yeniden dene”ye basın.",
    protect_check_script_load_failed: "Doğrulama yüklenemedi. İnternet bağlantınızı kontrol edip yeniden deneyin.",
    protect_check_invalid_script: "Doğrulama yüklenemedi. Sorun sürerse bize yazın.",
    protect_check_invalid_sdk_url: "Doğrulama başlatılamadı. Sorun sürerse bize yazın.",
    protect_check_required: "Bu işlem için ek bir doğrulama gerekiyor. Yeniden deneyin ya da Google ile devam edin.",
    protect_check_unsupported_environment: "Doğrulama bu tarayıcıda çalışmıyor. Chrome ya da Safari ile yeniden deneyin.",
  },
};
