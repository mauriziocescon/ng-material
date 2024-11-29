import { ChangeDetectionStrategy, Component, effect, inject, OnInit, untracked } from '@angular/core';

import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';

import { TextFilter } from '../../shared/text-filter';
import { ScrollToTop } from '../../shared/scroll-to-top';
import { ModalManager } from '../../shared/modal-manager';
import { ModalAlert } from '../../shared/modal';

import { InstanceListDataClient } from '../store/instance-list-data-client';
import { InstanceListStore } from '../store/instance-list-store';

import { InstanceCard } from './instance-card';

@Component({
  selector: 'app-instance-list-page',
  imports: [
    TranslocoPipe,
    InfiniteScrollDirective,
    TextFilter,
    ScrollToTop,
    InstanceCard,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    InstanceListDataClient,
    InstanceListStore,
  ],
  template: `
    <div
      infiniteScroll
      [infiniteScrollDisabled]="instanceListStore.isInfiniteScrollDisabled()"
      (scrolled)="pageDidScroll()">

      <app-text-filter (valueDidChange)="textSearchDidChange($event)"/>

      @for (instance of instanceListStore.instances(); track instance.id) {
        <div class="instance">
          <app-instance-card [instance]="instance"/>
        </div>
      }

      @if (instanceListStore.loading()) {
        <div class="full-width-message"> {{ "COMPONENT.INSTANCE_LIST.LOADING" | transloco }}</div>
      } @else if (instanceListStore.hasNoData()) {
        <div class="full-width-message"> {{ "COMPONENT.INSTANCE_LIST.NO_RESULT" | transloco }}</div>
      } @else if (instanceListStore.isLoadCompleted()) {
        <div class="full-width-message"> {{ "COMPONENT.INSTANCE_LIST.LOAD_COMPLETED" | transloco }}</div>
      } @else if (instanceListStore.shouldRetry()) {
        <div class="full-width-message" (click)="loadList()"> {{ "COMPONENT.INSTANCE_LIST.RETRY" | transloco }}</div>
      }
      <app-scroll-to-top/>

    </div>`,
  styles: `
    .instance {
      padding-left: var(--padding-s);
      padding-right: var(--padding-s);
      padding-top: var(--padding-m);
      padding-bottom: var(--padding-m);
    }`,
})
export class InstanceListPage implements OnInit {
  private readonly transloco = inject(TranslocoService);
  private readonly modalManager = inject(ModalManager);
  protected readonly instanceListStore = inject(InstanceListStore);

  private readonly errorWatcher = effect(() => {
    this.instanceListStore.error();
    untracked(() => this.showModalError());
  });

  ngOnInit() {
    this.instanceListStore.setup();
    this.textSearchDidChange('');
  }

  pageDidScroll() {
    const textSearch = this.instanceListStore.textSearch();
    const pageNumber = this.instanceListStore.pageNumber();
    this.instanceListStore.updateParams({ textSearch, pageNumber: pageNumber + 1 });
  }

  textSearchDidChange(value: string) {
    this.instanceListStore.updateParams({ textSearch: value, pageNumber: 1 });
  }

  loadList() {
    const textSearch = this.instanceListStore.textSearch();
    const pageNumber = this.instanceListStore.pageNumber();
    this.instanceListStore.updateParams({ textSearch, pageNumber });
  }

  private showModalError() {
    if (this.instanceListStore.error()) {
      const modalAlert: ModalAlert = {
        id: 'instanceListError',
        title: this.transloco.translate('CONTAINER.INSTANCE_LIST.ALERT_TITLE'),
        message: this.instanceListStore.error() as string,
        buttonLabel: this.transloco.translate('CONTAINER.INSTANCE_LIST.ALERT_BUTTON'),
      };
      this.modalManager.alert(modalAlert);
    }
  }
}
