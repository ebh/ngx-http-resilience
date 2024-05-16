import { Injectable } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import {
  ReplaySubject,
  catchError,
  interval,
  retry,
  switchMap,
  tap,
} from 'rxjs';
import { PeopleService } from '../../services/people.service';

@UntilDestroy()
@Injectable()
export class PersonComponentService {
  private readonly interval = 1000;

  private readonly id$ = new ReplaySubject<string>(1);
  private readonly errors$ = new ReplaySubject<unknown>(1);

  private readonly request$ = this.id$.pipe(
    switchMap((id) => this.peopleService.observePerson(id))
  );

  public set id(value: string) {
    this.id$.next(value);
  }

  constructor(private readonly peopleService: PeopleService) {}

  public observePerson() {
    return interval(this.interval).pipe(
      switchMap(() => this.request$),
      tap(() => this.errors$.next(undefined)),
      catchError((error: unknown) => {
        this.errors$.next(error);

        throw error;
      }),
      retry()
    );
  }

  public observeError() {
    return this.errors$.asObservable();
  }
}
