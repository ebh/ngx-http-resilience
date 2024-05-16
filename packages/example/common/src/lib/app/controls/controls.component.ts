import { AsyncPipe, JsonPipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormRecord, ReactiveFormsModule } from '@angular/forms';
import { isNil } from 'lodash';
import { Observable } from 'rxjs';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'nhr-controls',
  standalone: true,
  template: `
    <div class="form-control">
      <label class="label cursor-pointer">
        <span
          class="label-text"
          [ngClass]="[
            (paused$ | async) === true ? 'text-warning' : 'text-success'
          ]"
        >
          {{ (paused$ | async) === true ? 'Paused' : 'Running' }}
        </span>
        <input
          type="checkbox"
          class="toggle toggle-warning"
          [formControl]="paused"
        />
      </label>

      <label for="range" class="block mb-2"> Error rate: </label>
      <input
        class="range range-error"
        type="range"
        name="range"
        min="0"
        max="100"
        [formControl]="errorRate"
      />
      <span>{{ errorRate.value }}%</span>

      <pre>httpStatusCodes$: {{ httpStatusCodes$ | async | json }}</pre>

      <!--      <ng-container *ngIf="httpStatusCodes$ | async as httpStatusCodes">-->
      <!--        <div *ngFor="let code of httpStatusCodes">-->
      <!--          {{ code }}-->
      <!--        </div>-->
      <!--      </ng-container>-->
    </div>
  `,
  imports: [AsyncPipe, NgClass, ReactiveFormsModule, NgForOf, NgIf, JsonPipe],
})
export class ControlsComponent {
  protected readonly paused = new FormControl<boolean>(false);
  protected readonly errorRate = new FormControl<number>(0);
  protected readonly errorCodes = new FormRecord<FormControl<boolean>>({});

  protected readonly paused$ = this.stateService.paused$;

  protected readonly httpStatusCodes$: Observable<string[]>;

  constructor(private readonly stateService: StateService) {
    console.log('ControlsComponent - constructor');

    this.httpStatusCodes$ = stateService.observeHttpStatusCodes();

    this.listenToPausedChanges();
    this.listenToErrorRateChanges();
  }

  private listenToPausedChanges() {
    this.paused.valueChanges.subscribe((paused) => {
      if (!isNil(paused)) {
        this.stateService.paused = paused;
      }
    });
  }

  private listenToErrorRateChanges() {
    this.errorRate.valueChanges.subscribe((errorRate) => {
      if (!isNil(errorRate)) {
        this.stateService.updateFakeBackendConfig({
          errorRate,
        });
      }
    });
  }
}
