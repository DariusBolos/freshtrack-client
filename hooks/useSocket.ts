import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { queryClient } from '@/api/queryClient';
import { Notification } from '@/types/dashboardTypes';
import { appConfig } from '@/config';

const normalizeNotification = (notification: Notification): Notification => ({
  ...notification,
  id: String(notification.id),
});

/**
 * Maintains a persistent Socket.IO connection while the user is
 * authenticated.  Listens for real-time events and updates the
 * React-Query cache so the UI refreshes immediately.
 */
export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let cancelled = false;
    let tokenPoll: ReturnType<typeof setInterval> | null = null;

    const connect = async () => {
      if (socketRef.current || cancelled) return;
      const token = await AsyncStorage.getItem('token');
      if (!token || cancelled) return;

      const socket = io(appConfig.apiBaseUrl as string, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 3000,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('[socket] connected', socket.id);
      });

      socket.on('notification:family_invite', (payload: Notification) => {
        const normalized = normalizeNotification(payload);
        queryClient.setQueryData<Notification[]>(['notifications'], (old = []) => {
          // avoid duplicates
          if (old.some((n) => n.id === normalized.id)) return old;
          return [normalized, ...old];
        });
      });

      socket.on('notification', (payload: Notification) => {
        const normalized = normalizeNotification(payload);
        queryClient.setQueryData<Notification[]>(['notifications'], (old = []) => {
          if (old.some((n) => n.id === normalized.id)) return old;
          return [normalized, ...old];
        });
      });

      socket.on('disconnect', (reason) => {
        console.log('[socket] disconnected:', reason);
      });
    };

    const startTokenPoll = () => {
      if (tokenPoll) return;
      tokenPoll = setInterval(() => {
        void connect();
      }, 2000);
    };

    void connect();
    startTokenPoll();

    return () => {
      cancelled = true;
      if (tokenPoll) {
        clearInterval(tokenPoll);
      }
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  return socketRef;
};
