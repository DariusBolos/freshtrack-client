import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/axios';
import { UserData } from '@/types/userTypes';

const baseUrl = '/api/users';

export const useUserData = () => {
  return useQuery({
    queryKey: ['userData'],
    queryFn: async () => {
      const response = await api.get<UserData>(baseUrl);
      return response.data;
    },
  });
};
