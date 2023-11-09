import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { createHttpVisibilityInterceptorFn } from './http-visibility-interceptor.fn';
import {
  HttpVisibilityInterceptorError,
  HttpVisibilityInterceptorHttpEvent,
} from './types';

@Injectable()
export class HttpVisibilityInterceptorService implements HttpInterceptor {
  private readonly _httpEvents$ = new Subject<
    HttpVisibilityInterceptorHttpEvent<unknown>
  >();
  private readonly _errors$ = new Subject<HttpVisibilityInterceptorError>();

  private readonly interceptorFn: HttpInterceptorFn;

  constructor() {
    this.interceptorFn = createHttpVisibilityInterceptorFn({
      httpEvents$: this._httpEvents$,
      errors$: this._errors$,
    });
  }

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return this.interceptorFn(req, next.handle);
  }

  public observeHttpEvents(): Observable<
    HttpVisibilityInterceptorHttpEvent<unknown>
  > {
    return this._httpEvents$.asObservable();
  }

  public observeErrors(): Observable<HttpVisibilityInterceptorError> {
    return this._errors$.asObservable();
  }
}
