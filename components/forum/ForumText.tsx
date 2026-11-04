import Link from "next/link";
import { splitMentions } from "@/lib/forum";

/** A post's text, line breaks kept, with each "@kullanıcıadı" a link to that person's forum page. */
export function ForumText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <p className={`whitespace-pre-line break-words ${className}`}>
      {splitMentions(text).map((part, i) =>
        "handle" in part ? (
          <Link key={i} href={`/forum/kisi/${part.handle}`} className="font-semibold text-primary underline-offset-4 hover:underline">
            @{part.handle}
          </Link>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </p>
  );
}
