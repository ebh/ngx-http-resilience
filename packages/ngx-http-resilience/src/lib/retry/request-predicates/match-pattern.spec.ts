import { HttpRequest } from '@angular/common/http';
import { faker } from '@faker-js/faker';
import { matchPattern } from './match-pattern';

describe('patternMatch', () => {
  const exampleUrl = 'https:/example.com';

  describe('when only method pattern', () => {
    it.each`
      method      | pattern                     | expected
      ${'GET'}    | ${undefined}                | ${false}
      ${'DELETE'} | ${'GET'}                    | ${false}
      ${'GET'}    | ${'GET'}                    | ${true}
      ${'GET'}    | ${[]}                       | ${false}
      ${'DELETE'} | ${['GET']}                  | ${false}
      ${'GET'}    | ${['GET']}                  | ${true}
      ${'DELETE'} | ${['POST', 'GET']}          | ${false}
      ${'GET'}    | ${['POST', 'GET']}          | ${true}
      ${'GET'}    | ${new Set(['GET'])}         | ${true}
      ${'GET'}    | ${new Set(['POST'])}        | ${false}
      ${'GET'}    | ${new Set()}                | ${false}
      ${'GET'}    | ${new Set(['POST', 'GET'])} | ${true}
      ${'GET'}    | ${/^P/}                     | ${false}
      ${'POST'}   | ${/^P/}                     | ${true}
    `(
      'should return $expected when method is $method and pattern is $pattern',
      ({ method, pattern, expected }) => {
        const predicate = matchPattern({ method: pattern });

        expect(
          predicate(
            new HttpRequest<unknown>(
              method,
              faker.internet.url(),
              faker.string.sample()
            )
          )
        ).toBe(expected);
      }
    );
  });

  describe('when only url pattern', () => {
    it.each`
      url                     | pattern       | expected
      ${undefined}            | ${undefined}  | ${false}
      ${''}                   | ${undefined}  | ${false}
      ${faker.internet.url()} | ${undefined}  | ${false}
      ${exampleUrl}           | ${exampleUrl} | ${true}
      ${exampleUrl}           | ${/abc/}      | ${false}
      ${exampleUrl}           | ${/example/}  | ${true}
    `(
      'should return $expected when url is $url and pattern is $pattern',
      ({ url, pattern, expected }) => {
        const predicate = matchPattern({ url: pattern });

        expect(
          predicate(
            new HttpRequest<unknown>(
              faker.internet.httpMethod(),
              url,
              faker.string.sample()
            )
          )
        ).toBe(expected);
      }
    );
  });

  describe('when method & url pattern', () => {
    it('should return false when neither match', () => {
      const predicate = matchPattern({
        method: 'GET',
        url: 'abc',
      });

      expect(
        predicate(
          new HttpRequest<unknown>('POST', exampleUrl, faker.string.sample())
        )
      ).toBe(false);
    });

    it('should return true when both match', () => {
      const predicate = matchPattern({
        method: 'GET',
        url: exampleUrl,
      });

      expect(
        predicate(
          new HttpRequest<unknown>('GET', exampleUrl, faker.string.sample())
        )
      ).toBe(true);
    });

    it('should return false when only method match', () => {
      const predicate = matchPattern({
        method: 'GET',
        url: 'abc',
      });

      expect(
        predicate(
          new HttpRequest<unknown>('GET', exampleUrl, faker.string.sample())
        )
      ).toBe(false);
    });

    it('should return false when only url match', () => {
      const predicate = matchPattern({
        method: 'GET',
        url: exampleUrl,
      });

      expect(
        predicate(
          new HttpRequest<unknown>('POST', exampleUrl, faker.string.sample())
        )
      ).toBe(false);
    });
  });
});
