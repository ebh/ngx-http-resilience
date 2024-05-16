import { TestScheduler } from 'rxjs/testing';
import * as td from 'testdouble';
import { HttpRetryInterceptorService } from './http-retry-interceptor.service';
import { DelayFn, ErrorPredicate, RequestPredicate } from './types';

let shouldHandleRequest: RequestPredicate;
let shouldHandleError: ErrorPredicate;
let delay: DelayFn;
let service: HttpRetryInterceptorService;

let testScheduler: TestScheduler;

beforeEach(() => {
  shouldHandleRequest = td.func<RequestPredicate>();
  shouldHandleError = td.func<ErrorPredicate>();
  delay = td.func<DelayFn>();

  testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });
});

describe('HttpRetryInterceptorService', () => {
  describe('create', () => {
    it('should create', () => {
      service = HttpRetryInterceptorService.create({
        shouldHandleRequest,
        shouldHandleError,
        delay,
      });

      expect(service).toBeTruthy();
    });
  });

  // describe('intercept', () => {
  //   let interceptorFn: HttpInterceptorFn;
  //
  //   beforeEach(async () => {
  //     interceptorFn = td.function<HttpInterceptorFn>();
  //     const createHttpRetryInterceptorFn = td.function<HttpInterceptorFn>();
  //
  //     const fakeHttpRetryInterceptorFnModule = td.replace(
  //       './http-retry-interceptor.fn',
  //       {
  //         createHttpRetryInterceptorFn,
  //       }
  //     );
  //
  //     service = HttpRetryInterceptorService.create({
  //       shouldHandleRequest,
  //       shouldHandleError,
  //       delay,
  //     });
  //   });
  //
  //   it('should intercept', () => {
  //     const req = new HttpRequest<string>(
  //       faker.internet.httpMethod(),
  //       faker.internet.url(),
  //       faker.string.sample()
  //     );
  //
  //     const handle = td.func<HttpHandlerFn>();
  //     const next: HttpHandler = { handle };
  //
  //     testScheduler.run(({ expectObservable, cold }) => {
  //       const interceptorFnResult$ = cold('a|', {
  //         a: new HttpResponse<string>({
  //           body: faker.string.sample(),
  //           status: faker.number.int(),
  //         }),
  //       });
  //
  //       td.when(
  //         interceptorFn(td.matchers.anything(), td.matchers.anything())
  //       ).thenReturn(interceptorFnResult$);
  //
  //       const result$ = service.intercept(req, next);
  //
  //       expectObservable(result$).toEqual(interceptorFnResult$);
  //     });
  //   });
  // });
});
