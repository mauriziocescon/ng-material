import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
  untracked,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { InstanceDetailService } from '../store/instance-detail.service';
import { InstanceDetailStore } from '../store/instance-detail.store';

import { InstanceDetailComponent } from './instance-detail.component';

@Component({
  selector: 'app-instance-detail-ct',
  imports: [
    InstanceDetailComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    InstanceDetailService,
    InstanceDetailStore,
  ],
  template: `
    <app-instance-detail-cp [instanceId]="instanceId()"/>`,
})
export class InstanceDetailContainerComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private instanceDetailStore = inject(InstanceDetailStore);

  instanceId = signal<string>(this.route.snapshot.paramMap.get('id') as string);
  canDeactivate = true;

  syncRequiredWatcher = effect(() => {
    this.instanceDetailStore.isSyncRequired();
    untracked(() => this.canDeactivate = !this.instanceDetailStore.isSyncRequired());
  });

  ngOnInit(): void {
    this.instanceDetailStore.setup();
  }

  ngOnDestroy(): void {
    this.instanceDetailStore.reset();
  }
}
