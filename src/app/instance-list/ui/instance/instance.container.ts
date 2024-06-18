import { Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { Router } from '@angular/router';

import { Instance } from '../../models/instance.model';

import { InstanceComponent } from './instance.component';

@Component({
  selector: 'app-instance-ct',
  standalone: true,
  imports: [
    InstanceComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-instance-cp
      [instance]="instance()"
      (instanceSelected)="goTo()">

      <ng-template #test1 let-example="example" let-other="other">
        <div>Test yeah!</div>
        <div>{{ example }}</div>
        <div>{{ other }}</div>
      </ng-template>

    </app-instance-cp>`,
})
export class InstanceContainerComponent {
  router = inject(Router);

  instance = input.required<Instance>();

  goTo(): void {
    this.router.navigateByUrl(`/instance-detail/${this.instance().id}`);
  }
}
