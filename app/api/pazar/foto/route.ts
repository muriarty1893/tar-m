import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getUserId } from "@/lib/auth";

/**
 * Issues one-time tokens for listing photos: the browser shrinks a photo and uploads it straight to
 * Vercel Blob (public store, Frankfurt). Only signed-in people get a token, only for images, at most
 * 8 MB, and only under ilanlar/.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const userId = await getUserId();
        if (!userId) throw new Error("Fotoğraf yüklemek için giriş yapın.");
        if (!/^ilanlar\/[\w-]+\.(webp|jpe?g|png)$/i.test(pathname)) throw new Error("Geçersiz dosya adı.");
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
