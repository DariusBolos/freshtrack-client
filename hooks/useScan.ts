import { useMutation } from '@tanstack/react-query';
import { api } from '@/api/axios';

const scanEndpoint = process.env.EXPO_PUBLIC_SCAN_ENDPOINT ?? '/api/scan/food-products';

const getMimeType = (uri: string) => {
  const extension = uri.split('.').pop()?.toLowerCase();

  if (extension === 'png') return 'image/png';
  if (extension === 'heic') return 'image/heic';
  if (extension === 'webp') return 'image/webp';

  return 'image/jpeg';
};

export const useScanReceipt = () => {
  return useMutation({
    mutationKey: ['scanReceipt'],
    mutationFn: async (imageUri: string) => {
      const filename = imageUri.split('/').pop() ?? `receipt-${Date.now()}.jpg`;
      const formData = new FormData();

      formData.append('image', {
        uri: imageUri,
        name: filename,
        type: getMimeType(imageUri),
      } as unknown as Blob);

      const response = await api.post(scanEndpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    },
  });
};

