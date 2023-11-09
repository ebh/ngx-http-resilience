import { ErrorPredicate } from '../types';

/**
 * Any error, even if it's not an `HttpErrorResponse` should be handled.
 */
export function anyError(): ErrorPredicate {
  return () => true;
}
