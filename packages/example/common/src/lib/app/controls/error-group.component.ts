import { Component, Input } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';

export interface ErrorGroup {
  rateFormControl: FormControl<number | null>;
  errors: ResponseError[];
}

@Component({
  selector: 'nhr-error-group',
  standalone: true,
  template: `
    <ng-container *ngIf="color$ | async as color">
      <div class="mb-6" *ngIf="errorGroup$ | async as errorGroup">
        <div class="mb-3">
          <label for="range" class="block mb-2">
            {{ label$ | async }} errors:
          </label>
          <input
            class="range range-{{ color }}"
            type="range"
            name="range"
            min="0"
            max="100"
            [formControl]="errorGroup.rateFormControl"
          />
          <span>{{ errorGroup.rateFormControl.value }}%</span>
        </div>

        <nhr-resp-response-statuses
          [errors]="errorGroup.errors"
        ></nhr-resp-response-statuses>
      </div>
    </ng-container>
  `,
  imports: [
    RespErrorsComponent,
    AsyncPipe,
    JsonPipe,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class ErrorGroupComponent {
  protected readonly errorGroup$ = new ReplaySubject<ErrorGroup>(1);
  @Input() set errorGroup(errorGroup: ErrorGroup) {
    this.errorGroup$.next(errorGroup);
  }

  protected readonly label$ = new ReplaySubject<string>(1);
  @Input() set label(label: string) {
    this.label$.next(label);
  }

  protected readonly color$ = new BehaviorSubject<string>('neutral');
  @Input() set color(color: string) {
    this.color$.next(color);
  }
}
