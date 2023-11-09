import { HttpEvent, HttpRequest } from '@angular/common/http';

export interface HttpVisibilityInterceptorHttpEvent<T> {
  event: HttpEvent<T>;
  req: HttpRequest<T>;
  /**
   * Time in milliseconds since interceptor received the request.
   */
  duration: number;
}
export function isHttpVisibilityInterceptorHttpEvent<T>(
  event: HttpVisibilityInterceptorHttpEvent<T> | HttpVisibilityInterceptorError
): event is HttpVisibilityInterceptorHttpEvent<T> {
  return 'event' in event;
}

export interface HttpVisibilityInterceptorError {
  err: unknown;
  req: HttpRequest<unknown>;
  /**
   * Time in milliseconds since interceptor received the request.
   */
  duration: number;
}
export function isHttpVisibilityInterceptorError(
  event:
    | HttpVisibilityInterceptorHttpEvent<unknown>
    | HttpVisibilityInterceptorError
): event is HttpVisibilityInterceptorError {
  return 'err' in event;
}
