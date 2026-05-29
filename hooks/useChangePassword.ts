import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { api } from '@/api/axios';
import { queryClient } from '@/api/queryClient';
import { ChangePasswordPayload } from '@/types/requestTypes';

const baseUrl = '/api/users';

export const useChangePassword = () => {
  return useMutation({
    mutationKey: ['changePassword'],
    mutationFn: async (payload: ChangePasswordPayload) => {
      return api.patch(baseUrl, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userData'] });
    },
    onError: (error: unknown) => {
      if (!isAxiosError(error)) {
        return;
      }

      if (error.response?.status === 401) {
        queryClient.clear();
      }
    },
  });
};

