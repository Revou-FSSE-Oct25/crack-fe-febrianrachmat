import type { AuthUserResponse, UserProfile } from "@/lib/api/types";

export function profileToAuthUser(profile: UserProfile): AuthUserResponse {
  return {
    id: profile.id,
    fullName: profile.fullName,
    email: profile.email,
    role: profile.role,
    isActive: profile.isActive,
    emailVerified: profile.emailVerified,
  };
}
