import { getUserId } from "@/lib/auth";
import { getThread } from "@/lib/chat-data";

/** The open chat polls this every few seconds for new messages and offer answers. */
export async function GET(_req: Request, ctx: RouteContext<"/api/mesajlar/[id]">) {
  const userId = await getUserId();
  if (!userId) return Response.json({ error: "Giriş yapın." }, { status: 401 });
  const { id } = await ctx.params;
  const thread = await getThread(id, userId);
  if (!thread) return Response.json({ error: "Sohbet bulunamadı." }, { status: 404 });
  return Response.json({ thread }, { headers: { "Cache-Control": "no-store" } });
}
