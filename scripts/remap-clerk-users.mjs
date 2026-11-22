// One-off, for the move from Clerk's development instance to production (docs/deploy.md, "Clerk
// production keys"). Production is a separate Clerk instance: everyone signs up again and gets a new
// user id. This links each person's old profile and everything they made (listings, messages, forum
// posts, likes, fields, tasks, news they wrote, admin log entries) to their new id.
//
// Old and new accounts are paired by a verified e-mail address they share; pair others by hand with
// --map. Sample members ("demo_…") and people who haven't signed up again yet are left alone, so the
// script can run again later for them.
//
//   npm run users:remap                            dry run: makes every change, prints it, rolls back
//   npm run users:remap -- --apply                 does it, in one transaction (all or nothing)
//   npm run users:remap -- --map user_old=user_new also pairs these two (repeatable)
//
// Needs DATABASE_URL_UNPOOLED (or DATABASE_URL) and both instances' secret keys:
//   CLERK_SECRET_KEY_OLD  sk_test_…  development (default: CLERK_SECRET_KEY, from .env.local)
//   CLERK_SECRET_KEY_NEW  sk_live_…  production  (default: CLERK_SECRET_KEY in .env.production.local)
// `vercel env pull .env.local` and `vercel env pull --environment=production .env.production.local`
// write both files.
import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { parseEnv } from "node:util";

/**
 * Every column that holds a Clerk user id. `fk`: references profiles(user_id) with on delete cascade,
 * so it must be moved before the old profile goes. `clash`: with these columns, a unique index;
 * the old account's row is dropped when the new account already has the same one (both liked the same
 * post). `clashFails`: such a clash stops the script instead (it would need two chats merged).
 */
export const COLUMNS = [
  { table: "listings", column: "seller_id", fk: true },
  { table: "favorites", column: "user_id", fk: true, clash: ["listing_id"] },
  { table: "conversations", column: "buyer_id", fk: true, clash: ["listing_id"], clashFails: true },
  { table: "conversations", column: "seller_id", fk: true },
  { table: "messages", column: "sender_id", fk: true },
  { table: "reports", column: "reporter_id", fk: true, clash: ["listing_id"] },
  { table: "fields", column: "user_id", fk: true },
  { table: "expenses", column: "user_id", fk: true },
  { table: "tasks", column: "user_id", fk: true },
  { table: "forum_topics", column: "author_id", fk: true },
  { table: "forum_replies", column: "author_id", fk: true },
  { table: "forum_reports", column: "reporter_id", fk: true, clash: ["topic_id", "reply_id"] },
  { table: "forum_likes", column: "user_id", fk: true, clash: ["topic_id", "reply_id"] },
  { table: "notifications", column: "user_id", fk: true, clash: ["topic_id", "reply_id"] },
  { table: "notifications", column: "actor_id", fk: true },
  // Plain text, no foreign key: kept when the person is gone.
  { table: "articles", column: "author_id" },
  { table: "site_slots", column: "updated_by" },
  { table: "admin_log", column: "admin_id" },
  { table: "admin_log", column: "target_id", where: "target_type = 'üye'" },
];

const label = (c) => `${c.table}.${c.column}`;

/** Stops if the database has a user-id foreign key this script doesn't know, or lacks one it does. */
export async function checkColumns(db) {
  const { rows } = await db.query(`
    select cl.relname as t, att.attname as c
    from pg_constraint con
    join pg_class cl on cl.oid = con.conrelid
    join pg_class ref on ref.oid = con.confrelid
    join pg_attribute att on att.attrelid = con.conrelid and att.attnum = any (con.conkey)
    where con.contype = 'f' and ref.relname = 'profiles' and ref.relnamespace = cl.relnamespace`);
  const inDb = new Set(rows.map((r) => `${r.t}.${r.c}`));
  const known = new Set(COLUMNS.filter((c) => c.fk).map(label));
  const unknown = [...inDb].filter((x) => !known.has(x));
  const missing = [...known].filter((x) => !inDb.has(x));
  if (unknown.length) throw new Error(`These columns reference profiles but the script doesn't move them: ${unknown.join(", ")}. Add them to COLUMNS.`);
  if (missing.length) throw new Error(`Expected foreign keys not found: ${missing.join(", ")}. Run \`npm run db:migrate\` first.`);
}

/** Every Clerk user id ("user_…") the database mentions anywhere. */
export async function userIdsInDb(db) {
  const parts = [`select user_id as id from profiles where user_id like 'user\\_%'`];
  for (const c of COLUMNS) parts.push(`select ${c.column} from ${c.table} where ${c.column} like 'user\\_%'${c.where ? ` and ${c.where}` : ""}`);
  const { rows } = await db.query(`select distinct id from (${parts.join(" union ")}) x order by id`);
  return rows.map((r) => r.id);
}

/**
 * Pairs each old (development) id in `ids` with the production account that shares a verified e-mail.
 * `manual` (old id → new id) goes first. Ids already in production are skipped silently.
 */
export function pairUsers(ids, oldUsers, newUsers, manual = new Map()) {
  const oldById = new Map(oldUsers.map((u) => [u.id, u]));
  const newIds = new Set(newUsers.map((u) => u.id));
  const newByEmail = new Map();
  for (const u of newUsers) for (const e of u.emails) newByEmail.set(e, [...(newByEmail.get(e) ?? []), u.id]);

  for (const [from, to] of manual) {
    if (!newIds.has(to)) throw new Error(`--map ${from}=${to}: ${to} is not an account in the production instance.`);
    if (!ids.includes(from)) throw new Error(`--map ${from}=${to}: ${from} owns nothing in the database.`);
  }

  const pairs = [];
  const skipped = [];
  for (const id of ids) {
    const email = oldById.get(id)?.emails[0] ?? "";
    if (manual.has(id)) {
      pairs.push({ from: id, to: manual.get(id), email: email || "(paired by hand)" });
      continue;
    }
    if (newIds.has(id)) continue;
    const old = oldById.get(id);
    if (!old) {
      skipped.push({ id, why: "in neither Clerk instance (account deleted?)" });
      continue;
    }
    const matches = [...new Set(old.emails.flatMap((e) => newByEmail.get(e) ?? []))];
    if (matches.length === 1) pairs.push({ from: id, to: matches[0], email });
    else if (matches.length === 0) skipped.push({ id, email, why: "hasn't signed up on the production site yet" });
    else skipped.push({ id, email, why: `several production accounts share its e-mail (${matches.join(", ")}); use --map` });
  }

  const targets = pairs.map((p) => p.to);
  const twice = targets.filter((t, i) => targets.indexOf(t) !== i);
  if (twice.length) throw new Error(`Two old accounts would become the same new one (${[...new Set(twice)].join(", ")}). Pair them with --map, or merge by hand.`);
  const both = pairs.filter((p) => p.from === p.to || ids.includes(p.to) && pairs.some((q) => q.from === p.to));
  if (both.length) throw new Error(`An id is both moved and a target: ${both.map((p) => p.to).join(", ")}.`);
  return { pairs, skipped };
}

/**
 * Moves everything from each pair's old id to its new one. Runs inside the caller's transaction;
 * `db.query(text, params)` returns { rows, rowCount }. Returns the number of rows changed per column.
 */
export async function remapUsers(db, pairs, log = console.log) {
  await checkColumns(db);
  // The new profile takes the old one's name, province, handle and suspension (what other people know
  // them by), and keeps its own where the old one is empty; created_at stays the earlier.
  const { rows: cols } = await db.query(`
    select column_name, data_type from information_schema.columns
    where table_schema = current_schema() and table_name = 'profiles'`);
  const merge = cols
    .filter((c) => !["user_id", "handle", "created_at", "updated_at"].includes(c.column_name))
    .map(({ column_name: n, data_type: t }) => (t === "text" ? `"${n}" = coalesce(nullif(o."${n}", ''), p."${n}")` : `"${n}" = coalesce(o."${n}", p."${n}")`));
  merge.push("created_at = least(o.created_at, p.created_at)", "updated_at = now()");

  const totals = new Map();
  const add = (key, n) => totals.set(key, (totals.get(key) ?? 0) + n);

  for (const { from, to, email } of pairs) {
    log(`\n${email}  ${from} → ${to}`);
    const hadProfile = (await db.query("select 1 from profiles where user_id = $1", [from])).rows.length > 0;
    const newProfile = (await db.query("select 1 from profiles where user_id = $1", [to])).rows.length > 0;
    if (hadProfile && !newProfile) await db.query("insert into profiles (user_id) values ($1)", [to]);

    for (const c of COLUMNS) {
      if (c.clash) {
        const same = c.clash.map((k) => `n.${k} is not distinct from o.${k}`).join(" and ");
        const dupes = `from ${c.table} o where o.${c.column} = $1 and exists (select 1 from ${c.table} n where n.${c.column} = $2 and ${same})`;
        if (c.clashFails) {
          const { rows } = await db.query(`select o.id ${dupes}`, [from, to]);
          if (rows.length) throw new Error(`${label(c)}: both accounts have a chat about the same listing (${rows.map((r) => r.id).join(", ")}). Merge or delete one by hand, then run again.`);
        } else {
          const gone = await db.query(`delete ${dupes} returning o.*`, [from, to]);
          if (gone.rowCount) {
            log(`  ${label(c).padEnd(28)} ${gone.rowCount} duplicate(s) of the new account's dropped`);
            add(`${label(c)} (duplicates dropped)`, gone.rowCount);
          }
          // A dropped like was counted twice on its post.
          if (c.table === "forum_likes") {
            for (const like of gone.rows) {
              if (like.reply_id) await db.query("update forum_replies set like_count = greatest(like_count - 1, 0) where id = $1", [like.reply_id]);
              else await db.query("update forum_topics set like_count = greatest(like_count - 1, 0) where id = $1", [like.topic_id]);
            }
          }
        }
      }
      const moved = await db.query(`update ${c.table} set ${c.column} = $2 where ${c.column} = $1${c.where ? ` and ${c.where}` : ""}`, [from, to]);
      if (moved.rowCount) {
        log(`  ${label(c).padEnd(28)} ${moved.rowCount}`);
        add(label(c), moved.rowCount);
      }
    }

    if (!hadProfile) continue;
    await db.query(`update profiles p set ${merge.join(", ")} from profiles o where o.user_id = $1 and p.user_id = $2`, [from, to]);
    // Deleting the old profile cascades to anything still pointing at it; nothing may.
    for (const c of COLUMNS.filter((c) => c.fk)) {
      const { rows } = await db.query(`select count(*)::int as n from ${c.table} where ${c.column} = $1`, [from]);
      if (rows[0].n) throw new Error(`${label(c)} still has ${rows[0].n} row(s) for ${from}; stopping before the delete.`);
    }
    const old = await db.query("delete from profiles where user_id = $1 returning name, handle", [from]);
    // The handle (@name) is freed by the delete above, so it can move now.
    if (old.rows[0].handle) await db.query("update profiles set handle = $1 where user_id = $2", [old.rows[0].handle, to]);
    const { rows } = await db.query("select name, handle from profiles where user_id = $1", [to]);
    log(`  ${"profiles".padEnd(28)} ${newProfile ? "merged into the new profile" : "moved"}: "${rows[0].name}"${rows[0].handle ? ` @${rows[0].handle}` : ""}`);
    add(newProfile ? "profiles (merged)" : "profiles (moved)", 1);
  }
  return totals;
}

/** All users of a Clerk instance, with their verified e-mail addresses (lower case). */
async function clerkUsers(secretKey) {
  const users = [];
  for (let offset = 0; ; offset += 500) {
    const res = await fetch(`https://api.clerk.com/v1/users?limit=500&offset=${offset}&order_by=-created_at`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    if (!res.ok) throw new Error(`Clerk API ${res.status}: ${await res.text()}`);
    const page = await res.json();
    for (const u of page) {
      const emails = (u.email_addresses ?? []).filter((e) => e.verification?.status === "verified").map((e) => e.email_address.toLowerCase());
      users.push({ id: u.id, emails });
    }
    if (page.length < 500) return users;
  }
}

function envFile(path, key) {
  return existsSync(path) ? parseEnv(readFileSync(path, "utf8"))[key] : undefined;
}

function parseArgs(argv) {
  const manual = new Map();
  let apply = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--apply") apply = true;
    else if (arg === "--map" || arg.startsWith("--map=")) {
      const value = arg === "--map" ? argv[++i] ?? "" : arg.slice(6);
      const [from, to] = value.split("=");
      if (!from?.startsWith("user_") || !to?.startsWith("user_")) throw new Error(`--map wants user_old=user_new, got "${value}".`);
      manual.set(from, to);
    } else throw new Error(`Unknown option ${arg}. Options: --apply, --map user_old=user_new.`);
  }
  return { apply, manual };
}

async function main() {
  const { apply, manual } = parseArgs(process.argv.slice(2));
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  const oldKey = process.env.CLERK_SECRET_KEY_OLD || process.env.CLERK_SECRET_KEY;
  const newKey = process.env.CLERK_SECRET_KEY_NEW || envFile(".env.production.local", "CLERK_SECRET_KEY");
  if (!url) throw new Error("DATABASE_URL is not set. Run `vercel env pull .env.local` first.");
  if (!oldKey?.startsWith("sk_test_")) throw new Error("The development instance's secret key (sk_test_…) is missing: set CLERK_SECRET_KEY_OLD, or CLERK_SECRET_KEY in .env.local.");
  if (!newKey?.startsWith("sk_live_")) throw new Error("The production secret key (sk_live_…) is missing: set CLERK_SECRET_KEY_NEW, or run `vercel env pull --environment=production .env.production.local`.");

  const [oldUsers, newUsers] = await Promise.all([clerkUsers(oldKey), clerkUsers(newKey)]);
  console.log(`Clerk: ${oldUsers.length} development account(s), ${newUsers.length} production account(s).`);

  const { neonConfig, Pool } = await import("@neondatabase/serverless");
  neonConfig.webSocketConstructor ??= globalThis.WebSocket;
  const pool = new Pool({ connectionString: url });
  const db = await pool.connect();
  try {
    await db.query("begin");
    await db.query("set local lock_timeout = '10s'");
    const { pairs, skipped } = pairUsers(await userIdsInDb(db), oldUsers, newUsers, manual);
    if (skipped.length) {
      console.log("\nLeft as they are:");
      for (const s of skipped) console.log(`  ${s.id}${s.email ? ` (${s.email})` : ""}: ${s.why}`);
    }
    if (!pairs.length) {
      await db.query("rollback");
      console.log("\nNothing to link.");
      return;
    }
    const totals = await remapUsers(db, pairs);
    console.log("\nIn all:");
    for (const [key, n] of totals) console.log(`  ${key.padEnd(44)} ${n}`);
    if (apply) {
      await db.query("commit");
      console.log(`\nDone: ${pairs.length} account(s) linked.`);
    } else {
      await db.query("rollback");
      console.log("\nDry run: nothing was changed. Run again with --apply to do it.");
    }
    console.log("\nNew ids, for ADMIN_USER_IDS if it lists any of the old ones:");
    for (const p of pairs) console.log(`  ${p.from} → ${p.to}  ${p.email}`);
  } catch (err) {
    await db.query("rollback").catch(() => {});
    throw err;
  } finally {
    db.release();
    await pool.end();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((err) => {
    console.error(`\n${err.message}`);
    process.exit(1);
  });
}
