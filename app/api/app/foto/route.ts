import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";
import { ApiError, handler, json, requireAppAdmin, requireAppUser } from "@/lib/app-api";
import { checkRateLimit } from "@/lib/rateLimit";

/**
 * Photo uploads from the app: the phone shrinks the photo (about 1600 px, JPEG) and sends its bytes;
 * we store it in Vercel Blob. ?klasor=ilanlar for listing photos (anyone signed in), haberler for news
 * covers (admins). Images only, checked by their first bytes, at most 4 MB (Vercel's limit is 4.5).
 */
const MAX_BYTES = 4 * 1024 * 1024;

function imageType(bytes: Uint8Array): { type: string; ext: string } | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { type: "image/jpeg", ext: "jpg" };
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return { type: "image/png", ext: "png" };
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return { type: "image/webp", ext: "webp" };
  return null;
}

export const POST = handler(async (req) => {
  const folder = new URL(req.url).searchParams.get("klasor");
  if (folder !== "ilanlar" && folder !== "haberler") throw new ApiError(400, "Geçersiz klasör.");
  const userId = folder === "haberler" ? await requireAppAdmin(req) : await requireAppUser(req);
  if (!checkRateLimit(`app-foto:${userId}`, 60)) throw new ApiError(429, "Çok fazla fotoğraf yüklediniz; biraz sonra yeniden deneyin.");

  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_BYTES) throw new ApiError(413, "Fotoğraf çok büyük (en fazla 4 MB).");
  const bytes = new Uint8Array(await req.arrayBuffer());
  if (bytes.length === 0) throw new ApiError(400, "Fotoğraf boş geldi.");
  if (bytes.length > MAX_BYTES) throw new ApiError(413, "Fotoğraf çok büyük (en fazla 4 MB).");
  const image = imageType(bytes);
  if (!image) throw new ApiError(415, "Yalnızca JPEG, PNG ya da WebP fotoğraf yüklenebilir.");

  const blob = await put(`${folder}/${randomUUID()}.${image.ext}`, Buffer.from(bytes), { access: "public", contentType: image.type, addRandomSuffix: false });
  return json({ url: blob.url }, 201);
});
