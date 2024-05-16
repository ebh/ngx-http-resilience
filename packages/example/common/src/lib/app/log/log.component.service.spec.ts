import { HttpEventType, HttpRequest } from '@angular/common/http';
import { faker } from '@faker-js/faker';
import {
  HttpVisibilityInterceptorError,
  HttpVisibilityInterceptorHttpEvent,
} from 'ngx-http-resilience';
import { TestScheduler } from 'rxjs/testing';
import {
  DecoratedLogEvent,
  LogComponentService,
  LogEventType,
} from './log.component.service';

let service: LogComponentService;
let testScheduler: TestScheduler;

beforeEach(() => {
  service = new LogComponentService();

  testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });
});

describe('LogComponentService', () => {
  describe('observeEvents', () => {
    it('should return empty array when source not set', () => {
      testScheduler.run(({ expectObservable }) => {
        expectObservable(service.observeEvents()).toBe('a', {
          a: [],
        });
      });
    });

    it('should return events when source set', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        const reqA = new HttpRequest<unknown>(
          faker.internet.httpMethod(),
          faker.internet.url(),
          faker.string.sample()
        );
        const event: HttpVisibilityInterceptorHttpEvent<unknown> = {
          event: { type: HttpEventType.Sent },
          req: reqA,
          duration: faker.number.int(),
        };

        const reqB = new HttpRequest<unknown>(
          faker.internet.httpMethod(),
          faker.internet.url(),
          faker.string.sample()
        );
        const error: HttpVisibilityInterceptorError = {
          err: {},
          req: reqB,
          duration: faker.number.int(),
        };

        const source$ = cold('a--b', {
          a: event,
          b: error,
        });

        service.setSource(source$);

        const eventA: DecoratedLogEvent = {
          method: reqA.method,
          url: reqA.url,
          type: LogEventType.sent,
          color: 'text-info',
        };

        const eventB: DecoratedLogEvent = {
          method: reqB.method,
          url: reqB.url,
          type: LogEventType.error,
          color: 'text-error',
        };

        expectObservable(service.observeEvents()).toBe('a--b', {
          a: [eventA],
          b: [eventB, eventA],
        });
      });
    });

    it('should limit events to 10', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        function createEvent(
          seq: number
        ): HttpVisibilityInterceptorHttpEvent<unknown> {
          return {
            event: { type: HttpEventType.Sent },
            req: new HttpRequest<unknown>(
              faker.internet.httpMethod(),
              faker.internet.url() + `/${seq}`,
              faker.string.sample()
            ),
            duration: faker.number.int(),
          };
        }

        const events = [...Array(4)].map((_, index) => createEvent(index));

        const source$ = cold('a--b--c--d', {
          a: events[0],
          b: events[1],
          c: events[2],
          d: events[3],
        });

        service.buffer = 3;

        service.setSource(source$);

        expectObservable(service.observeEvents()).toBe('a--b--c--d', {
          a: [expect.objectContaining({ url: events[0].req.url })],
          b: [
            expect.objectContaining({ url: events[1].req.url }),
            expect.objectContaining({ url: events[0].req.url }),
          ],
          c: [
            expect.objectContaining({ url: events[2].req.url }),
            expect.objectContaining({ url: events[1].req.url }),
            expect.objectContaining({ url: events[0].req.url }),
          ],
          d: [
            expect.objectContaining({ url: events[3].req.url }),
            expect.objectContaining({ url: events[2].req.url }),
            expect.objectContaining({ url: events[1].req.url }),
          ],
        });
      });
    });
  });
});
