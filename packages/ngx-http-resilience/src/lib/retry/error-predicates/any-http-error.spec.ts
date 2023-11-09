import { HttpErrorResponse } from '@angular/common/http';
import { anyHttpError } from './any-http-error';

describe('anyHttpError', () => {
  it.each`
    error                                     | expected
    ${new Error('Some error')}                | ${false}
    ${new HttpErrorResponse({ status: 400 })} | ${true}
    ${new HttpErrorResponse({ status: 500 })} | ${true}
  `('should return $expected when $error', ({ error, expected }) => {
    const predicate = anyHttpError();

    expect(predicate(error)).toBe(expected);
  });
});
