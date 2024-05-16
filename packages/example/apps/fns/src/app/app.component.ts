import { Component } from '@angular/core';
import {
  DashboardComponent,
  LogComponentService,
  StateService,
} from '@ngx-http-resilience/example/common';
import { merge } from 'rxjs';
import { errors$, fakeBackend, httpEvents$ } from './app.config';

@Component({
  standalone: true,
  imports: [DashboardComponent],
  selector: 'nhr-root',
  template: `
    <div class="h-screen w-screen flex flex-col relative">
      <div class="h-20 flex justify-center items-center">
        <h1 class="text-3xl font-semibold accent-content">
          {{ title }}
        </h1>
      </div>
      <nhr-dashboard class="flex-grow flex"></nhr-dashboard>
      <div class="footer footer-center pt-2 text-base-content">Alex Dess</div>
    </div>
  `,
  styles: [''],
  providers: [StateService, LogComponentService],
})
export class AppComponent {
  protected title = 'ngx-http-resilience (Function Interceptors)';

  constructor(
    private readonly stateService: StateService,
    private readonly logComponentService: LogComponentService
  ) {
    console.log('AppComponent - constructor');

    this.stateService.init(fakeBackend);
    this.logComponentService.setSource(merge(httpEvents$, errors$));
  }
}
