import { ChangeDetectionStrategy, Component, effect, inject, OnInit, untracked } from '@angular/core';

import { TranslocoService } from '@jsverse/transloco';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';

import { Loader } from '../../shared/loader';
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
    InfiniteScrollDirective,
    Loader,
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

      <app-loader
        [content]="content"
        [isLoading]="instanceListStore.loading()"
        [hasNoData]="instanceListStore.hasNoData()"
        [shouldRetry]="instanceListStore.shouldRetry()"
        [isLoadCompleted]="instanceListStore.isLoadCompleted()"
        (reload)="loadList()">

        <ng-template #content>
          @for (instance of instanceListStore.instances(); track instance.id) {
            <div class="instance">
              <app-instance-card [instance]="instance"/>
            </div>
          }
        </ng-template>
        
      </app-loader>

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
        title: this.transloco.translate('INSTANCE_LIST.ALERT_TITLE'),
        message: this.instanceListStore.error() as string,
        buttonLabel: this.transloco.translate('INSTANCE_LIST.ALERT_BUTTON'),
      };
      this.modalManager.alert(modalAlert);
    }
  }
}
