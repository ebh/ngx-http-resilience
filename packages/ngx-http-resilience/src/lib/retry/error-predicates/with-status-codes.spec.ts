import { HttpErrorResponse } from '@angular/common/http';
import { withStatusCodes } from './with-status-codes';

const plainError = new Error('some error');
const httpErrorWithStatus400 = new HttpErrorResponse({ status: 400 });
const httpErrorWithStatus500 = new HttpErrorResponse({ status: 500 });

describe('withStatusCodes', () => {
  describe.each(['', [], new Set<string>(), {}])('when given %s', (code) => {
    it.each([plainError, httpErrorWithStatus400, httpErrorWithStatus500])(
      'should return false - %s',
      (error) => {
        const predicate = withStatusCodes(code);

        expect(predicate(error)).toBe(false);
      }
    );
  });

  it.each`
    error                                     | code                      | expected
    ${plainError}                             | ${500}                    | ${false}
    ${httpErrorWithStatus400}                 | ${500}                    | ${false}
    ${httpErrorWithStatus500}                 | ${500}                    | ${true}
    ${plainError}                             | ${[500]}                  | ${false}
    ${httpErrorWithStatus400}                 | ${[500]}                  | ${false}
    ${httpErrorWithStatus500}                 | ${[500]}                  | ${true}
    ${plainError}                             | ${new Set([500])}         | ${false}
    ${httpErrorWithStatus400}                 | ${new Set([500])}         | ${false}
    ${httpErrorWithStatus500}                 | ${new Set([500])}         | ${true}
    ${plainError}                             | ${{ min: 500 }}           | ${false}
    ${httpErrorWithStatus400}                 | ${{ min: 500 }}           | ${false}
    ${httpErrorWithStatus400}                 | ${{ min: 500 }}           | ${false}
    ${new HttpErrorResponse({ status: 499 })} | ${{ min: 500 }}           | ${false}
    ${httpErrorWithStatus500}                 | ${{ min: 500 }}           | ${true}
    ${plainError}                             | ${{ max: 500 }}           | ${false}
    ${httpErrorWithStatus400}                 | ${{ max: 500 }}           | ${true}
    ${httpErrorWithStatus500}                 | ${{ max: 500 }}           | ${true}
    ${new HttpErrorResponse({ status: 501 })} | ${{ max: 500 }}           | ${false}
    ${plainError}                             | ${{ min: 500, max: 550 }} | ${false}
    ${httpErrorWithStatus400}                 | ${{ min: 500, max: 550 }} | ${false}
    ${new HttpErrorResponse({ status: 499 })} | ${{ min: 500, max: 550 }} | ${false}
    ${httpErrorWithStatus500}                 | ${{ min: 500, max: 550 }} | ${true}
    ${new HttpErrorResponse({ status: 551 })} | ${{ min: 500, max: 550 }} | ${false}
  `(
    'should return $expected when given $error and $code',
    ({ error, code, expected }) => {
      const predicate = withStatusCodes(code);

      expect(predicate(error)).toBe(expected);
    }
  );
});
