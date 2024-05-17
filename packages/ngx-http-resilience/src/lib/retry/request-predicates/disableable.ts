import { BehaviorSubject, Observable } from 'rxjs';
import { RequestPredicate } from '../types';

export interface DisableablePredicate {
  /** Returns the predicate wrapped by this disableable predicate */
  requestPredicate: RequestPredicate;
  /** Disables the predicate */
  disable: () => void;
  /** Enables the predicate */
  enable: () => void;
  /** Sets the disabled state of the predicate */
  setDisabled: (disabled: boolean) => void;
  /** Toggles the disabled state of the predicate */
  toggleDisabled: () => void;
  /** Returns an observable that emits the disabled state of the predicate */
  observeDisabledState: () => Observable<boolean>;
}

/**
 * Wraps a request predicate and allows it to be disabled
 * @param predicate The predicate to wrap
 * @param initiallyDisabled The initial disabled state of the predicate, defaults to false (enabled)
 *
 * @example
 * const disableablePredicate = createDisableablePredicate(matchPattern({method: 'GET' }));
 * createHttpRetryInterceptorFn({
 *   shouldHandleRequest: disableablePredicate.requestPredicate,
 *   ...
 * })
 */
export function createDisableablePredicate(
  predicate: RequestPredicate,
  initiallyDisabled = false
): DisableablePredicate {
  const disabled$ = new BehaviorSubject<boolean>(initiallyDisabled);

  return {
    requestPredicate: (req) => !disabled$.value && predicate(req),
    disable: () => disabled$.next(true),
    enable: () => disabled$.next(false),
    setDisabled: (disabled: boolean) => disabled$.next(disabled),
    toggleDisabled: () => disabled$.next(!disabled$.value),
    observeDisabledState: () => disabled$.asObservable(),
  };
}
