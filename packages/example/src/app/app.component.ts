import { Component } from '@angular/core';
import { NxWelcomeComponent } from './nx-welcome.component';

@Component({
  standalone: true,
  imports: [NxWelcomeComponent],
  selector: 'nhr-root',
  template: `<nhr-nx-welcome></nhr-nx-welcome> `,
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'example';
}
