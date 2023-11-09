import {
  HttpContext,
  HttpContextToken,
  HttpRequest,
} from '@angular/common/http';
import { v4 as uuid } from 'uuid';
import { RequestPredicate } from '../types';

const NGX_HTTP_RESILIENCE_RETRY_ID = new HttpContextToken<Set<string>>(
  () => new Set()
);

export interface ContextPredicate {
  /**
   * Returns a cloned request that is marked as handled by this predicate
   *
   * @example
   * const contextPredicate = createContextPredicate();
   * httpClient.request(contextPredicate.getMarkedRequest(new HttpRequest(...)).pipe(...)
   *
   */
  getMarkedRequest: (req: HttpRequest<unknown>) => HttpRequest<unknown>;
  /**
   * Returns a context that is marked as handled by this predicate
   *
   * @example
   * const contextPredicate = createContextPredicate();
   * httpClient.get(..., { context: contextPredicate.getContext() })
   */
  getContext: () => HttpContext;
  /**
   * Marks a context that it is handled by this predicate
   *
   * @example
   * const contextPredicate = createContextPredicate();
   * const context = new HttpContext();
   * contextPredicate.markContext(context);
   * httpClient.get(..., { context })
   */
  markContext: (context: HttpContext) => void;
  /** Returns true if request is marked as handled by this predicate */
  requestPredicate: RequestPredicate;
}

/**
 * Creates a predicate that marks requests as handled by this predicate
 *
 * @example
 *  const contextPredicate = createContextPredicate();
 *
 *  createHttpRetryInterceptorFn({
 *    ...
 *    shouldHandleRequest: contextPredicate.requestPredicate,
 *    ...
 *  })
 *
 *  httpClient.request(contextPredicate.getMarkedRequest(new HttpRequest(...)).pipe(...)
 *
 */
export function createContextPredicate(): ContextPredicate {
  const id = uuid();

  const getContext: () => HttpContext = () => {
    return new HttpContext().set(NGX_HTTP_RESILIENCE_RETRY_ID, new Set([id]));
  };

  const requestPredicate: RequestPredicate = (req) => {
    return req.context.get(NGX_HTTP_RESILIENCE_RETRY_ID).has(id);
  };

  return {
    getMarkedRequest: (req) => markRequest(req, id),
    getContext,
    markContext: (context) => markContext(context, id),

    requestPredicate,
  };
}

function markRequest(
  req: HttpRequest<unknown>,
  id: string
): HttpRequest<unknown> {
  const newReq = req.clone();

  markContext(newReq.context, id);

  return newReq;
}

function markContext(context: HttpContext, id: string): void {
  if (context.has(NGX_HTTP_RESILIENCE_RETRY_ID)) {
    context.get(NGX_HTTP_RESILIENCE_RETRY_ID).add(id);
  } else {
    context.set(NGX_HTTP_RESILIENCE_RETRY_ID, new Set([id]));
  }
}
