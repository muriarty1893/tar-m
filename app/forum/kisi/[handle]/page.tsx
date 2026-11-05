import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { Avatar } from "@/components/market/Avatar";
import { TopicList } from "@/components/forum/TopicList";
import { forumCategories } from "@/lib/forum-categories";
import { forumProfile, listTopics } from "@/lib/forum-data";
import { requestNow } from "@/lib/now";

export async function generateMetadata({ params }: PageProps<"/forum/kisi/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const profile = await forumProfile(handle);
  return profile ? { title: `${profile.name} (@${profile.handle}) · Forum` } : { title: "Kullanıcı bulunamadı" };
}

export default function ForumPersonPage({ params }: PageProps<"/forum/kisi/[handle]">) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/forum" className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary underline-offset-4 hover:underline">
        <ArrowLeftIcon aria-hidden="true" weight="bold" className="size-5" />
        Foruma dön
      </Link>
      <Suspense fallback={<div aria-hidden="true" className="mt-6 h-96 rounded-2xl bg-muted motion-safe:animate-pulse" />}>
        <Person params={params} />
      </Suspense>
    </div>
  );
}

const sinceLabel = (iso: string) => new Date(iso).toLocaleDateString("tr-TR", { month: "long", year: "numeric" });

/** @ahmet: the name, how long they've been here, how much they wrote, and their latest topics. */
async function Person({ params }: { params: PageProps<"/forum/kisi/[handle]">["params"] }) {
  const { handle } = await params;
  const profile = await forumProfile(handle);
  if (!profile) notFound();
  const [{ items }, now, cats] = await Promise.all([listTopics({ q: "", kategori: "tumu", sirala: "yeni", sayfa: 1 }, profile.userId), requestNow(), forumCategories()]);
  return (
    <div className="mt-4 space-y-8">
      <header className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
        <Avatar id={profile.userId} name={profile.name} size={64} />
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{profile.name}</h1>
          <p className="text-muted-foreground">@{profile.handle}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {sinceLabel(profile.memberSince)} tarihinden beri üye · {profile.topicCount} konu · {profile.replyCount} yanıt
          </p>
        </div>
      </header>
      <section aria-labelledby="konulari" className="space-y-3">
        <h2 id="konulari" className="text-xl font-bold">
          Açtığı konular
        </h2>
        {items.length ? <TopicList items={items} cats={cats} now={now} /> : <p className="text-muted-foreground">Henüz konu açmadı.</p>}
      </section>
    </div>
  );
}
