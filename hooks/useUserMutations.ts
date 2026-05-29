import { useMutation } from '@tanstack/react-query';
import { api } from '@/api/axios';
import { queryClient } from '@/api/queryClient';
import { UpdateUserPayload } from '@/types/requestTypes';

const baseUrl = '/api/users';

export const useUpdateUser = () => {
  return useMutation({
    mutationKey: ['updateUser'],
    mutationFn: async (payload: UpdateUserPayload) => {
      return api.patch(baseUrl, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userData'] });
    },
  });
};

export const useDeleteAccount = () => {
  return useMutation({
    mutationKey: ['deleteAccount'],
    mutationFn: async () => {
      return api.delete(baseUrl);
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

