import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/api/axios';
import { FamilyInvitePayload } from '@/types/requestTypes';

const inviteUrl = '/api/household/invite';
const membersUrl = '/api/household/members';

export const useFamilyInvite = () => {
  return useMutation({
    mutationKey: ['familyInvite'],
    mutationFn: async (payload: FamilyInvitePayload) => {
      await api.post(inviteUrl, payload);
    },
  });
};

export const useHouseholdMembers = () => {
  return useQuery({
    queryKey: ['householdMembers'],
    queryFn: async () => {
      const response = await api.get<HouseholdMemberResponse[]>(membersUrl);
      return response.data;
    },
  });
};

export const useAcceptInvite = () => {
  return useMutation({
    mutationKey: ['acceptInvite'],
    mutationFn: async (inviteId: string) => {
      await api.post(`/api/household/invites/${inviteId}/accept`);
    },
  });
};

export const useDeclineInvite = () => {
  return useMutation({
    mutationKey: ['declineInvite'],
    mutationFn: async (inviteId: string) => {
      await api.post(`/api/household/invites/${inviteId}/decline`);
    },
  });
};

export const useRemoveHouseholdMember = () => {
  return useMutation({
    mutationKey: ['removeHouseholdMember'],
    mutationFn: async (memberId: string) => {
      await api.delete(`/api/household/members/${memberId}`);
    },
  });
};

export const useLeaveHousehold = () => {
  return useMutation({
    mutationKey: ['leaveHousehold'],
    mutationFn: async () => {
      await api.post('/api/household/leave');
    },
  });
};

export type HouseholdMemberResponse = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role?: 'owner' | 'editor' | 'viewer';
};
