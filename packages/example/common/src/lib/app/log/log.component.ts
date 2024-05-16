import { AsyncPipe, DecimalPipe, NgClass, NgForOf } from '@angular/common';
import { Component } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { LogComponentService } from './log.component.service';

@UntilDestroy()
@Component({
  selector: 'nhr-log',
  standalone: true,
  template: `
    <div class="flex justify-between min-w-fit overflow-auto">
      <table class="table table-xs">
        <thead>
          <tr>
            <th>Method</th>
            <th>URL</th>
            <th>Type</th>
            <th>Status</th>
            <th class="text-right">Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let event of events$ | async">
            <td>{{ event.method }}</td>
            <td>{{ event.url }}</td>
            <td [ngClass]="event.color">{{ event.type }}</td>
            <td [ngClass]="event.color">{{ event.status }}</td>
            <!--            <td class="text-right">{{ event.duration | number : '0.0' }} ms</td>-->
          </tr>
        </tbody>
      </table>
    </div>
  `,
  imports: [NgClass, DecimalPipe, AsyncPipe, NgForOf],
})
export class LogComponent {
  protected readonly events$ = this.componentService.observeEvents();

  constructor(private readonly componentService: LogComponentService) {}
}
