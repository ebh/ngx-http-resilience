import {
  HttpHandler,
  HttpInterceptor,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { createHttpRetryInterceptorFn } from './http-retry-interceptor.fn';
import { RetryPolicy } from './types';

export class HttpRetryInterceptorService implements HttpInterceptor {
  private readonly interceptorFn: HttpInterceptorFn;

  private constructor(policy: RetryPolicy) {
    this.interceptorFn = createHttpRetryInterceptorFn(policy);
  }

  public static create(policy: RetryPolicy) {
    return new HttpRetryInterceptorService(policy);
  }

  public intercept(req: HttpRequest<unknown>, next: HttpHandler) {
    return this.interceptorFn(req, next.handle);
  }
}
