import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StateService } from '../../services/state.service';

@Injectable()
export class ControlsComponentService {
  private paused$ = new BehaviorSubject<boolean>(false);

  constructor(private readonly stateService: StateService) {}

  public setPaused(paused: boolean) {
    console.log('setPaused', paused);
  }

  public setErrorRate(errorRate: number) {
    console.log('setErrorRate', errorRate);
  }
}
