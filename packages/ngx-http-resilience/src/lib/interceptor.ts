import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';

export interface HttpResilienceInterceptorHttpEvent<T> {
  event: HttpEvent<T>;
  req: HttpRequest<T>;
}

export interface HttpResilienceInterceptor extends HttpInterceptor {
  httpEvents$: Observable<HttpResilienceInterceptorHttpEvent<unknown>>;
}

export function createHttpResilienceInterceptor(): HttpResilienceInterceptor {
  const httpEvents$ = new Subject<
    HttpResilienceInterceptorHttpEvent<unknown>
  >();

  return {
    intercept: (
      req: HttpRequest<unknown>,
      next: HttpHandler
    ): Observable<HttpEvent<unknown>> =>
      next.handle(req).pipe(
        tap((event) => {
          httpEvents$.next({ event, req });
        })
      ),
    httpEvents$,
  };
}
