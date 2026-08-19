/** Postgres error codes we translate into something a human can act on. */
const MESSAGES: Record<string, string> = {
  '23505': 'That already exists.',
  '23503': 'This item is still referenced by something else.',
  '23514': 'Some of the values are out of range.',
  '42501': 'You do not have permission to do that.',
};

type CodedError = { code: string; message?: string };

function isCodedError(error: unknown): error is CodedError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  );
}

/**
 * Turns a Supabase/Postgrest error into a user-facing message. Raw database
 * errors are useful in logs, never in the UI.
 */
export function toUserMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (isCodedError(error)) {
    return MESSAGES[error.code] ?? error.message ?? fallback;
  }
  if (error instanceof Error) {
    return error.message || fallback;
  }
  return fallback;
}

/**
 * Unwraps a Supabase response, throwing on error so TanStack Query can put the
 * query into its error state instead of every caller writing the same guard.
 */
export function unwrap<T>(response: { data: T; error: unknown }): NonNullable<T> {
  if (response.error) throw response.error;
  if (response.data === null || response.data === undefined) {
    throw new Error('No data returned.');
  }
  return response.data;
}
