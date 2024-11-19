import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, untracked } from '@angular/core';

import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { ScrollToTopComponent } from '../../../shared/scroll-to-top.component';
import { Block } from '../../../shared/block.model';
import { ModalAlert } from '../../../shared/modal.model';
import { UIUtilitiesService } from '../../../shared/ui-utilities.service';

import { GenericBlockContainerComponent } from './blocks/generic-block.container';

@Component({
  selector: 'app-block-list-cp',
  imports: [
    TranslocoPipe,
    GenericBlockContainerComponent,
    ScrollToTopComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (showData()) {
      @for (block of blocks(); track block.id) {
        <div class="generic-block">
          <app-generic-block-ct [instanceId]="instanceId()" [block]="block"/>
        </div>
      }
      <div class="full-width-message">{{ "COMPONENT.BLOCK_LIST.LOAD_COMPLETED" | transloco }}</div>
    }

    @if (isLoading()) {
      <div class="full-width-message"> {{ "COMPONENT.BLOCK_LIST.LOADING" | transloco }}</div>
    } @else if (hasNoData()) {
      <div class="full-width-message"> {{ "COMPONENT.BLOCK_LIST.NO_RESULT" | transloco }}</div>
    } @else if (shouldRetry()) {
      <div class="full-width-message" (click)="loadList()"> {{ "COMPONENT.BLOCK_LIST.RETRY" | transloco }}</div>
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
export class BlockListComponent {
  private transloco = inject(TranslocoService);
  private uiUtilities = inject(UIUtilitiesService);

  instanceId = input.required<string>();
  blocks = input.required<Block<unknown>[]>();
  loading = input.required<boolean>();
  error = input.required<string | undefined>();
  reloadList = output<void>();

  isLoading = computed(() => this.loading() === true);
  shouldRetry = computed(() => this.error() !== undefined ? this.isLoading() === false : false);
  hasNoData = computed(() => this.blocks()?.length === 0 ? this.isLoading() === false && this.shouldRetry() === false : false);
  showData = computed(() => this.isLoading() === false && this.hasNoData() === false && this.shouldRetry() === false);

  private errorWatcher = effect(() => {
    this.error();
    untracked(() => this.showModalError());
  });

  loadList(): void {
    this.reloadList.emit();
  }

  private showModalError(): void {
    if (this.error()) {
      const modalAlert: ModalAlert = {
        id: 'blockListError',
        title: this.transloco.translate('CONTAINER.BLOCK_LIST.ALERT_TITLE'),
        message: this.error() as string,
        buttonLabel: this.transloco.translate('CONTAINER.BLOCK_LIST.ALERT_BUTTON'),
      };
      this.uiUtilities.modalAlert(modalAlert);
    }
  }
}
