import { questionSchema } from "@/lib/forms";
import { handleSubmission } from "@/lib/submit";

export function POST(req: Request) {
  return handleSubmission(req, "question", questionSchema);
}
