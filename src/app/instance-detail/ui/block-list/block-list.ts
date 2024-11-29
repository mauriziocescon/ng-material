import { ChangeDetectionStrategy, Component, computed, effect, inject, input, untracked } from '@angular/core';

import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { ScrollToTop } from '../../../shared/scroll-to-top';
import { ModalAlert } from '../../../shared/modal';
import { ModalManager } from '../../../shared/modal-manager';

import { InstanceDetailStore } from '../../store/instance-detail-store';

import { BlockCompGenerator } from './blocks/block-comp-generator';

@Component({
  selector: 'app-block-list',
  imports: [
    TranslocoPipe,
    BlockCompGenerator,
    ScrollToTop,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (showData()) {
      @for (block of blocks(); track block.id) {
        <div class="generic-block">
          <app-block-comp-generator [instanceId]="instanceId()" [block]="block"/>
        </div>
      }
      <div class="full-width-message">{{ "COMPONENT.BLOCK_LIST.LOAD_COMPLETED" | transloco }}</div>
    }

    @if (isLoading()) {
      <div class="full-width-message"> {{ "COMPONENT.BLOCK_LIST.LOADING" | transloco }}</div>
    } @else if (hasNoData()) {
      <div class="full-width-message"> {{ "COMPONENT.BLOCK_LIST.NO_RESULT" | transloco }}</div>
    } @else if (shouldRetry()) {
      <div class="full-width-message" (click)="reloadList()"> {{ "COMPONENT.BLOCK_LIST.RETRY" | transloco }}</div>
    }
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

  private readonly instanceIdWatcher = effect(() => {
    this.instanceId();
    untracked(() => this.reloadList());
  });

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
        title: this.transloco.translate('CONTAINER.BLOCK_LIST.ALERT_TITLE'),
        message: this.error() as string,
        buttonLabel: this.transloco.translate('CONTAINER.BLOCK_LIST.ALERT_BUTTON'),
      };
      this.modalManager.alert(modalAlert);
    }
  }
}
