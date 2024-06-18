import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  effect,
  untracked,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { InstanceDetailStore } from '../store/instance-detail.store';

import { InstanceDetailComponent } from './instance-detail.component';
import { BlockListContainerComponent } from './block-list/block-list.container';
import { NextStepContainerComponent } from './next-step/next-step.container';

@Component({
  selector: 'app-instance-detail-ct',
  standalone: true,
  imports: [
    InstanceDetailComponent,
    BlockListContainerComponent,
    NextStepContainerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-instance-detail-cp
      [instanceId]="instanceId()"/>`,
})
export class InstanceDetailContainerComponent {
  private route = inject(ActivatedRoute);
  private instanceDetailStore = inject(InstanceDetailStore);

  instanceId = signal<string>(this.route.snapshot.paramMap.get('id') as string);
  canDeactivate = true;

  syncRequiredWatcher = effect(() => {
    this.instanceDetailStore.isSyncRequired();
    untracked(() => {
      this.canDeactivate = !this.instanceDetailStore.isSyncRequired();
    });
  });
}
