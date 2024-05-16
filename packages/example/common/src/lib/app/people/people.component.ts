import { Component } from '@angular/core';
import { PersonComponent } from './person.component';

@Component({
  selector: 'nhr-people',
  standalone: true,
  template: `
    <div class="grid grid-cols-3 grid-rows-2 gap-2 h-full">
      <nhr-person [id]="'1'"></nhr-person>
      <nhr-person [id]="'2'"></nhr-person>
      <nhr-person [id]="'3'"></nhr-person>

      <nhr-person [id]="'4'"></nhr-person>
      <nhr-person [id]="'5'"></nhr-person>
      <nhr-person [id]="'6'"></nhr-person>
    </div>
  `,
  imports: [PersonComponent],
})
export class PeopleComponent {}
