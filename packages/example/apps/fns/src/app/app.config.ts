import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { createFakeBackendFn } from '@ngx-http-resilience/example/common';
import {
  HttpVisibilityInterceptorError,
  HttpVisibilityInterceptorHttpEvent,
  createHttpVisibilityInterceptorFn,
} from 'ngx-http-resilience';
import { Subject } from 'rxjs';

export const fakeBackend = createFakeBackendFn();

export const httpEvents$ = new Subject<
  HttpVisibilityInterceptorHttpEvent<unknown>
>();
export const errors$ = new Subject<HttpVisibilityInterceptorError>();
const visibilityInterceptor = createHttpVisibilityInterceptorFn({
  httpEvents$,
  errors$,
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([visibilityInterceptor, fakeBackend.interceptor])
    ),
  ],
};
