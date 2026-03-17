import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/axios';

const baseUrl = 'https://api.spoonacular.com/recipes';

export const useGetRecipesByIngredients = (ingredients: string[], count: number) => {
  return useQuery({
    queryKey: ['recipes', ingredients, count],
    queryFn: async (): Promise<any[]> => {
      const response = await api.get<any[]>(
        `${baseUrl}/findByIngredients?apiKey=${process.env.EXPO_PUBLIC_SPOONACULAR_API_KEY}&ingredients=${ingredients.join(',+')}&number=${count}`,
      );

      return response.data;
    },
  });
};

export const useGetRecipeInstructions = (id: string) => {
  return useQuery({
    queryKey: [],
    queryFn: async (): Promise<any[]> => {
      const response = await api.get<any[]>(`${baseUrl}/${id}/analyzedInstructions?apiKey=${process.env.EXPO_PUBLIC_SPOONACULAR_API_KEY}`);

      return response.data;
    },
  });
};
