import { HttpRequest } from '@angular/common/http';
import { Subject } from 'rxjs';
import { RetryState } from './internal';

export type Predicate<T> = (input: T) => boolean;

export type RequestPredicate = Predicate<HttpRequest<unknown>>;
export type ErrorPredicate = Predicate<unknown>;
export type DelayFn = (state: RetryState) => number;

export interface RetryPolicy {
  /** Predicate for matching requests to retry */
  shouldHandleRequest: RequestPredicate;
  /** Predicate for matching errors to retry */
  shouldHandleError: ErrorPredicate;
  /** The delay function to use for calculating the delay between retries */
  delay: DelayFn;
  /** The maximum number of retry attempts */
  maxRetryAttempts?: number;
  /** The maximum total delay in milliseconds */
  maxTotalDelay?: number;
}

export type RetryInterceptorRequestType =
  | 'Ignored'
  | 'UnhandledError'
  | 'FailedTryingAgain'
  | 'FailedMaxAttemptsExceeded'
  | 'MaxDelayExceeded'
  | 'Succeeded';
export const RetryInterceptorRequestTypes = {
  Ignored: 'Ignored',
  UnhandledError: 'UnhandledError',
  FailedTryingAgain: 'FailedTryingAgain',
  FailedMaxAttemptsExceeded: 'FailedMaxAttemptsExceeded',
  MaxDelayExceeded: 'MaxDelayExceeded',
  Succeeded: 'Succeeded',
} as const satisfies { [key in RetryInterceptorRequestType]: key };

interface BaseRetryInterceptorRequest {
  req: HttpRequest<unknown>;
  type: RetryInterceptorRequestType;
}

export interface RetryInterceptorRequestIgnoredEvent
  extends BaseRetryInterceptorRequest {
  type: 'Ignored';
}

export interface RetryInterceptorUnhandledErrorEvent
  extends BaseRetryInterceptorRequest {
  type: 'UnhandledError';
  error: unknown;
  attempt: number;
}

export interface RetryInterceptorRequestFailedTryingAgainEvent
  extends BaseRetryInterceptorRequest {
  type: 'FailedTryingAgain';
  error: unknown;
  attempt: number;
}

export interface RetryInterceptorRequestFailedMaxAttemptsExceededEvent
  extends BaseRetryInterceptorRequest {
  type: 'FailedMaxAttemptsExceeded';
  error: unknown;
  attempt: number;
}

export interface RetryInterceptorRequestMaxDelayExceededEvent
  extends BaseRetryInterceptorRequest {
  type: 'MaxDelayExceeded';
  // attempt: number; -- TODO: Add attempt number to this event
}

export interface RetryInterceptorRequestSucceededEvent
  extends BaseRetryInterceptorRequest {
  type: 'Succeeded';
  res: unknown;
  attempt: number;
}

export type RetryInterceptorEvent =
  | RetryInterceptorRequestIgnoredEvent
  | RetryInterceptorUnhandledErrorEvent
  | RetryInterceptorRequestFailedTryingAgainEvent
  | RetryInterceptorRequestFailedMaxAttemptsExceededEvent
  | RetryInterceptorRequestMaxDelayExceededEvent
  | RetryInterceptorRequestSucceededEvent;

export interface RetryInterceptorOptions {
  /**
   * An optional Subject for emitting retry events
   */
  events$?: Subject<RetryInterceptorEvent>;
}

export interface PredicateBuilder<T> {
  build: () => Predicate<T>;
  handle: (predicate: Predicate<T>) => PredicateBuilder<T>;
}
