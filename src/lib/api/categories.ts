import type { Category } from "./types";
import { apiFetch } from "./client";

export async function listCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/categories");
}
