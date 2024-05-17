import {
  HttpHandler,
  HttpInterceptor,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { createHttpRetryInterceptorFn } from './http-retry-interceptor.fn';
import { RetryInterceptorEvent, RetryPolicy } from './types';

export class HttpRetryInterceptorService implements HttpInterceptor {
  private readonly interceptorFn: HttpInterceptorFn;
  private readonly events$ = new Subject<RetryInterceptorEvent>();

  private constructor(policy: RetryPolicy) {
    this.interceptorFn = createHttpRetryInterceptorFn(policy, {
      events$: this.events$,
    });
  }

  public static create(policy: RetryPolicy) {
    return new HttpRetryInterceptorService(policy);
  }

  public intercept(req: HttpRequest<unknown>, next: HttpHandler) {
    return this.interceptorFn(req, next.handle);
  }

  public observeEvents(): Observable<RetryInterceptorEvent> {
    return this.events$.asObservable();
  }
}
