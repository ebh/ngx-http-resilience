import { faker } from '@faker-js/faker';
import { linearDelay } from './linear';

const startTime = faker.date.recent().getTime();

describe('linearDelay', () => {
  it.each`
    delay  | fastFirst    | attempt | expected
    ${100} | ${undefined} | ${1}    | ${100}
    ${100} | ${undefined} | ${2}    | ${200}
    ${100} | ${undefined} | ${3}    | ${300}
    ${100} | ${true}      | ${1}    | ${0}
    ${100} | ${true}      | ${2}    | ${100}
    ${100} | ${true}      | ${3}    | ${200}
    ${100} | ${false}     | ${1}    | ${100}
    ${100} | ${false}     | ${2}    | ${200}
    ${100} | ${false}     | ${3}    | ${300}
  `(
    'should return $expected for delay $delay and fastFirst $fastFirst',
    ({ delay, attempt, fastFirst, expected }) => {
      expect(linearDelay(delay, fastFirst)({ attempt, startTime })).toBe(
        expected
      );
    }
  );

  it('should throw error when delay is zero', () => {
    expect(() => linearDelay(0)).toThrow();
  });

  it('should throw error when delay is negative', () => {
    expect(() => linearDelay(-1)).toThrow();
  });
});
