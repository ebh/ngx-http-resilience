import { Component } from '@angular/core';
import { NxWelcomeComponent } from './nx-welcome.component';

@Component({
  standalone: true,
  imports: [NxWelcomeComponent],
  selector: 'ngx-http-resilience-root',
  template: `<ngx-http-resilience-nx-welcome></ngx-http-resilience-nx-welcome> `,
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'example';
}
