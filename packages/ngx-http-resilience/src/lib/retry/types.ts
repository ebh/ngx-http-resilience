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
  | 'RequestIgnored'
  | 'IgnoredRequestFailed'
  | 'UnhandledError'
  | 'FailedTryingAgain'
  | 'FailedMaxAttemptsExceeded'
  | 'MaxDelayExceeded'
  | 'Succeeded';
export const RetryInterceptorRequestTypes = {
  RequestIgnored: 'RequestIgnored',
  IgnoredRequestFailed: 'IgnoredRequestFailed',
  UnhandledError: 'UnhandledError',
  FailedTryingAgain: 'FailedTryingAgain',
  FailedMaxAttemptsExceeded: 'FailedMaxAttemptsExceeded',
  MaxDelayExceeded: 'MaxDelayExceeded',
  Succeeded: 'Succeeded',
} as const satisfies { [key in RetryInterceptorRequestType]: key };

interface BaseEvent<T extends RetryInterceptorRequestType> {
  req: HttpRequest<unknown>;
  type: T;
}

interface ErrorEvent {
  err: unknown;
}

interface MetricEvent {
  /** The number of the current attempt
   * 1st attempt is 1, 2nd attempt is 2, etc.
   */
  attempt: number;
  /** The time in milliseconds since the request was received */
  totalTime: number;
}

export type RetryInterceptorRequestIgnoredEvent = BaseEvent<'RequestIgnored'>;

export type RetryInterceptorIgnoredRequestFailed =
  BaseEvent<'IgnoredRequestFailed'> & ErrorEvent;

export type RetryInterceptorUnhandledErrorEvent = BaseEvent<'UnhandledError'> &
  ErrorEvent &
  MetricEvent;

export type RetryInterceptorRequestFailedTryingAgainEvent =
  BaseEvent<'FailedTryingAgain'> & ErrorEvent & MetricEvent;

export type RetryInterceptorRequestFailedMaxAttemptsExceededEvent =
  BaseEvent<'FailedMaxAttemptsExceeded'> & ErrorEvent & MetricEvent;

export type RetryInterceptorRequestMaxDelayExceededEvent =
  BaseEvent<'MaxDelayExceeded'> & MetricEvent;

export type RetryInterceptorRequestSucceededEvent = BaseEvent<'Succeeded'> & {
  res: unknown;
} & MetricEvent;

export type RetryInterceptorEvent =
  | RetryInterceptorRequestIgnoredEvent
  | RetryInterceptorIgnoredRequestFailed
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
