import { HttpErrorResponse } from '@angular/common/http';
import { anyError } from './any-error';

describe('anyError', () => {
  it.each([
    new Error('Some error'),
    new HttpErrorResponse({ status: 400 }),
    new HttpErrorResponse({ status: 500 }),
  ])('should return true', (error) => {
    const predicate = anyError();

    expect(predicate(error)).toBe(true);
  });
});
