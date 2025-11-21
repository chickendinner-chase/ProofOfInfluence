import { storage } from "../storage";
import type { UserPlan } from "@shared/schema";

/**
 * Get user's plan (free or paid)
 * Returns "free" if plan is undefined/null or not "paid"
 */
export async function getUserPlan(userId: string): Promise<UserPlan> {
  const user = await storage.getUser(userId);
  const rawPlan = user?.plan;

  if (rawPlan === "paid") return "paid";
  return "free"; // Default to free for undefined/null or any other value
}

