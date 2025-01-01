import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

import { map } from 'rxjs/operators';

import { InstanceDetailStore } from '../store/instance-detail-store';

import { Layout } from './layout';

import { BlockList } from './block-list/block-list';
import { NextStep } from './next-step/next-step';

@Component({
  selector: 'app-instance-detail-page',
  imports: [
    Layout,
    BlockList,
    NextStep,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-instance-detail-layout [left]="left" [right]="right">

      <ng-template #left>
        <app-next-step [instanceId]="instanceId()"/>
      </ng-template>

      <ng-template #right>
        <app-block-list [instanceId]="instanceId()"/>
      </ng-template>

    </app-instance-detail-layout>`,
})
export class InstanceDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly instanceDetailStore = inject(InstanceDetailStore);

  private readonly paramId$ = this.route.paramMap.pipe(map(params => params.get('id') as string));
  protected readonly instanceId = toSignal(this.paramId$, { initialValue: '' });

  readonly canDeactivate = toObservable(this.instanceDetailStore.isSyncRequired).pipe(map(v => !v));

  private readonly paramIdSub = this.paramId$
    .pipe(takeUntilDestroyed())
    .subscribe(id => this.instanceDetailStore.loadBlocks({ instanceId: id }));
}
