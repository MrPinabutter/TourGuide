import { MemberRole, TripMember, User } from 'generated/prisma';

export const validateTripMemberPermissions = ({
  user,
  tripMember,
  tripMembers = [],
  allowedRoles = ['ADMIN', 'CREATOR'],
}: {
  user: User;
  tripMember?: TripMember;
  tripMembers?: TripMember[];
  allowedRoles?: MemberRole[];
}) => {
  if (user.role === 'ADMIN') {
    return true;
  }

  const member =
    tripMember ?? tripMembers.find((it) => it.userId === user.id && it.active);

  if (member && member.role) {
    return allowedRoles.includes(member.role);
  }

  return false;
};
