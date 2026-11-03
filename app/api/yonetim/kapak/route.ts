import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getUserId, isAdmin } from "@/lib/auth";

/** One-time upload tokens for news covers: admins only, images only, 8 MB at most, under haberler/. */
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const userId = await getUserId();
        if (!userId || !(await isAdmin(userId))) throw new Error("Yalnızca yöneticiler kapak yükleyebilir.");
        if (!/^haberler\/[\w-]+\.(webp|jpe?g|png)$/i.test(pathname)) throw new Error("Geçersiz dosya adı.");
        return { allowedContentTypes: ["image/webp", "image/jpeg", "image/png"], maximumSizeInBytes: 8 * 1024 * 1024, addRandomSuffix: true };
      },
    });
    return Response.json(json);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Yükleme başarısız." }, { status: 400 });
  }
}
