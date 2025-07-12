import { MemberRole, TripMember, User } from 'generated/prisma';

export const validateTripMemberPermissions = (
  user: User,
  tripMember: TripMember,
  allowedRoles: MemberRole[] = ['ADMIN', 'CREATOR'],
) => {
  if (!tripMember || typeof tripMember !== 'object') {
    return false;
  }

  if (user.role === 'ADMIN') {
    return true;
  }

  if (tripMember.role) {
    return allowedRoles.includes(tripMember.role);
  }

  return false;
};
