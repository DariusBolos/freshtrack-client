import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/api/axios';
import { Notification } from '@/types/dashboardTypes';

const baseUrl = '/api/notifications';

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await api.get<Notification[]>(baseUrl);
      return response.data;
    },
  });
};

export const useMarkNotifications = () => {
  return useMutation({
    mutationKey: ['markNotifications'],
    mutationFn: async (payload: string[]) => {
      return api.put(`${baseUrl}/markAsRead`, payload);
    },
  });
};
