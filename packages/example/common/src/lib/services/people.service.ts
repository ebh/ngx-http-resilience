import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { faker } from '@faker-js/faker';
import { Observable, filter } from 'rxjs';
import { Person } from '../types';
import { isPerson } from '../types-guards';

@Injectable()
export class PeopleService {
  constructor(private readonly httpClient: HttpClient) {}

  public observePerson(id: string): Observable<Person> {
    return this.httpClient
      .request(faker.internet.httpMethod(), `https://example.com/people/${id}`)
      .pipe(filter((response): response is Person => isPerson(response)));
  }
}
