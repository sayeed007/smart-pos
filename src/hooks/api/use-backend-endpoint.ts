import { useMutation, useQuery } from '@tanstack/react-query';
import {
  BackendEndpointKey,
  callBackendEndpoint,
  EndpointCallOptions,
} from '@/lib/services/backend/endpoints.generated';

export function useBackendEndpointQuery<T = unknown>(
  key: BackendEndpointKey,
  options: EndpointCallOptions = {},
  enabled = true,
) {
  return useQuery({
    queryKey: ['backend-endpoint', key, options],
    queryFn: () => callBackendEndpoint<T>(key, options),
    enabled,
  });
}

export function useBackendEndpointMutation<T = unknown>(
  key: BackendEndpointKey,
) {
  return useMutation({
    mutationFn: (options: EndpointCallOptions = {}) =>
      callBackendEndpoint<T>(key, options),
  });
}

