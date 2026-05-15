export type FieldErrors = Record<string, string>;

export type ValidationResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: FieldErrors };

export function validationFailed(
  message: string,
  fieldErrors?: FieldErrors,
): ValidationResult {
  return { ok: false, message, fieldErrors };
}
