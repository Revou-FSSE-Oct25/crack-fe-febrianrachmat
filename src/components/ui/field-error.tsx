import { inputBase } from "@/components/ui/page-shell";

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs text-red-700" role="alert">
      {message}
    </p>
  );
}

export function inputWithFieldError(hasError: boolean): string {
  return hasError
    ? `${inputBase} border-red-400 focus:border-red-500 focus:ring-red-500/25`
    : inputBase;
}
