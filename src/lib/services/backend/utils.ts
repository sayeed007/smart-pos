import type { ApiEnvelope } from '@/types/backend';

function isEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.success === 'boolean' && 'data' in candidate;
}

export function unwrapEnvelope<T>(payload: ApiEnvelope<T> | T): T {
  let current: unknown = payload;
  let depth = 0;

  // Be tolerant of accidental nested envelopes: { success, data: { success, data } }
  while (isEnvelope(current) && depth < 5) {
    current = current.data;
    depth += 1;
  }

  return current as T;
}
