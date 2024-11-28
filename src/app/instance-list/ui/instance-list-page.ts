import { ChangeDetectionStrategy, Component, effect, inject, OnInit, untracked } from '@angular/core';

import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';

import { TextFilterComponent } from '../../shared/text-filter.component';
import { ScrollToTopComponent } from '../../shared/scroll-to-top.component';
import { UIUtilitiesService } from '../../shared/ui-utilities.service';
import { ModalAlert } from '../../shared/modal.model';

import { InstanceListDataClient } from '../store/instance-list-data-client';
import { InstanceListStore } from '../store/instance-list-store';

import { InstanceCard } from './instance-card';

@Component({
  selector: 'app-instance-list-page',
  imports: [
    TranslocoPipe,
    InfiniteScrollDirective,
    TextFilterComponent,
    ScrollToTopComponent,
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

      <app-text-filter-cp (valueDidChange)="textSearchDidChange($event)"/>

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
  readonly transloco = inject(TranslocoService);
  readonly uiUtilities = inject(UIUtilitiesService);
  readonly instanceListStore = inject(InstanceListStore);

  private readonly errorWatcher = effect(() => {
    this.instanceListStore.error();
    untracked(() => {
      if (this.instanceListStore.error()) {
        const modalAlert: ModalAlert = {
          id: 'instanceListError',
          title: this.transloco.translate('CONTAINER.INSTANCE_LIST.ALERT_TITLE'),
          message: this.instanceListStore.error() as string,
          buttonLabel: this.transloco.translate('CONTAINER.INSTANCE_LIST.ALERT_BUTTON'),
        };
        this.uiUtilities.modalAlert(modalAlert);
      }
    });
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
}
