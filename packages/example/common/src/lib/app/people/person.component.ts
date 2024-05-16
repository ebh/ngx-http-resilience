import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PersonComponentService } from './person.component.service';

@Component({
  selector: 'nhr-person',
  standalone: true,
  template: `
    <div class="p-2 border-2 rounded-lg border-neutral-content  h-full">
      <ng-container *ngIf="person$ | async as person; else loading">
        <h1 class="w-full overflow-ellipsis truncate text-lg">
          {{ person.firstName }} {{ person.lastName }}
        </h1>

        <p class="w-full">{{ person.dateOfBirth | date : 'shortDate' }}</p>

        <p class="w-full">{{ person.country }}</p>
      </ng-container>

      <ng-template #loading>
        <div class="h-full flex items-center justify-center">
          <span class="loading loading-dots loading-sm"></span>
        </div>
      </ng-template>
    </div>
  `,
  imports: [NgIf, AsyncPipe, DatePipe],
  providers: [PersonComponentService],
})
export class PersonComponent {
  @Input() public set id(value: string) {
    this.componentService.id = value;
  }

  protected readonly person$ = this.componentService.observePerson();

  constructor(private readonly componentService: PersonComponentService) {}
}
