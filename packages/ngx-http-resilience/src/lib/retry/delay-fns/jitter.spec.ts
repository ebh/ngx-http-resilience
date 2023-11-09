import { faker } from '@faker-js/faker';
import * as td from 'testdouble';
import { DelayFn } from '../types';
import { addJitter } from './jitter';

const startTime = faker.date.recent().getTime();

describe('addJitter', () => {
  it('should throw if min is greater than max', () => {
    expect(() => addJitter(td.func<DelayFn>(), { min: 10, max: 9 })).toThrow(
      'Min must be less than or equal to max'
    );
  });

  describe.each`
    min    | max   | fastFirst    | attempt | delay  | expectedMin | expectedMax
    ${0}   | ${0}  | ${undefined} | ${1}    | ${100} | ${100}      | ${100}
    ${0}   | ${0}  | ${undefined} | ${2}    | ${100} | ${100}      | ${100}
    ${-10} | ${10} | ${undefined} | ${1}    | ${100} | ${90}       | ${110}
    ${-10} | ${10} | ${undefined} | ${2}    | ${100} | ${90}       | ${110}
    ${0}   | ${0}  | ${true}      | ${1}    | ${100} | ${0}        | ${0}
    ${0}   | ${0}  | ${true}      | ${2}    | ${100} | ${100}      | ${100}
    ${-10} | ${10} | ${true}      | ${1}    | ${100} | ${0}        | ${0}
    ${-10} | ${10} | ${true}      | ${2}    | ${100} | ${90}       | ${110}
    ${0}   | ${0}  | ${false}     | ${1}    | ${100} | ${100}      | ${100}
    ${0}   | ${0}  | ${false}     | ${2}    | ${100} | ${100}      | ${100}
    ${-10} | ${10} | ${false}     | ${1}    | ${100} | ${90}       | ${110}
    ${-10} | ${10} | ${false}     | ${2}    | ${100} | ${90}       | ${110}
    ${-10} | ${10} | ${undefined} | ${1}    | ${5}   | ${0}        | ${15}
  `(
    'when {min: $min, max: $max}, fastFirst $fastFirst, attempt $attempt and delay $delay',
    ({ min, max, attempt, fastFirst, delay, expectedMin, expectedMax }) => {
      const delayFn = td.func<DelayFn>();

      td.when(delayFn({ attempt, startTime })).thenReturn(delay);

      it.each([...Array(100)])(
        `should return between ${expectedMin} and ${expectedMax}`,
        () => {
          const result = addJitter(
            delayFn,
            { min, max },
            fastFirst
          )({ attempt, startTime });

          expect(result).toBeGreaterThanOrEqual(expectedMin);
          expect(result).toBeLessThanOrEqual(expectedMax);
        }
      );

      if (expectedMin !== expectedMax) {
        it('should not return all the same result', () => {
          const results: number[] = [];

          for (let i = 0; i < 100; i++) {
            results.push(
              addJitter(
                delayFn,
                { min, max },
                fastFirst
              )({ attempt, startTime })
            );
          }

          expect(results).not.toEqual(results.map(() => results[0]));
        });
      }
    }
  );
});
