import { useMutation } from '@tanstack/react-query';
import { LoginPayload, RegisterPayload } from '@/types/requestTypes';
import { api } from '@/api/axios';
import { queryClient } from '@/api/queryClient';

const baseUrl = '/api/auth';

export const useLogin = () => {
  return useMutation({
    mutationKey: ['login'],
    mutationFn: async (payload: LoginPayload) => {
      return api.post(`${baseUrl}/login`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationKey: ['register'],
    mutationFn: async (payload: RegisterPayload) => {
      return api.post(`${baseUrl}/register`, payload);
    },
  });
};
