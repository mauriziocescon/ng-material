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
      (instanceSelected)="goTo()"/>`,
})
export class InstanceContainerComponent {
  router = inject(Router);

  instance = input.required<Instance>();

  goTo(): void {
    this.router.navigateByUrl(`/instance-detail/${this.instance().id}`);
  }
}
