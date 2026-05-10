import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/axios';
import { DashboardStats } from '@/types/dashboardTypes';

const baseUrl = '/api/stats-service';

export const useStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await api.get<DashboardStats>(baseUrl);
      return response.data;
    },
  });
};
