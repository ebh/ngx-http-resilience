import { HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { faker } from '@faker-js/faker';
import * as td from 'testdouble';
import { createPredicateBuilder } from './predicate-builder';
import { Predicate } from './types';

describe.each([
  [
    'HttpRequest',
    new HttpRequest<string>(
      faker.internet.httpMethod(),
      faker.internet.url(),
      faker.string.sample()
    ),
  ],
  ['HttpErrorResponse', new HttpErrorResponse({ status: faker.number.int() })],
])('createPredicateBuilder<%s>', (_, input) => {
  it('should throw error when no predicate is provided', () => {
    expect(() => createPredicateBuilder().build()).toThrow();
  });

  describe('when only one predicate is provided', () => {
    const predicate = td.func<Predicate<unknown>>();

    it.each([true, false])(
      'should return predicate result when predicate returns %s',
      (predicateResult) => {
        const builtPredicate = createPredicateBuilder()
          .handle(predicate)
          .build();

        td.when(predicate(input)).thenReturn(predicateResult);

        expect(builtPredicate(input)).toBe(predicateResult);
      }
    );
  });

  describe('when multiple predicates are provided', () => {
    const predicate1 = td.func<Predicate<unknown>>();
    const predicate2 = td.func<Predicate<unknown>>();

    it.each`
      predicate1Result | predicate2Result | expectedResult
      ${true}          | ${true}          | ${true}
      ${true}          | ${false}         | ${true}
      ${false}         | ${true}          | ${true}
      ${false}         | ${false}         | ${false}
    `(
      'should return predicate result when predicate returns %s',
      ({ predicate1Result, predicate2Result, expectedResult }) => {
        const builtPredicate = createPredicateBuilder()
          .handle(predicate1)
          .handle(predicate2)
          .build();

        td.when(predicate1(input)).thenReturn(predicate1Result);
        td.when(predicate2(input)).thenReturn(predicate2Result);

        expect(builtPredicate(input)).toBe(expectedResult);
      }
    );
  });
});
