import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, Subject, catchError, tap } from 'rxjs';

export interface HttpVisibilityInterceptorHttpEvent<T> {
  event: HttpEvent<T>;
  req: HttpRequest<T>;
}

export interface HttpVisibilityInterceptorErrors {
  err: unknown;
  req: HttpRequest<unknown>;
}

export interface HttpVisibilityInterceptor extends HttpInterceptor {
  httpEvents$: Observable<HttpVisibilityInterceptorHttpEvent<unknown>>;
  errors$: Observable<HttpVisibilityInterceptorErrors>;
}

export function createHttpVisibilityInterceptor(): HttpVisibilityInterceptor {
  const httpEvents$ = new Subject<
    HttpVisibilityInterceptorHttpEvent<unknown>
  >();

  const httpErrorResponses$ = new Subject<HttpVisibilityInterceptorErrors>();

  return {
    intercept: (
      req: HttpRequest<unknown>,
      next: HttpHandler
    ): Observable<HttpEvent<unknown>> =>
      next.handle(req).pipe(
        tap((event) => {
          httpEvents$.next({ event, req });
        }),
        catchError((err: unknown) => {
          httpErrorResponses$.next({ err, req });

          throw err;
        })
      ),
    httpEvents$: httpEvents$.asObservable(),
    errors$: httpErrorResponses$.asObservable(),
  };
}
