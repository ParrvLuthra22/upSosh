import { User } from '@prisma/client';

/**
 * The one shape a User row is ever sent to the client in. Previously
 * auth.ts and users.ts each had their own copy with different field sets —
 * auth.ts's read 15 fields a narrower query never selected, so every field
 * beyond {id,email,name,role,createdAt} came back hardcoded to its default
 * regardless of the database, on every /api/auth/me call (i.e. on every
 * session restore).
 */
export function sanitizeUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    photoUrl: user.photoUrl ?? null,
    bio: user.bio ?? null,
    role: user.role,
    hostStatus: user.hostStatus,
    city: user.city ?? null,
    onboardingComplete: user.onboardingComplete ?? false,
    interests: user.interests ?? '[]',
    groupSize: user.groupSize ?? null,
    vibe: user.vibe ?? null,
    frequency: user.frequency ?? null,
    wantsToHost: user.wantsToHost ?? false,
    hostBio: user.hostBio ?? null,
    hostExperience: user.hostExperience ?? null,
    hostCategories: user.hostCategories ?? '[]',
    hostInstagram: user.hostInstagram ?? null,
    hostLinkedin: user.hostLinkedin ?? null,
    hostWebsite: user.hostWebsite ?? null,
    createdAt: user.createdAt,
  };
}
