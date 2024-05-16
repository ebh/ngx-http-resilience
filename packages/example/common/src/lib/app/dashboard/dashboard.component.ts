import { Component } from '@angular/core';
import { PeopleService } from '../../services/people.service';
import { StateService } from '../../services/state.service';
import { ControlsComponent } from '../controls/controls.component';
import { LogComponent } from '../log/log.component';
import { PeopleComponent } from '../people/people.component';

@Component({
  selector: 'nhr-dashboard',
  standalone: true,
  template: `
    <nhr-controls class="w-1/3 h-full pr-2"></nhr-controls>

    <div class="w-2/3 flex flex-col">
      <nhr-people class="h-1/3 pb-2"></nhr-people>

      <nhr-log class="h-2/3"></nhr-log>
    </div>
  `,
  imports: [ControlsComponent, PeopleComponent, LogComponent],
  providers: [PeopleService, StateService],
})
export class DashboardComponent {
  constructor() {
    console.log('DashboardComponent - constructor');
  }
}
