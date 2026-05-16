import { useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/api/axios';
import { Notification, CreateNotificationPayload } from '@/types/dashboardTypes';
import { FoodProduct } from '@/types/productTypes';
import { queryClient } from '@/api/queryClient';
import { buildExpiryPayloads, existingExpiryKeys } from '@/utils/notificationUtils';

const baseUrl = '/api/notifications';

const normalizeNotification = (notification: Notification): Notification => ({
  ...notification,
  id: String(notification.id),
});

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await api.get<Notification[]>(baseUrl);
      return response.data.map(normalizeNotification);
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

export const useCreateNotification = () => {
  return useMutation({
    mutationFn: async (payload: CreateNotificationPayload) => {
      const response = await api.post<Notification>(baseUrl, payload);
      return normalizeNotification(response.data);
    },
    onSuccess: (created) => {
      // append the server-returned notification to the cache
      queryClient.setQueryData<Notification[]>(['notifications'], (old = []) => [
        created,
        ...old,
      ]);
    },
  });
};

export const useDeleteNotification = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`${baseUrl}/${id}`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueryData<Notification[]>(['notifications']);
      queryClient.setQueryData<Notification[]>(['notifications'], (old) =>
        old ? old.filter((n) => n.id !== id) : [],
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['notifications'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

/**
 * Runs once when products + notifications are available.
 * For every product that is expired or expiring soon and does NOT already
 * have a matching notification on the server, it POSTs a new one.
 */
export const useExpiryNotificationSync = (
  products: FoodProduct[],
  notifications: Notification[],
  reminderDaysBefore: number,
) => {
  const { mutate: createNotification } = useCreateNotification();
  // track keys we've already posted in this session to avoid double-fires
  const postedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (products.length === 0) return;

    const alreadyOnServer = existingExpiryKeys(notifications);
    const payloads = buildExpiryPayloads(products, reminderDaysBefore);

    for (const { key, payload } of payloads) {
      if (alreadyOnServer.has(key) || postedRef.current.has(key)) continue;
      postedRef.current.add(key);
      createNotification(payload);
    }
  }, [products, notifications, reminderDaysBefore, createNotification]);
};
