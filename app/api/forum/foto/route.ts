import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getUserId } from "@/lib/auth";

/**
 * One-time tokens for forum photos: the browser shrinks a photo and uploads it straight to Vercel Blob
 * (public store, Frankfurt), as listing photos do. Only signed-in people, only images, at most 8 MB,
 * and only under forum/.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const userId = await getUserId();
        if (!userId) throw new Error("Fotoğraf eklemek için giriş yapın.");
        if (!/^forum\/[\w-]+\.(webp|jpe?g|png)$/i.test(pathname)) throw new Error("Geçersiz dosya adı.");
        return {
          allowedContentTypes: ["image/webp", "image/jpeg", "image/png"],
          maximumSizeInBytes: 8 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId }),
        };
      },
    });
    return Response.json(json);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Yükleme başarısız." }, { status: 400 });
  }
}
