import {
  HttpHandler,
  HttpInterceptor,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { createHttpRetryInterceptorFn } from './http-retry-interceptor.fn';
import { RetryPolicy } from './types';

@Injectable()
export class HttpRetryInterceptorService implements HttpInterceptor {
  private readonly interceptorFn: HttpInterceptorFn;

  constructor(policy: RetryPolicy) {
    this.interceptorFn = createHttpRetryInterceptorFn(policy);
  }

  public intercept(req: HttpRequest<unknown>, next: HttpHandler) {
    return this.interceptorFn(req, next.handle);
  }
}
