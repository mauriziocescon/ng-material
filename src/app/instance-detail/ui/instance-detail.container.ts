import { ChangeDetectionStrategy, Component, effect, inject, signal, untracked } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { InstanceDetailStore } from '../store/instance-detail.store';

import { InstanceDetailComponent } from './instance-detail.component';

@Component({
  selector: 'app-instance-detail-ct',
  standalone: true,
  imports: [
    InstanceDetailComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-instance-detail-cp [instanceId]="instanceId()"/>`,
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
