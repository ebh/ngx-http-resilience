import { HttpStatusCode } from '@angular/common/http';
import { ErrorPredicate } from '../types';

/**
 * Range options for the `statusCodes` predicate.
 */
export type StatusCodeRange = {
  /** The minimum status code to match */
  min?: number;
  /** The maximum status code to match */
  max?: number;
};

function isStatusCodeRange(
  value: InternalStatusCodesErrorPredicateOptions
): value is StatusCodeRange {
  return (
    typeof value === 'object' &&
    value !== null &&
    ('min' in value || 'max' in value)
  );
}

type InternalStatusCodesErrorPredicateOptions = Set<number> | StatusCodeRange;

/**
 * Options for the `statusCodes` predicate.
 */
export type StatusCodesErrorPredicateOptions =
  | InternalStatusCodesErrorPredicateOptions
  | number
  | number[];

/**
 * Set of status codes that are generally safe to retry by default.
 */
export const STANDARD_RETRYABLE_STATUS_CODES = [
  HttpStatusCode.RequestTimeout,
  HttpStatusCode.BadGateway,
  HttpStatusCode.ServiceUnavailable,
  HttpStatusCode.GatewayTimeout,
]; // TODO make const

/**
 * Match any error with a status code matching the given options.
 * @param codes The status code(s) to match.
 *
 * @example
 *  createHttpRetryInterceptorFn({
 *    ...
 *    shouldHandleError: withStatusCodes(500),
 * })
 *
 * @example
 *  createHttpRetryInterceptorFn({
 *    ...
 *    shouldHandleError: withStatusCodes(500),
 *    ...
 *  })
 *
 * @example
 *  createHttpRetryInterceptorFn({
 *    ...
 *    shouldHandleError: withStatusCodes([500, 501]),
 *    ...
 *  })
 *
 * @example
 *  createHttpRetryInterceptorFn({
 *    ...
 *    shouldHandleError: withStatusCodes({ min: 500, max: 599 }),
 *    ...
 *  })
 */
export function withStatusCodes(
  codes: StatusCodesErrorPredicateOptions
): ErrorPredicate {
  const internalOptions = getInternalOptions(codes);

  if (internalOptions instanceof Set) {
    return (err) => {
      return hasStatus(err) && internalOptions.has(err.status);
    };
  }

  if (isStatusCodeRange(internalOptions)) {
    return (err) => {
      return (
        hasStatus(err) &&
        (internalOptions.min === undefined ||
          err.status >= internalOptions.min) &&
        (internalOptions.max === undefined || err.status <= internalOptions.max)
      );
    };
  }

  return () => {
    return false;
  };
}

function getInternalOptions(
  options: StatusCodesErrorPredicateOptions
): InternalStatusCodesErrorPredicateOptions {
  if (typeof options === 'number') {
    return new Set([options]);
  }

  if (Array.isArray(options)) {
    return new Set(options);
  }

  return options;
}

function hasStatus(err: unknown): err is { status: number } {
  return (
    err !== null &&
    err !== undefined &&
    typeof err === 'object' &&
    'status' in err &&
    typeof err.status === 'number'
  );
}
