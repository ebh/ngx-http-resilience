import { Predicate, PredicateBuilder } from './types';

/**
 * Creates a predicate builder for combining multiple predicates.
 * @returns A predicate builder.
 */
export function createPredicateBuilder<T>(): PredicateBuilder<T> {
  const predicates: Predicate<T>[] = [];

  function build(): Predicate<T> {
    if (predicates.length === 0) {
      throw new Error('No predicates provided');
    }

    return (input) => {
      return predicates.some((predicate) => predicate(input));
    };
  }

  function handle(predicate: Predicate<T>): PredicateBuilder<T> {
    predicates.push(predicate);

    return {
      build,
      handle,
    };
  }

  return { build, handle };
}
