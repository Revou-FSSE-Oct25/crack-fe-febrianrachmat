type ProfileAvatarProps = {
  fullName: string;
  size?: "md" | "lg";
  imageSrc?: string | null;
};

function initialsFromName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export function ProfileAvatar({
  fullName,
  size = "lg",
  imageSrc,
}: ProfileAvatarProps) {
  const dim = size === "lg" ? "h-16 w-16 text-xl" : "h-12 w-12 text-base";

  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt=""
        className={`${dim} shrink-0 rounded-2xl object-cover shadow-md shadow-teal-900/20 ring-2 ring-white`}
      />
    );
  }

  return (
    <div
      className={`${dim} flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 font-bold text-white shadow-md shadow-teal-900/20 ring-2 ring-white`}
      aria-hidden
    >
      {initialsFromName(fullName)}
    </div>
  );
}
