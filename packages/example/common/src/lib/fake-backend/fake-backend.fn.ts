import {
  HttpErrorResponse,
  HttpEventType,
  HttpInterceptorFn,
  HttpResponse,
  HttpSentEvent,
  HttpStatusCode,
} from '@angular/common/http';
import { faker } from '@faker-js/faker';
import { BehaviorSubject, concat, of, switchMap, timer } from 'rxjs';
import { Person } from '../types';
import { FakeBackend, FakeBackendConfig } from './types';

export interface FakeBackendFn extends FakeBackend {
  interceptor: HttpInterceptorFn;
}

const defaultConfig: FakeBackendConfig = {
  minDelay: 100,
  maxDelay: 5000,
  errorRate: 0.1,
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
};

export function createFakeBackendFn(
  config: FakeBackendConfig = defaultConfig
): FakeBackendFn {
  const activeConfig$ = new BehaviorSubject<FakeBackendConfig>(config);

  const interceptor: HttpInterceptorFn = () => {
    return concat(
      of(createHttpSentEvent()),
      timer(generateDelay(activeConfig$.value)).pipe(
        switchMap(() => {
          if (shouldReturnError(activeConfig$.value)) {
            throw createError(getEnabledErrorCodes(activeConfig$.value));
          }

          return of(
            new HttpResponse({
              body: createPerson(),
              status: 200,
            })
          ).pipe();
        })
      )
    );
  };

  return {
    interceptor,
    updateConfig: (newConfig) => {
      activeConfig$.next({
        ...activeConfig$.value,
        ...newConfig,
      });
    },
    activeConfig: () => activeConfig$.value,
  };
}

function createHttpSentEvent(): HttpSentEvent {
  return {
    type: HttpEventType.Sent,
  };
}

function createPerson(): Person {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    dateOfBirth: faker.date.past(),
    country: faker.location.country(),
  };
}

function getEnabledErrorCodes(config: FakeBackendConfig): HttpStatusCode[] {
  return Array.from(config.errorCodes.entries())
    .filter(([, value]) => value)
    .map(([key]) => key);
}

function createError(errorCodes: HttpStatusCode[]): HttpErrorResponse {
  return new HttpErrorResponse({
    status: faker.helpers.arrayElement(errorCodes),
  });
}

function generateDelay(config: FakeBackendConfig): number {
  return faker.number.int({
    min: config.minDelay,
    max: config.maxDelay,
  });
}

function shouldReturnError(config: FakeBackendConfig): boolean {
  return faker.number.float({ min: 0, max: 1 }) < config.errorRate;
}
