import { faker } from '@faker-js/faker';
import { exponentialDelay } from './exponential';

const startTime = faker.date.recent().getTime();

describe('exponentialDelay', () => {
  it.each`
    initialDelay | factor | fastFirst    | attempt | expected
    ${100}       | ${2}   | ${undefined} | ${1}    | ${100}
    ${100}       | ${2}   | ${undefined} | ${2}    | ${200}
    ${100}       | ${2}   | ${undefined} | ${3}    | ${400}
    ${100}       | ${3}   | ${undefined} | ${1}    | ${100}
    ${100}       | ${3}   | ${undefined} | ${2}    | ${300}
    ${100}       | ${3}   | ${undefined} | ${3}    | ${900}
    ${100}       | ${2}   | ${true}      | ${1}    | ${0}
    ${100}       | ${2}   | ${true}      | ${2}    | ${100}
    ${100}       | ${2}   | ${true}      | ${3}    | ${200}
    ${100}       | ${2}   | ${true}      | ${4}    | ${400}
    ${100}       | ${2}   | ${false}     | ${1}    | ${100}
    ${100}       | ${2}   | ${false}     | ${2}    | ${200}
    ${100}       | ${2}   | ${false}     | ${3}    | ${400}
  `(
    'should return $expected for initialDelay $initialDelay, factor $factor, fastFirst $fastFirst',
    ({ initialDelay, factor, fastFirst, attempt, expected }) => {
      expect(
        exponentialDelay(
          initialDelay,
          factor,
          fastFirst
        )({ attempt, startTime })
      ).toBe(expected);
    }
  );

  it('should throw error when initialDelay is zero', () => {
    expect(() => exponentialDelay(0)).toThrow();
  });

  it('should throw error when initialDelay is negative', () => {
    expect(() => exponentialDelay(-1)).toThrow();
  });

  it('should throw error when factor is zero', () => {
    expect(() => exponentialDelay(1, 0)).toThrow();
  });

  it('should throw error when factor is negative', () => {
    expect(() => exponentialDelay(1, -1)).toThrow();
  });
});
