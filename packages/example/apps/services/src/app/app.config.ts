import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { FakeBackendService } from '@ngx-http-resilience/example/common';
import {
  anyHttpError,
  exponentialDelay,
  HttpRetryInterceptorService,
  HttpVisibilityInterceptorService,
  matchPattern,
} from 'ngx-http-resilience';

export const fakeBackendService = new FakeBackendService();
export const visibilityInterceptorService =
  new HttpVisibilityInterceptorService();

export const httpInterceptorProviders = [
  {
    provide: HTTP_INTERCEPTORS,
    useValue: visibilityInterceptorService,
    multi: true,
  },
  {
    provide: HTTP_INTERCEPTORS,
    useValue: HttpRetryInterceptorService.create({
      shouldHandleRequest: matchPattern({ url: /example.com/ }),
      shouldHandleError: anyHttpError(),
      delay: exponentialDelay(100, 2, true),
    }),
    multi: true,
  },
  { provide: HTTP_INTERCEPTORS, useValue: fakeBackendService, multi: true },
];

export const appConfig: ApplicationConfig = {
  providers: [httpInterceptorProviders],
};
