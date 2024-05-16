import { HttpErrorResponse } from '@angular/common/http';
import { faker } from '@faker-js/faker';
import { Observable } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import * as td from 'testdouble';
import { PeopleService } from '../../services/people.service';
import { Person } from '../../types';
import { PersonComponentService } from './person.component.service';

let peopleService: PeopleService;
let service: PersonComponentService;
let testScheduler: TestScheduler;

function createMockPerson(): Person {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    dateOfBirth: faker.date.past(),
    country: faker.location.country(),
  };
}

beforeEach(() => {
  peopleService = td.object<PeopleService>();

  service = new PersonComponentService(peopleService);

  testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });
});

describe('PersonComponentService', () => {
  describe('observePerson', () => {
    const id = faker.string.numeric(1);

    beforeEach(() => {
      service.id = id;
    });

    it('should request and return a person every second', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        const personA = createMockPerson();
        const personB = createMockPerson();
        const personC = createMockPerson();

        const respA$ = cold('p', { p: personA });
        const respB$ = cold('p', { p: personB });
        const respC$ = cold('p', { p: personC });

        td.when(peopleService.observePerson(id)).thenReturn(
          respA$,
          respB$,
          respC$
        );

        const unsub = ' 4s !';

        expectObservable(service.observePerson(), unsub).toBe(
          '1000ms a 999ms b 999ms c',
          {
            a: personA,
            b: personB,
            c: personC,
          }
        );
      });
    });

    it('should keep requesting even after an error', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        const personA = createMockPerson();
        const errorB = new HttpErrorResponse({
          status: faker.number.int({ min: 400, max: 599 }),
        });
        const personC = createMockPerson();
        const personD = createMockPerson();
        const errorE = new HttpErrorResponse({
          status: faker.number.int({ min: 400, max: 599 }),
        });
        const personF = createMockPerson();

        const respA$ = cold('p', { p: personA });
        const respB$: Observable<Person> = cold('---#', {}, errorB);
        const respC$ = cold('p', { p: personC });
        const respD$ = cold('p', { p: personD });
        const respE$: Observable<Person> = cold('---#', {}, errorE);
        const respF$ = cold('p', { p: personF });

        td.when(peopleService.observePerson(id)).thenReturn(
          respA$,
          respB$,
          respC$,
          respD$,
          respE$,
          respF$
        );

        const unsub = ' 7s !';

        expectObservable(service.observePerson(), unsub).toBe(
          '1000ms a 999ms ---- 999ms c 999ms d 999ms ---- 999ms f',
          {
            a: personA,

            c: personC,
            d: personD,

            f: personF,
          }
        );
        expectObservable(service.observeError(), unsub).toBe(
          '1000ms a 999ms ---b 999ms c 999ms d 999ms ---e 999ms f',
          {
            a: undefined,
            b: errorB,
            c: undefined,
            d: undefined,
            e: errorE,
            f: undefined,
          }
        );
      });
    });
  });
});
