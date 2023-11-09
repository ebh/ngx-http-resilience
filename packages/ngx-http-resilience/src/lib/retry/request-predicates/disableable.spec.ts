import { HttpRequest } from '@angular/common/http';
import { faker } from '@faker-js/faker';
import * as td from 'testdouble';
import { RequestPredicate } from '../types';
import { createDisableablePredicate } from './disableable';

describe.each([false, true])(
  'DisableablePredicate - %s',
  (wrappedPredicateResult) => {
    const wrappedPredicate = td.func<RequestPredicate>();
    const req = new HttpRequest<string>(
      faker.internet.httpMethod(),
      faker.internet.url(),
      faker.string.sample()
    );
    td.when(wrappedPredicate(req)).thenReturn(wrappedPredicateResult);

    describe('requestPredicate', () => {
      it('should return result of wrapped predicate when no initial state provided', () => {
        const predicate = createDisableablePredicate(wrappedPredicate);

        expect(predicate.requestPredicate(req)).toEqual(wrappedPredicateResult);
      });

      it('should return result of wrapped predicate when initial state is false', () => {
        const predicate = createDisableablePredicate(wrappedPredicate, false);

        expect(predicate.requestPredicate(req)).toEqual(wrappedPredicateResult);
      });

      it('should return false when initial state is true', () => {
        const predicate = createDisableablePredicate(wrappedPredicate, true);

        expect(predicate.requestPredicate(req)).toBe(false);
      });
    });

    describe('disable', () => {
      it('should disable predicate', () => {
        const predicate = createDisableablePredicate(wrappedPredicate);

        predicate.disable();

        expect(predicate.requestPredicate(req)).toBe(false);
      });
    });

    describe('enable', () => {
      it('should enable predicate', () => {
        const predicate = createDisableablePredicate(wrappedPredicate, true);

        predicate.enable();

        expect(predicate.requestPredicate(req)).toBe(wrappedPredicateResult);
      });
    });

    describe('setDisabled', () => {
      it('should return false when disabled state to true', () => {
        const predicate = createDisableablePredicate(wrappedPredicate, false);

        predicate.setDisabled(true);

        expect(predicate.requestPredicate(req)).toBe(false);
      });

      it('should return false result of wrapped predicate when disabled state to false', () => {
        const predicate = createDisableablePredicate(wrappedPredicate, true);

        predicate.setDisabled(false);

        expect(predicate.requestPredicate(req)).toBe(wrappedPredicateResult);
      });
    });

    describe('toggleDisabled', () => {
      it('should return false when disabled state is true', () => {
        const predicate = createDisableablePredicate(wrappedPredicate, false);

        predicate.toggleDisabled();

        expect(predicate.requestPredicate(req)).toBe(false);
      });

      it('should return false result of wrapped predicate when disabled state is false', () => {
        const predicate = createDisableablePredicate(wrappedPredicate, true);

        predicate.toggleDisabled();

        expect(predicate.requestPredicate(req)).toBe(wrappedPredicateResult);
      });
    });
  }
);
