import { Person } from './types';

export function isPerson(value: unknown): value is Person {
  return (
    typeof value === 'object' &&
    value !== null &&
    'firstName' in value &&
    typeof value.firstName === 'string' &&
    'lastName' in value &&
    typeof value.lastName === 'string' &&
    'dateOfBirth' in value &&
    value.dateOfBirth instanceof Date &&
    'country' in value &&
    typeof value.country === 'string'
  );
}
