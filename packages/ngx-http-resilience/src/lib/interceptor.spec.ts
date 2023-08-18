import {
  HttpEventType,
  HttpRequest,
  HttpResponse,
  HttpSentEvent,
} from '@angular/common/http';
import { faker } from '@faker-js/faker';
import { TestScheduler } from 'rxjs/testing';
import { createHttpResilienceInterceptor } from './interceptor';

type HttpRequestMethod = 'DELETE' | 'GET' | 'HEAD' | 'JSONP' | 'OPTIONS';

const HTTP_REQUEST_METHODS: HttpRequestMethod[] = [
  'DELETE',
  'GET',
  'HEAD',
  'JSONP',
  'OPTIONS',
];

let testScheduler: TestScheduler;

beforeEach(() => {
  testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });
});

it('should report http events', () => {
  testScheduler.run(({ cold, expectObservable }) => {
    const interceptor = createHttpResilienceInterceptor();

    const sentEvent1: HttpSentEvent = { type: HttpEventType.Sent };
    const sentEvent2: HttpSentEvent = { type: HttpEventType.Sent };

    const response1 = new HttpResponse<string>({ body: 'response1' });
    const response2 = new HttpResponse<string>({ body: 'response2' });

    const source1$ = cold('-s-----r|', { s: sentEvent1, r: response1 });
    const source2$ = cold('---s-r|', { s: sentEvent2, r: response2 });

    const req1 = new HttpRequest<string>(
      faker.helpers.arrayElement(HTTP_REQUEST_METHODS),
      faker.internet.url(),
      'req1'
    );
    const result1$ = interceptor.intercept(req1, {
      handle: jest.fn().mockReturnValue(source1$),
    });

    const req2 = new HttpRequest<string>(
      faker.helpers.arrayElement(HTTP_REQUEST_METHODS),
      faker.internet.url(),
      'req2'
    );
    const result2$ = interceptor.intercept(req2, {
      handle: jest.fn().mockReturnValue(source2$),
    });

    expectObservable(result1$).toBe('-s-----r|', {
      s: sentEvent1,
      r: response1,
    });
    expectObservable(result2$).toBe('---s-r|', { s: sentEvent2, r: response2 });
    expectObservable(interceptor.httpEvents$).toBe('-a-b-d-c', {
      a: { event: sentEvent1, req: req1 },
      b: { event: sentEvent2, req: req2 },
      c: { event: response1, req: req1 },
      d: { event: response2, req: req2 },
    });
  });
});
