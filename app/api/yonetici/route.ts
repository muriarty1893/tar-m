import { getUserId, isAdmin } from "@/lib/auth";

/** Whether the signed-in person is an admin, so the Hızlı menü can show "Yönetim". */
export async function GET() {
  const userId = await getUserId();
  return Response.json({ admin: await isAdmin(userId) }, { headers: { "Cache-Control": "private, no-store" } });
}
