import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/api/axios';
import { Recipe } from '@/types/dashboardTypes';

const baseUrl = '/api/recipe-service/recipes';

export const useRecipes = () => {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const response = await api.get<Recipe[]>(baseUrl);
      return response.data;
    },
  });
};

export const useRecipeSuggestions = () => {
  return useMutation({
    mutationFn: async (count: number = 3) => {
      const response = await api.post<Recipe[]>(`${baseUrl}/refresh`, { count });
      return response.data;
    },
  });
};

export const useGenerateRecipe = () => {
  return useMutation({
    mutationFn: async (ingredient: string) => {
      const response = await api.post<Recipe>(`${baseUrl}/single`, { productName: ingredient });
      return response.data;
    },
  });
};
