import { HttpContext, HttpRequest } from '@angular/common/http';
import { faker } from '@faker-js/faker';
import { createContextPredicate } from './context';

const { getMarkedRequest, getContext, markContext, requestPredicate } =
  createContextPredicate();

describe('requestPredicate', () => {
  describe('getContext', () => {
    it('should return false for a unmarked context', () => {
      const req = new HttpRequest(
        faker.internet.httpMethod(),
        faker.internet.url(),
        faker.string.sample()
      );

      expect(requestPredicate(req)).toBe(false);
    });

    it('should return true for a marked context', () => {
      const context = getContext();
      const req = new HttpRequest(
        faker.internet.httpMethod(),
        faker.internet.url(),
        faker.string.sample(),
        { context }
      );

      expect(requestPredicate(req)).toBe(true);
    });
  });

  describe('markContext', () => {
    it('should return false for a unmarked context', () => {
      const context = new HttpContext();
      const req = new HttpRequest(
        faker.internet.httpMethod(),
        faker.internet.url(),
        faker.string.sample(),
        { context }
      );

      expect(requestPredicate(req)).toBe(false);
    });

    it('should return true for a marked context', () => {
      const context = new HttpContext();
      markContext(context);

      const req = new HttpRequest(
        faker.internet.httpMethod(),
        faker.internet.url(),
        faker.string.sample(),
        { context }
      );

      expect(requestPredicate(req)).toBe(true);
    });

    describe('when multiple context predicates are used', () => {
      const { markContext: markContext2, requestPredicate: requestPredicate2 } =
        createContextPredicate();

      it('should return false for requests marked by other context predicate', () => {
        const context = new HttpContext();
        markContext2(context);

        const req = new HttpRequest(
          faker.internet.httpMethod(),
          faker.internet.url(),
          faker.string.sample(),
          { context }
        );

        expect(requestPredicate(req)).toBe(false);
      });

      it('should return true for requests marked by multiple context predicates', () => {
        const context = new HttpContext();
        markContext(context);
        markContext2(context);

        const req = new HttpRequest(
          faker.internet.httpMethod(),
          faker.internet.url(),
          faker.string.sample(),
          { context }
        );

        expect(requestPredicate(req)).toBe(true);
        expect(requestPredicate2(req)).toBe(true);
      });
    });
  });

  describe('when marked by getMarkedRequest', () => {
    it('should return false for requests not marked', () => {
      const req = new HttpRequest(
        faker.internet.httpMethod(),
        faker.internet.url(),
        faker.string.sample()
      );

      expect(requestPredicate(req)).toBe(false);
    });

    it('should return true for requests marked', () => {
      const req = new HttpRequest(
        faker.internet.httpMethod(),
        faker.internet.url(),
        faker.string.sample()
      );
      const markedReq = getMarkedRequest(req);

      expect(requestPredicate(markedReq)).toBe(true);
    });

    describe('when multiple context predicates are used', () => {
      const {
        getMarkedRequest: getMarkedRequest2,
        requestPredicate: requestPredicate2,
      } = createContextPredicate();

      it('should return false for requests marked by other context predicate', () => {
        const req = new HttpRequest(
          faker.internet.httpMethod(),
          faker.internet.url(),
          faker.string.sample()
        );
        const markedReq = getMarkedRequest2(req);

        expect(requestPredicate(markedReq)).toBe(false);
      });

      it('should return true for requests marked by multiple context predicates', () => {
        const req = new HttpRequest(
          faker.internet.httpMethod(),
          faker.internet.url(),
          faker.string.sample()
        );

        const markedReq = getMarkedRequest2(getMarkedRequest(req));

        expect(requestPredicate(markedReq)).toBe(true);
        expect(requestPredicate2(markedReq)).toBe(true);
      });
    });
  });
});
