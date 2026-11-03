import { getUserId, isAdmin } from "@/lib/auth";

/**
 * The news editor's diagnostics: what happened on a save or upload in the admin's browser, written
 * to the server log (Vercel → Logs, "[editor]"). Admins only; a few hundred bytes at most.
 */
export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId || !(await isAdmin(userId))) return new Response(null, { status: 204 });
  const text = (await request.text()).slice(0, 2000);
  console.log(`[editor] ${userId} ${text}`);
  return new Response(null, { status: 204 });
}
