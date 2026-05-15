import type { Dispatch, SetStateAction } from "react";
import type { FieldErrors } from "./types";

export function clearFieldError(
  setFieldErrors: Dispatch<SetStateAction<FieldErrors>>,
  key: string,
): void {
  setFieldErrors((prev) => {
    if (!prev[key]) return prev;
    const next = { ...prev };
    delete next[key];
    return next;
  });
}
