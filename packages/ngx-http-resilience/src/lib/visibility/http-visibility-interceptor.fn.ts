import { HttpInterceptorFn } from '@angular/common/http';
import { Subject, tap } from 'rxjs';
import {
  HttpVisibilityInterceptorError,
  HttpVisibilityInterceptorHttpEvent,
} from './types';

export interface CreateHttpVisibilityInterceptorFnConfig {
  httpEvents$: Subject<HttpVisibilityInterceptorHttpEvent<unknown>>;
  errors$: Subject<HttpVisibilityInterceptorError>;
}

export function createHttpVisibilityInterceptorFn({
  httpEvents$,
  errors$,
}: CreateHttpVisibilityInterceptorFnConfig): HttpInterceptorFn {
  return (req, next) => {
    const start = Date.now();

    return next(req).pipe(
      tap({
        next: (event) =>
          httpEvents$.next({ event, req, duration: Date.now() - start }),
        error: (err: unknown) =>
          errors$.next({ err, req, duration: Date.now() - start }),
      })
    );
  };
}
