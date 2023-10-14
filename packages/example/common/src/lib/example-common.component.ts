import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'nhr-example-common',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="alert alert-info">example-common works!</div>`,
  styles: [],
})
export class ExampleCommonComponent {}
