import { faker } from '@faker-js/faker';
import { constantDelay } from './constant';

const startTime = faker.date.recent().getTime();

describe('constantDelay', () => {
  it.each`
    delay  | fastFirst    | attempt | expected
    ${100} | ${undefined} | ${1}    | ${100}
    ${100} | ${undefined} | ${2}    | ${100}
    ${100} | ${undefined} | ${3}    | ${100}
    ${100} | ${true}      | ${1}    | ${0}
    ${100} | ${true}      | ${2}    | ${100}
    ${100} | ${true}      | ${3}    | ${100}
    ${100} | ${false}     | ${1}    | ${100}
    ${100} | ${false}     | ${2}    | ${100}
    ${100} | ${false}     | ${3}    | ${100}
  `(
    'should return $expected for delay $delay and fastFirst $fastFirst',
    ({ delay, attempt, fastFirst, expected }) => {
      expect(constantDelay(delay, fastFirst)({ attempt, startTime })).toBe(
        expected
      );
    }
  );

  it('should throw error when delay is negative', () => {
    expect(() => constantDelay(-1)).toThrow();
  });
});
