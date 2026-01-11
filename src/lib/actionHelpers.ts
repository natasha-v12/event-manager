/**
 * Generic helpers for running server actions with consistent error handling
 * and a small type-safe wrapper used across the app.
 *
 * Goal: prefer calling server actions directly from server components / server actions,
 * but when a route or caller needs a consistent response shape, use these helpers.
 */

import { NextResponse } from 'next/server';

export type ActionSuccess<T> = { success: true; data: T };
export type ActionFailure = { success: false; error: string; status?: number };
export type ActionResult<T> = ActionSuccess<T> | ActionFailure;

/**
 * Run an async server action and normalize the result into an `ActionResult<T>`.
 * Does not throw — callers can inspect `success` or use `throwIfFailed`.
 */
export async function runAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (err: any) {
    const message = (err && err.message) ? err.message : String(err ?? 'Unknown error');
    // When possible, preserve a numeric `status` if the thrown error contains it
    const status = typeof err?.status === 'number' ? err.status : undefined;
    return { success: false, error: message, status };
  }
}

/**
 * Throw an Error when the result is a failure. Handy inside server actions
 * when you want the original throwing behaviour but with consistent messages.
 */
export function throwIfFailed<T>(res: ActionResult<T>): T {
  if (!res.success) {
    const err = new Error(res.error);
    // attach status where available for callers that inspect it
    (err as any).status = res.status ?? 500;
    throw err;
  }
  return res.data;
}

/**
 * Convert an ActionResult into a NextResponse for API routes or edge handlers.
 * - success -> 200 (or custom)
 * - failure -> status from result or 500
 */
export function actionResultToNextResponse<T>(result: ActionResult<T>, okStatus = 200): NextResponse {
  if (result.success) {
    return NextResponse.json(result.data, { status: okStatus });
  }
  const status = result.status ?? 500;
  return NextResponse.json({ error: result.error }, { status });
}

/**
 * Small helper that runs an action and returns a NextResponse in one step.
 * Useful inside route handlers that simply forward server action results.
 */
export async function runActionAsResponse<T>(fn: () => Promise<T>, okStatus = 200): Promise<NextResponse> {
  const res = await runAction(fn);
  return actionResultToNextResponse(res, okStatus);
}

export default {
  runAction,
  throwIfFailed,
  actionResultToNextResponse,
  runActionAsResponse,
};
