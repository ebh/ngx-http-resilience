import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  DashboardComponent,
  LogComponentService,
} from '@ngx-http-resilience/example/common';
import { merge } from 'rxjs';
import { visibilityInterceptorService } from './app.config';

@Component({
  standalone: true,
  imports: [DashboardComponent, HttpClientModule],
  selector: 'nhr-root',
  template: `
    <div class="h-screen w-screen flex flex-col relative">
      <div class="h-20 flex justify-center items-center">
        <h1 class="text-3xl font-semibold accent-content">
          ngx-http-resilience (Service Interceptors)
        </h1>
      </div>
      <nhr-dashboard class="flex-grow flex"></nhr-dashboard>
      <div class="footer footer-center pt-2 text-base-content">Alex Dess</div>
    </div>
  `,
  styles: [''],
})
export class AppComponent {
  title = 'example-apps-services';

  constructor(private readonly LogComponentService: LogComponentService) {
    this.LogComponentService.setSource(
      merge(
        visibilityInterceptorService.observeHttpEvents(),
        visibilityInterceptorService.observeErrors()
      )
    );
  }
}
