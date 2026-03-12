import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/api/axios';
import { queryClient as qc } from '@/api/queryClient';
import { FoodProduct } from '@/types/productTypes';

const baseUrl = '/api/products';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.get<FoodProduct[]>(baseUrl);
      return response.data;
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await api.get<FoodProduct>(`${baseUrl}/${id}`);
      return response.data;
    },
  });
};

export const useDeleteProduct = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`${baseUrl}/${id}`);
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['products'] });
      const previous = qc.getQueryData<FoodProduct[]>(['products']);
      qc.setQueryData<FoodProduct[]>(['products'], (old) => (old ? old.filter((p) => p.id !== id) : []));
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        qc.setQueryData(['products'], context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
