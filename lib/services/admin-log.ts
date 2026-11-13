import "server-only";
import { iso, sql, str } from "@/lib/db";

/**
 * Yönetim → Kayıtlar: what admins did and when, so Murat and Nezih see each other's actions. Written
 * after the action succeeds; a failed write is logged and never undoes or blocks the action itself.
 */

export type AdminTarget = "konu" | "yanıt" | "ilan" | "haber" | "kategori" | "üye" | "reklam" | "haber-kaynakları";

export async function logAdmin(adminId: string, action: string, targetType: AdminTarget, targetId: string | null, summary = "") {
  try {
    await sql()`
      insert into admin_log (admin_id, action, target_type, target_id, summary)
      values (${adminId}, ${action}, ${targetType}, ${targetId}, ${summary.replace(/\s+/g, " ").trim().slice(0, 300)})`;
  } catch (err) {
    console.error("admin_log", err);
  }
}

export type AdminLogEntry = {
  id: string;
  adminName: string;
  action: string;
  targetType: AdminTarget;
  targetId: string | null;
  summary: string;
  at: string;
};

/** The latest entries, newest first, with the admin's name (or "Silinmiş yönetici"). */
export async function listAdminLog(limit = 200): Promise<AdminLogEntry[]> {
  const rows = await sql()`
    select l.id, l.action, l.target_type, l.target_id, l.summary, l.created_at, p.name as admin_name
    from admin_log l left join profiles p on p.user_id = l.admin_id
    order by l.created_at desc
    limit ${Math.min(limit, 500)}`;
  return rows.map((r) => ({
    id: str(r.id),
    adminName: str(r.admin_name) || "Silinmiş yönetici",
    action: str(r.action),
    targetType: str(r.target_type) as AdminTarget,
    targetId: r.target_id ? str(r.target_id) : null,
    summary: str(r.summary),
    at: iso(r.created_at),
  }));
}
