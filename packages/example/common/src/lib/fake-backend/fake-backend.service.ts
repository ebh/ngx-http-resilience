import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpStatusCode,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FakeBackendFn, createFakeBackendFn } from './fake-backend.fn';
import { FakeBackend, FakeBackendConfig } from './types';

@Injectable()
export class FakeBackendService implements FakeBackend, HttpInterceptor {
  private fn: FakeBackendFn;

  constructor() {
    this.fn = createFakeBackendFn({
      minDelay: 100,
      maxDelay: 5000,
      errorRate: 0.5,
      errorCodes: new Map([
        [HttpStatusCode.BadRequest, true],
        [HttpStatusCode.Unauthorized, true],
        [HttpStatusCode.Forbidden, true],
        [HttpStatusCode.NotFound, true],
        [HttpStatusCode.TooManyRequests, true],

        [HttpStatusCode.InternalServerError, true],
        [HttpStatusCode.BadGateway, true],
        [HttpStatusCode.ServiceUnavailable, true],
        [HttpStatusCode.GatewayTimeout, true],
      ]),
    });
  }

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return this.fn.interceptor(req, next.handle);
  }

  updateConfig(config: Partial<FakeBackendConfig>) {
    this.fn.updateConfig(config);
  }

  activeConfig(): FakeBackendConfig {
    return this.fn.activeConfig();
  }
}
