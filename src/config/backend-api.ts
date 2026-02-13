const defaultBackendApiUrl = 'http://localhost:3001/api/v1';

export const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ?? defaultBackendApiUrl;

