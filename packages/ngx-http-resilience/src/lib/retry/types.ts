import { HttpRequest } from '@angular/common/http';
import { RetryState } from './internal';

export type Predicate<T> = (input: T) => boolean;

export type RequestPredicate = Predicate<HttpRequest<unknown>>;
export type ErrorPredicate = Predicate<unknown>;
export type DelayFn = (state: RetryState) => number;

export interface RetryStrategy {
  /** The delay function to use for calculating the delay between retries */
  delay: DelayFn;
  /** The maximum number of retry attempts */
  maxRetryAttempts?: number;
  /** The maximum total delay in milliseconds */
  maxTotalDelay?: number;
}

export interface RetryPolicy extends RetryStrategy {
  /** Predicate for matching requests to retry */
  shouldHandleRequest: RequestPredicate;
  /** Predicate for matching errors to retry */
  shouldHandleError: ErrorPredicate;
}

export interface PredicateBuilder<T> {
  build: () => Predicate<T>;
  handle: (predicate: Predicate<T>) => PredicateBuilder<T>;
}
