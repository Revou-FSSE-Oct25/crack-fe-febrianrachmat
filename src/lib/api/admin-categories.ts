import type { Category } from "./types";
import { apiFetch } from "./client";

/** Selaras `CreateCategoryDto` */
export type CreateCategoryBody = {
  name: string;
  description?: string;
};

/** Selaras `UpdateCategoryDto` */
export type UpdateCategoryBody = {
  name?: string;
  description?: string;
};

export async function createCategory(body: CreateCategoryBody): Promise<Category> {
  return apiFetch<Category>("/admin/categories", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateCategory(
  categoryId: string,
  body: UpdateCategoryBody,
): Promise<Category> {
  return apiFetch<Category>(`/admin/categories/${categoryId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteCategory(categoryId: string): Promise<unknown> {
  return apiFetch<unknown>(`/admin/categories/${categoryId}`, {
    method: "DELETE",
  });
}
