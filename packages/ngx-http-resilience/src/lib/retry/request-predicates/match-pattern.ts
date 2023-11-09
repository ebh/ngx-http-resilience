import { RequestPredicate } from '../types';

interface InternalRequestPattern {
  method?: Set<string> | RegExp;
  url?: string | RegExp;
}

export interface RequestPattern {
  /** HTTP methods to match. */
  method?: InternalRequestPattern['method'] | string | string[];
  /** URL to match. */
  url?: InternalRequestPattern['url'];
}

/**
 * Creates a predicate that matches requests based on the given pattern.
 * @param pattern The pattern to match.
 *
 * @example
 *  createHttpRetryInterceptorFn({
 *    ...
 *    shouldHandleRequest: matchPattern({method: 'GET' }),
 *    ...
 *  })
 *
 *  @example
 *   createHttpRetryInterceptorFn({
 *     ...
 *     shouldHandleRequest: matchPattern({method: ['GET', 'POST'] }),
 *     ...
 *   })
 *
 *  @example
 *   createHttpRetryInterceptorFn({
 *     ...
 *     shouldHandleRequest: matchPattern({method: /GET|POST/ }),
 *     ...
 *   })
 *
 * @example
 *  createHttpRetryInterceptorFn({
 *    ...
 *    shouldHandleRequest: matchPattern({url: 'https://example.com' }),
 *    ...
 *  })
 *
 * @example
 *  createHttpRetryInterceptorFn({
 *    ...
 *    shouldHandleRequest: matchPattern({url: /example.com/ }),
 *    ...
 *  })
 *
 * @example
 *  createHttpRetryInterceptorFn({
 *    ...
 *    shouldHandleRequest: matchPattern({method: 'GET', url: 'https://example.com' }),
 *    ...
 *  })
 */
export function matchPattern(pattern: RequestPattern): RequestPredicate {
  const internalPattern = getInternalPattern(pattern);

  return (req) => {
    if (internalPattern.method && internalPattern.url) {
      return (
        isMatchingMethod(req.method, internalPattern.method) &&
        isMatchingUrl(req.url, internalPattern.url)
      );
    }

    if (internalPattern.method) {
      return isMatchingMethod(req.method, internalPattern.method);
    }

    if (internalPattern.url) {
      return isMatchingUrl(req.url, internalPattern.url);
    }

    return false;
  };
}

function getInternalPattern(pattern: RequestPattern): InternalRequestPattern {
  return {
    method: getInternalMethodPattern(pattern.method),
    url: pattern.url,
  };
}

function getInternalMethodPattern(
  pattern: RequestPattern['method']
): InternalRequestPattern['method'] {
  if (typeof pattern === 'string') {
    return new Set([pattern]);
  }

  if (Array.isArray(pattern)) {
    return new Set(pattern);
  }

  return pattern;
}

function isMatchingUrl(
  url: string,
  pattern: InternalRequestPattern['url']
): boolean {
  if (typeof pattern === 'string') {
    return url === pattern;
  }

  if (pattern instanceof RegExp) {
    return pattern.test(url);
  }

  return false;
}

function isMatchingMethod(
  method: string,
  pattern: InternalRequestPattern['method']
): boolean {
  if (pattern instanceof RegExp) {
    return pattern.test(method);
  }

  if (pattern instanceof Set) {
    return pattern.has(method);
  }

  return false;
}
