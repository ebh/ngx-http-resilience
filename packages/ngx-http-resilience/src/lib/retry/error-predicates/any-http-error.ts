import { HttpErrorResponse } from '@angular/common/http';
import { ErrorPredicate } from '../types';

/**
 * Any HttpErrorResponse, should be handled. Other errors are ignored.
 */
export function anyHttpError(): ErrorPredicate {
  return function (error) {
    return isHttpErrorResponse(error);
  };
}

function isHttpErrorResponse(error: unknown): error is HttpErrorResponse {
  return error instanceof HttpErrorResponse;
}
