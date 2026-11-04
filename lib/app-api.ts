import "server-only";
import { auth } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";
import { connection } from "next/server";
import { ensureProfile, isAdmin, type Profile } from "./auth";

/**
 * The mobile app's API (app/api/app/…): JSON in and out, the person known from the Clerk session
 * token in the `Authorization: Bearer …` header. Cookies are never enough here, so another site
 * can't make a signed-in browser call these (no CSRF); that is also why any origin may call them.
 */

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly extra: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Max-Age": "86400",
};

const HEADERS = { ...CORS_HEADERS, "Cache-Control": "no-store" };

export const json = (data: unknown, status = 200) => Response.json(data, { status, headers: HEADERS });

/** A form's field errors (422), with an optional message for the whole form. */
export const invalid = (body: Record<string, unknown>) => json(body, 422);

/** The signed-in person's Clerk user id, from the Authorization header only. */
export async function appUserId(req: Request): Promise<string | null> {
  await connection();
  if (!req.headers.get("authorization")?.startsWith("Bearer ")) return null;
  const { userId } = await auth();
  return userId ?? null;
}

export async function requireAppUser(req: Request): Promise<string> {
  const userId = await appUserId(req);
  if (!userId) throw new ApiError(401, "Bu işlem için giriş yapın.", { code: "sign_in" });
  return userId;
}

/** For anything other people will see (listings, messages): signed in, with a name (409 otherwise: the app opens Hesabım). */
export async function requireNamedProfile(req: Request): Promise<Profile> {
  const profile = await ensureProfile(await requireAppUser(req));
  if (!profile.name) throw new ApiError(409, "Önce Hesabım’da adınızı yazın; ilanlarda ve mesajlarda bu ad görünür.", { code: "name_required" });
  return profile;
}

export async function requireAppAdmin(req: Request): Promise<string> {
  const userId = await requireAppUser(req);
  if (!(await isAdmin(userId))) throw new ApiError(403, "Bu bölüm yalnızca yöneticiler içindir.", { code: "not_admin" });
  return userId;
}

/** The request's JSON body as an object ({} when it has none). */
export async function body(req: Request): Promise<Record<string, unknown>> {
  try {
    const data = await req.json();
    return data && typeof data === "object" && !Array.isArray(data) ? (data as Record<string, unknown>) : {};
  } catch {
    throw new ApiError(400, "İstek okunamadı.");
  }
}

/** Cached pages using `tag` are rebuilt on their next visit (route handlers can't use updateTag). */
export const expireTag = (tag: string) => revalidateTag(tag, { expire: 0 });

type Ctx<P> = { params: Promise<P> };

/** Wraps a handler: known errors become their status, anything else a 500 (logged). */
export function handler<P = Record<string, never>>(fn: (req: Request, params: P) => Promise<Response>) {
  return async (req: Request, ctx: Ctx<P>) => {
    try {
      return await fn(req, await ctx.params);
    } catch (err) {
      if (err instanceof ApiError) return json({ error: err.message, ...err.extra }, err.status);
      console.error(`[app-api] ${req.method} ${new URL(req.url).pathname}`, err);
      return json({ error: "Sunucuda bir sorun oluştu. Biraz sonra yeniden deneyin." }, 500);
    }
  };
}

/** A path under public/ ("/market/…", "/demo/…") as a full address the phone can load. */
export const absolute = (req: Request, url: string) => (url.startsWith("/") ? new URL(url, req.url).toString() : url);
