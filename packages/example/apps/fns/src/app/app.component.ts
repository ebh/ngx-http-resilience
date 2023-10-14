import { Component } from '@angular/core';
import { ExampleCommonComponent } from '@ngx-http-resilience/example/common';

@Component({
  standalone: true,
  imports: [ExampleCommonComponent],
  selector: 'nhr-root',
  template: `<nhr-example-common></nhr-example-common> `,
  styles: [''],
})
export class AppComponent {
  title = 'example-apps-fns';
}
