-- Çiftçi Destek: the website's database (Neon Postgres, Frankfurt).
-- Idempotent: `npm run db:migrate` runs this whole file; every statement may run again safely.
-- Users sign in with Clerk; `user_id` columns hold the Clerk user id ("user_…").

create table if not exists profiles (
  user_id    text primary key,
  -- Shown to other people on listings and in chats.
  name       text not null default '' check (char_length(name) <= 60),
  province   text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Pazar: farmers' listings.
create table if not exists listings (
  id          uuid primary key default gen_random_uuid(),
  seller_id   text not null references profiles(user_id) on delete cascade,
  title       text not null check (char_length(title) between 5 and 70),
  category    text not null check (category in ('urun', 'tohum', 'alet', 'ekipman', 'arac')),
  condition   text check (condition in ('sifir', 'ikinci-el')),
  price       numeric(14, 2) not null check (price > 0 and price <= 100000000),
  -- Price per this unit ("ton"); null for things sold by the piece.
  unit        text,
  quantity    text check (char_length(quantity) <= 40),
  negotiable  boolean not null default false,
  province    text not null,
  district    text not null default '' check (char_length(district) <= 40),
  description text not null default '' check (char_length(description) <= 1000),
  -- Vercel Blob URLs; empty = the category's stock photo is shown, marked "Temsilî görsel".
  photos      text[] not null default '{}',
  status      text not null default 'active' check (status in ('active', 'sold', 'removed')),
  -- Folded (lower case, Turkish letters to plain ones) title, description and place, for search.
  search_text text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists listings_active_idx on listings (status, created_at desc);
create index if not exists listings_seller_idx on listings (seller_id, created_at desc);

create table if not exists favorites (
  user_id    text not null references profiles(user_id) on delete cascade,
  listing_id uuid not null references listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

-- Mesajlar: one conversation per listing and buyer.
create table if not exists conversations (
  id              uuid primary key default gen_random_uuid(),
  listing_id      uuid not null references listings(id) on delete cascade,
  buyer_id        text not null references profiles(user_id) on delete cascade,
  seller_id       text not null references profiles(user_id) on delete cascade,
  buyer_read_at   timestamptz not null default now(),
  seller_read_at  timestamptz not null default 'epoch',
  last_message_at timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  unique (listing_id, buyer_id),
  check (buyer_id <> seller_id)
);
create index if not exists conversations_buyer_idx on conversations (buyer_id, last_message_at desc);
create index if not exists conversations_seller_idx on conversations (seller_id, last_message_at desc);

-- A message is either text or an offer.
create table if not exists messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id       text not null references profiles(user_id) on delete cascade,
  body            text check (char_length(body) between 1 and 1000),
  offer_amount    numeric(14, 2) check (offer_amount > 0 and offer_amount <= 100000000),
  offer_status    text check (offer_status in ('pending', 'accepted', 'rejected', 'countered', 'withdrawn')),
  created_at      timestamptz not null default now(),
  check ((body is null) <> (offer_amount is null)),
  check ((offer_amount is null) = (offer_status is null))
);
create index if not exists messages_conversation_idx on messages (conversation_id, created_at);

-- "Şikayet et" on a listing; reviewed on /yonetim.
create table if not exists reports (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references listings(id) on delete cascade,
  reporter_id text not null references profiles(user_id) on delete cascade,
  reason      text not null check (reason in ('sahte', 'yasakli', 'yaniltici', 'uygunsuz', 'diger')),
  note        text not null default '' check (char_length(note) <= 500),
  created_at  timestamptz not null default now(),
  resolved_at timestamptz,
  unique (listing_id, reporter_id)
);

-- Tarlalarım: the farmer's own fields and this season's expenses.
create table if not exists fields (
  id                uuid primary key default gen_random_uuid(),
  user_id           text not null references profiles(user_id) on delete cascade,
  name              text not null check (char_length(name) between 2 and 40),
  crop              text not null default '' check (char_length(crop) <= 40),
  stage             text not null default '' check (char_length(stage) <= 40),
  area_donum        numeric(10, 2) not null check (area_donum > 0 and area_donum <= 1000000),
  province          text not null default '',
  district          text not null default '' check (char_length(district) <= 40),
  expected_yield_kg numeric(14, 2) check (expected_yield_kg >= 0),
  notes             text not null default '' check (char_length(notes) <= 500),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists fields_user_idx on fields (user_id, created_at);
-- The field's outline, drawn on the mobile app's map: [[lat, lng], …] (lib/geo.ts). Null = not drawn.
alter table fields add column if not exists boundary jsonb;

create table if not exists expenses (
  id         uuid primary key default gen_random_uuid(),
  field_id   uuid not null references fields(id) on delete cascade,
  user_id    text not null references profiles(user_id) on delete cascade,
  kind       text not null check (kind in ('tohum', 'gubre', 'ilac', 'mazot', 'su', 'iscilik', 'diger')),
  amount     numeric(14, 2) not null check (amount > 0 and amount <= 100000000),
  spent_on   date not null,
  note       text not null default '' check (char_length(note) <= 120),
  created_at timestamptz not null default now()
);
create index if not exists expenses_field_idx on expenses (field_id, spent_on desc);

-- Tarım takvimi: the farmer's own tasks, optionally tied to a field.
create table if not exists tasks (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null references profiles(user_id) on delete cascade,
  field_id   uuid references fields(id) on delete set null,
  title      text not null check (char_length(title) between 2 and 80),
  kind       text not null check (kind in ('analiz', 'toprak', 'gubre', 'ilac', 'ekim', 'sulama', 'hasat', 'uyari', 'diger')),
  due_date   date not null,
  due_time   time,
  done       boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists tasks_user_date_idx on tasks (user_id, due_date);

-- Haberler: news written on /yonetim/haberler. Markdown body, shown on /haberler once published.
create table if not exists articles (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  title        text not null check (char_length(title) between 5 and 140),
  summary      text not null check (char_length(summary) between 10 and 300),
  body         text not null default '' check (char_length(body) <= 50000),
  -- A Vercel Blob URL (haberler/…) or a path under public/ ("/demo/…"); null = no cover.
  cover        text,
  published_on date not null,
  status       text not null default 'draft' check (status in ('draft', 'published')),
  author_id    text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists articles_published_idx on articles (status, published_on desc);

-- Forum: farmers' topics and replies (/forum and the app's Topluluk). Readable by everyone; writing
-- needs an account with a name. Authors delete their own posts; admins remove reported ones.
create table if not exists forum_topics (
  id            uuid primary key default gen_random_uuid(),
  author_id     text not null references profiles(user_id) on delete cascade,
  category      text not null check (category in ('bitki', 'hayvan', 'makine', 'destek', 'pazar', 'genel')),
  title         text not null check (char_length(title) between 5 and 120),
  body          text not null check (char_length(body) between 10 and 5000),
  reply_count   integer not null default 0,
  last_reply_at timestamptz,
  -- Folded (lower case, Turkish letters to plain ones) title and text, for search.
  search_text   text not null default '',
  created_at    timestamptz not null default now()
);
create index if not exists forum_topics_new_idx on forum_topics (created_at desc);
create index if not exists forum_topics_author_idx on forum_topics (author_id, created_at desc);

create table if not exists forum_replies (
  id         uuid primary key default gen_random_uuid(),
  topic_id   uuid not null references forum_topics(id) on delete cascade,
  author_id  text not null references profiles(user_id) on delete cascade,
  body       text not null check (char_length(body) between 2 and 3000),
  created_at timestamptz not null default now()
);
create index if not exists forum_replies_topic_idx on forum_replies (topic_id, created_at);
create index if not exists forum_replies_author_idx on forum_replies (author_id, created_at desc);

-- "Şikâyet et" on a topic or a reply; reviewed on /yonetim/sikayetler.
create table if not exists forum_reports (
  id          uuid primary key default gen_random_uuid(),
  topic_id    uuid not null references forum_topics(id) on delete cascade,
  reply_id    uuid references forum_replies(id) on delete cascade,
  reporter_id text not null references profiles(user_id) on delete cascade,
  reason      text not null check (reason in ('spam', 'hakaret', 'yaniltici', 'uygunsuz', 'diger')),
  note        text not null default '' check (char_length(note) <= 500),
  created_at  timestamptz not null default now(),
  resolved_at timestamptz
);
create unique index if not exists forum_reports_once_idx on forum_reports (reporter_id, topic_id, coalesce(reply_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- Forum, X-style: a username for mentions (@ahmet), replies to replies, up to 4 photos a post, likes,
-- and notifications ("Bildirimler") for replies and mentions.
alter table profiles add column if not exists handle text;
create unique index if not exists profiles_handle_idx on profiles (handle);
alter table profiles drop constraint if exists profiles_handle_check;
alter table profiles add constraint profiles_handle_check check (handle is null or handle ~ '^[a-z0-9_]{3,20}$');

alter table forum_topics add column if not exists photos text[] not null default '{}';
alter table forum_topics add column if not exists like_count integer not null default 0;

-- parent_id: the reply this one answers (null: the topic). A deleted reply that others answered stays
-- as "Bu yanıt silindi" (deleted_at, text and photos gone), so the conversation under it still reads.
alter table forum_replies add column if not exists parent_id uuid references forum_replies(id) on delete set null;
alter table forum_replies add column if not exists photos text[] not null default '{}';
alter table forum_replies add column if not exists like_count integer not null default 0;
alter table forum_replies add column if not exists deleted_at timestamptz;
-- A photo alone is a reply too, and a deleted one keeps no text: the 2-character minimum is the app's.
alter table forum_replies drop constraint if exists forum_replies_body_check;
alter table forum_replies add constraint forum_replies_body_check check (char_length(body) <= 3000);
create index if not exists forum_replies_parent_idx on forum_replies (parent_id);

create table if not exists forum_likes (
  user_id    text not null references profiles(user_id) on delete cascade,
  topic_id   uuid not null references forum_topics(id) on delete cascade,
  reply_id   uuid references forum_replies(id) on delete cascade,
  created_at timestamptz not null default now()
);
create unique index if not exists forum_likes_once_idx on forum_likes (user_id, topic_id, coalesce(reply_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- "Bildirimler": someone answered your topic or reply, or mentioned you. One per post and person.
create table if not exists notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null references profiles(user_id) on delete cascade,
  actor_id   text not null references profiles(user_id) on delete cascade,
  kind       text not null check (kind in ('reply', 'mention')),
  topic_id   uuid not null references forum_topics(id) on delete cascade,
  reply_id   uuid references forum_replies(id) on delete cascade,
  created_at timestamptz not null default now(),
  read_at    timestamptz
);
create index if not exists notifications_user_idx on notifications (user_id, created_at desc);
create unique index if not exists notifications_once_idx on notifications (user_id, topic_id, coalesce(reply_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- Forum categories, as on r10.net: sections (parent_id null) and their sub-categories, managed by the
-- admins on /yonetim/forum. A topic sits in a section or in one of its sub-categories. The first six
-- are the forum's original kinds; the mobile app still sends these ids.
create table if not exists forum_categories (
  id          text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(id) <= 40),
  parent_id   text references forum_categories(id) on delete restrict,
  name        text not null check (char_length(name) between 2 and 60),
  description text not null default '' check (char_length(description) <= 160),
  position    integer not null default 0,
  created_at  timestamptz not null default now(),
  check (parent_id is null or parent_id <> id)
);
create index if not exists forum_categories_parent_idx on forum_categories (parent_id, position);
insert into forum_categories (id, name, description, position) values
  ('bitki', 'Bitkisel üretim', 'Ekim, gübreleme, ilaçlama, sulama ve hasat', 1),
  ('hayvan', 'Hayvancılık', 'Büyükbaş, küçükbaş, kanatlı ve arıcılık', 2),
  ('makine', 'Makine ve ekipman', 'Traktör, alet, bakım ve arıza', 3),
  ('destek', 'Destek ve teşvik', 'Hibe, kredi, devlet destekleri ve başvurular', 4),
  ('pazar', 'Fiyat ve pazar', 'Ürün fiyatları, borsa ve satış', 5),
  ('genel', 'Genel', 'Diğer her şey', 6)
on conflict (id) do nothing;
-- The fixed list of six gives way to the table.
alter table forum_topics drop constraint if exists forum_topics_category_check;
alter table forum_topics drop constraint if exists forum_topics_category_fkey;
alter table forum_topics add constraint forum_topics_category_fkey foreign key (category) references forum_categories(id) on update cascade on delete restrict;
create index if not exists forum_topics_category_idx on forum_topics (category, created_at desc);

-- "düzenlendi": the author or an admin changed the post after it went up.
alter table forum_topics add column if not exists edited_at timestamptz;
alter table forum_replies add column if not exists edited_at timestamptz;

-- Görüntülenme: real opens of a topic page (one per browser session). Lists add made-up views on top
-- (lib/forum-views.ts); those are never stored.
alter table forum_topics add column if not exists view_count integer not null default 0;

-- Haberler: each article is a support, a news item or an announcement, shown as its label on the home
-- page's "Çiftçi destekleri & haberler" strip and on /haberler.
alter table articles add column if not exists kind text not null default 'haber';
alter table articles drop constraint if exists articles_kind_check;
alter table articles add constraint articles_kind_check check (kind in ('destek', 'haber', 'duyuru'));

-- Haberler, automatically: lib/services/news-import.ts reads TKDK and the Ministry once a day and
-- publishes their headlines with a short summary and a link to the original (source_name, source_url).
-- Hand-written articles leave both empty.
alter table articles add column if not exists source_name text;
alter table articles add column if not exists source_url text;
-- Every link the importer has looked at, published or not, so it never fetches or adds one twice: an
-- article an admin deletes stays deleted, and skipped ones (tenders, exams, old items) aren't re-read.
create table if not exists news_imports (
  url        text primary key,
  source     text not null,
  article_id uuid references articles(id) on delete set null,
  -- Why it wasn't published: 'konu dışı' (filtered) or 'eski' (older than the window); null = published.
  skipped    text,
  created_at timestamptz not null default now()
);

-- Yönetim, more control (2026-11-13).
-- Üyeler: an admin can suspend someone: they can still sign in and read, but not post, reply, list,
-- edit or message until unsuspended.
alter table profiles add column if not exists suspended_at timestamptz;
alter table profiles add column if not exists suspended_reason text check (suspended_reason is null or char_length(suspended_reason) <= 300);
-- Forum: a pinned topic leads its lists; a locked one takes no new replies (admins still can).
alter table forum_topics add column if not exists pinned_at timestamptz;
alter table forum_topics add column if not exists locked_at timestamptz;
create index if not exists forum_topics_pinned_idx on forum_topics (pinned_at) where pinned_at is not null;
-- The home page's two ad spaces, edited in Yönetim → Reklam: 'sponsor' (the sponsor strip) and
-- 'reklam' (the "Bu alanda reklam vermek için" box). `sample` marks placeholder content as "örnek".
create table if not exists site_slots (
  id         text primary key check (id in ('sponsor', 'reklam')),
  enabled    boolean not null default true,
  name       text not null default '' check (char_length(name) <= 60),
  text       text not null default '' check (char_length(text) <= 120),
  url        text not null default '' check (char_length(url) <= 300),
  sample     boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by text
);
insert into site_slots (id, enabled, name, text, url, sample) values
  ('sponsor', true, 'sukocu.com', 'Yakıtsız, elektriksiz su pompası', '', true),
  ('reklam', true, 'İletişim', 'Bu alanda reklam vermek için', '/is-birligi', false)
on conflict (id) do nothing;
-- What admins did, newest first (Yönetim → Kayıtlar). Kept when the admin or the target is gone.
create table if not exists admin_log (
  id          uuid primary key default gen_random_uuid(),
  admin_id    text not null,
  action      text not null,
  target_type text not null,
  target_id   text,
  summary     text not null default '' check (char_length(summary) <= 300),
  created_at  timestamptz not null default now()
);
create index if not exists admin_log_created_idx on admin_log (created_at desc);
