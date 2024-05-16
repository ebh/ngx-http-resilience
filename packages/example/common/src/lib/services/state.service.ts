import { Injectable } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, Observable, ReplaySubject, map } from 'rxjs';
import { FakeBackend, FakeBackendConfig } from '../fake-backend';

@UntilDestroy()
@Injectable()
export class StateService {
  private _paused$ = new BehaviorSubject<boolean>(false);
  private _activeConfig$ = new ReplaySubject<FakeBackendConfig>(1);

  public set paused(paused: boolean) {
    this._paused$.next(paused);
  }

  public get paused$() {
    return this._paused$.asObservable();
  }

  private _fakeBackend?: FakeBackend;
  private get fakeBackend() {
    if (!this._fakeBackend) {
      throw new Error('FakeBackend not initialized');
    }

    return this._fakeBackend;
  }

  public init(fakeBackend: FakeBackend) {
    this._fakeBackend = fakeBackend;
    this._activeConfig$.next(fakeBackend.activeConfig());

    this._activeConfig$
      .pipe(untilDestroyed(this))
      .subscribe((config) => this.fakeBackend.updateConfig(config));
  }

  public updateFakeBackendConfig(config: Partial<FakeBackendConfig>) {
    if (this._fakeBackend) {
      this._fakeBackend.updateConfig(config);
    }
  }

  public observeHttpStatusCodes(): Observable<string[]> {
    return this._activeConfig$.pipe(
      map((config) => {
        return Array.from(config.errorCodes.keys()).map((key) =>
          key.toString()
        );
      })
    );
  }
}
