import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { queryClient } from '@/api/queryClient';
import { Notification } from '@/types/dashboardTypes';
import { appConfig } from '@/config';

/**
 * Maintains a persistent Socket.IO connection while the user is
 * authenticated.  Listens for real-time events and updates the
 * React-Query cache so the UI refreshes immediately.
 */
export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let cancelled = false;

    const connect = async () => {
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

      /* ── Family-invite notification ── */
      socket.on('notification:family_invite', (payload: Notification) => {
        queryClient.setQueryData<Notification[]>(
          ['notifications'],
          (old = []) => {
            // avoid duplicates
            if (old.some((n) => n.id === payload.id)) return old;
            return [payload, ...old];
          },
        );
      });

      /* ── Generic notification (server can emit for any type) ── */
      socket.on('notification', (payload: Notification) => {
        queryClient.setQueryData<Notification[]>(
          ['notifications'],
          (old = []) => {
            if (old.some((n) => n.id === payload.id)) return old;
            return [payload, ...old];
          },
        );
      });

      socket.on('disconnect', (reason) => {
        console.log('[socket] disconnected:', reason);
      });
    };

    connect();

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  return socketRef;
};

