import {
  AsyncPipe,
  JsonPipe,
  KeyValuePipe,
  NgFor,
  NgIf,
} from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy } from '@ngneat/until-destroy';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { ResponseStatus } from './types';

export interface ResponseError {
  key: string;
  code: ResponseStatus;
  description: string;
  checked?: boolean;
  formControl: FormControl<boolean | null>;
}

@UntilDestroy()
@Component({
  selector: 'nhr-resp-response-statuses',
  standalone: true,
  template: `
    <div *ngIf="color$ | async as color">
      <div class="flex items-center mb-1" *ngFor="let error of errors$ | async">
        <label for="{{ error.key }}" class="flex-grow-0"
          >{{ error.code.code }} - {{ error.code.description }}</label
        >
        <div class="flex-grow">
          <input
            type="checkbox"
            [formControl]="error.formControl"
            class="toggle toggle-{{ color }} float-right"
          />
        </div>
      </div>
    </div>
  `,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    JsonPipe,
    KeyValuePipe,
    NgFor,
    AsyncPipe,
    NgIf,
  ],
})
export class RespErrorsComponent {
  protected readonly errors$ = new ReplaySubject<ResponseError[]>(1);
  @Input() set errors(errors: ResponseError[]) {
    this.errors$.next(errors);
  }

  protected readonly color$ = new BehaviorSubject<string>('neutral');
  @Input() set color(color: string) {
    this.color$.next(color);
  }
}
