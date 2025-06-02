import { ChangeDetectionStrategy, Component, computed, effect, inject, input, untracked } from '@angular/core';

import { TranslocoService } from '@jsverse/transloco';

import { Loader } from '../../../shared/loader';
import { ScrollToTop } from '../../../shared/scroll-to-top';
import { ModalAlert } from '../../../shared/modal';
import { ModalManager } from '../../../shared/modal-manager';

import { InstanceDetailStore } from '../../store/instance-detail-store';

import { BlockCompGenerator } from './blocks/block-comp-generator';

@Component({
  selector: 'app-block-list',
  imports: [
    Loader,
    ScrollToTop,
    BlockCompGenerator,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-loader
      [content]="content"
      [showData]="showData()"
      [isLoading]="isLoading()"
      [hasNoData]="hasNoData()"
      [shouldRetry]="shouldRetry()"
      (reload)="reloadList()">

      <ng-template #content>
        @for (block of blocks(); track block.id) {
          <div class="generic-block">
            <app-block-comp-generator [instanceId]="instanceId()" [block]="block"/>
          </div>
        }
      </ng-template>

    </app-loader>

    <app-scroll-to-top/>`,
  styles: `
    .generic-block {
      padding-left: var(--padding-s);
      padding-right: var(--padding-s);
      padding-top: var(--padding-m);
      padding-bottom: var(--padding-m);
    }`,
})
export class BlockList {
  private readonly transloco = inject(TranslocoService);
  private readonly modalManager = inject(ModalManager);
  protected readonly instanceDetailStore = inject(InstanceDetailStore);

  readonly instanceId = input.required<string>();

  protected readonly blocks = computed(() => this.instanceDetailStore.editedBlocks());
  protected readonly isLoading = computed(() => this.instanceDetailStore.isLoadingBlocks() === true);
  protected readonly error = computed(() => this.instanceDetailStore.loadingError());

  protected readonly shouldRetry = computed(() => this.error() !== undefined ? this.isLoading() === false : false);
  protected readonly hasNoData = computed(() => this.blocks()?.length === 0 ? this.isLoading() === false && this.shouldRetry() === false : false);
  protected readonly showData = computed(() => this.isLoading() === false && this.hasNoData() === false && this.shouldRetry() === false);

  private readonly errorWatcher = effect(() => {
    this.error();
    untracked(() => this.showModalError());
  });

  reloadList() {
    this.instanceDetailStore.loadBlocks({ instanceId: this.instanceId() });
  }

  private showModalError() {
    if (this.error()) {
      const modalAlert: ModalAlert = {
        id: 'blockListError',
        title: this.transloco.translate('BLOCK_LIST.ALERT_TITLE'),
        message: this.error()?.message as string,
        buttonLabel: this.transloco.translate('BLOCK_LIST.ALERT_BUTTON'),
      };
      this.modalManager.alert(modalAlert);
    }
  }
}
