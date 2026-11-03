import "server-only";
import { connection } from "next/server";

/** The current time in a request-time component: marks the render dynamic first, as Cache Components requires. */
export async function requestNow(): Promise<Date> {
  await connection();
  return new Date();
}
