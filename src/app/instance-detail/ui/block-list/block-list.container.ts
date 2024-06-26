import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  inject,
  input,
  effect,
  untracked,
} from '@angular/core';

import { InstanceDetailStore } from '../../store/instance-detail.store';

import { BlockListComponent } from './block-list.component';

@Component({
  selector: 'app-block-list-ct',
  standalone: true,
  imports: [
    BlockListComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-block-list-cp
      [instanceId]="instanceId()"
      [blocks]="instanceDetailStore.editedBlocks()"
      [loading]="instanceDetailStore.isLoadingBlocks()"
      [error]="instanceDetailStore.loadingError()"
      (reloadList)="reloadList()"/>`,
})
export class BlockListContainerComponent implements OnDestroy {
  instanceDetailStore = inject(InstanceDetailStore);

  instanceId = input.required<string>();

  private instanceIdWatcher = effect(() => {
    this.instanceId();
    untracked(() => {
      if (this.instanceId()) {
        this.reloadList();
      }
    });
  });

  ngOnDestroy(): void {
    this.instanceDetailStore.reset();
  }

  reloadList(): void {
    this.instanceDetailStore.loadBlocks({ instanceId: this.instanceId() });
  }
}
