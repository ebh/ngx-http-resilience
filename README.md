![License](https://img.shields.io/github/license/ebh/ngx-http-resilience)
[![CI Workflow](https://github.com/ebh/ngx-http-resilience/actions/workflows/ci.yml/badge.svg)](https://github.com/ebh/ngx-http-resilience/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/ebh/ngx-http-resilience/graph/badge.svg?token=m6R2XL7nDP)](https://codecov.io/gh/ebh/ngx-http-resilience)

# ngx-http-resilience

Angular HttpInterceptor that provides resiliency capabilities

# Getting Started

## Installation

```shell
npm install ngx-http-resilience
```

## Usage

### Interceptor Functions

```typescript
#
app.config.ts
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {ApplicationConfig} from '@angular/core';
import {
  HttpVisibilityInterceptorError,
  HttpVisibilityInterceptorHttpEvent,
  createHttpVisibilityInterceptorFn,
} from 'ngx-http-resilience';
import {Subject} from 'rxjs';

export const httpEvents$ = new Subject<
  HttpVisibilityInterceptorHttpEvent<unknown>
>();
export const errors$ = new Subject<HttpVisibilityInterceptorError>();
const visibilityInterceptor = createHttpVisibilityInterceptorFn({
  httpEvents$,
  errors$,
});

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withInterceptors([visibilityInterceptor]))],
};
```

### Interceptor Service

```typescript
#
app.config.ts
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {ApplicationConfig} from '@angular/core';
import {HttpVisibilityInterceptorService} from 'ngx-http-resilience';

export const visibilityInterceptorService =
  new HttpVisibilityInterceptorService();

export const httpInterceptorProviders = [
  {
    provide: HTTP_INTERCEPTORS,
    useValue: visibilityInterceptorService,
    multi: true,
  },
];

export const appConfig: ApplicationConfig = {
  providers: [httpInterceptorProviders],
};
```

### Visibility

The visibility interceptor provides a stream of http events and errors. This can be used to modify an apps behaviour, such as letting a user know that there are network connectivity issues.

```typescript
```

### Retry

The retry interceptor allows for retrying failed requests. For example retrying requests that failed due to network connectivity issues.

Every retry interceptor has a retry policy, which determines:

- Which requests it handles (`shouldHandleRequest`)
- Which errors it handles (`shouldHandleError`)
- How much time to wait between retries (`delay`)

Optionally it can also specify a:

- Maximum number of retries (`maxRetries`)
- Maximum time to wait for success (`maxDuration`)

| Function                                   | Service |
|--------------------------------------------|---------|
| <pre><br/>provideHttpClient(<br/>&nbsp;&nbsp;withInterceptors([<br/>&nbsp;&nbsp;&nbsp;&nbsp;createHttpRetryInterceptorFn({<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;shouldHandleRequest: matchPattern({ url: /example.com/ }),<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;shouldHandleError: withStatusCodes(STANDARD_RETRYABLE_STATUS_CODES),<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;delay: constantDelay(10, true),<br/>&nbsp;&nbsp;&nbsp;&nbsp;})<br/>&nbsp;&nbsp;])<br/>),</pre> | TODO    |

