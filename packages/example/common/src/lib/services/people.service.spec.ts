import { HttpClient } from '@angular/common/http';
import { faker } from '@faker-js/faker';
import { TestScheduler } from 'rxjs/testing';
import * as td from 'testdouble';
import { Person } from '../types';
import { PeopleService } from './people.service';

let httpClient: HttpClient;
let testScheduler: TestScheduler;

beforeEach(() => {
  httpClient = td.object<HttpClient>();

  testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });
});

describe('PeopleService', () => {
  describe('observePerson', () => {
    it('returns a person', () => {
      const service = new PeopleService(httpClient);

      testScheduler.run(({ cold, expectObservable }) => {
        const person: Person = {
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          dateOfBirth: faker.date.past(),
          country: faker.location.country(),
        };

        const resp = cold('---p|', { p: person });

        td.when(
          httpClient.request(td.matchers.anything(), td.matchers.anything())
        ).thenReturn(resp);

        expectObservable(service.observePerson(faker.string.sample())).toBe(
          '---p|',
          {
            p: person,
          }
        );
      });
    });
  });
});
