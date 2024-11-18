import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, untracked } from '@angular/core';

import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';

import { TextFilterComponent } from '../../shared/text-filter.component';
import { ScrollToTopComponent } from '../../shared/scroll-to-top.component';
import { UIUtilitiesService } from '../../shared/ui-utilities.service';
import { ModalAlert } from '../../shared/modal.model';

import { Instance } from '../models/instance.model';

import { InstanceContainerComponent } from './instance/instance.container';

@Component({
  selector: 'app-instance-list-cp',
  standalone: true,
  imports: [
    TranslocoPipe,
    InfiniteScrollDirective,
    TextFilterComponent,
    ScrollToTopComponent,
    InstanceContainerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div infiniteScroll [infiniteScrollDisabled]="isInfiniteScrollDisabled()" (scrolled)="onScroll()">

      <app-text-filter-cp (valueDidChange)="onTextSearchDidChange($event)"/>

      @for (instance of instances(); track instance.id) {
        <div class="instance">
          <app-instance-ct [instance]="instance"/>
        </div>
      }

      <div class="full-width-message" [hidden]="!isLoading()">
        {{ "COMPONENT.INSTANCE_LIST.LOADING" | transloco }}
      </div>
      <div class="full-width-message" [hidden]="!hasNoData()">
        {{ "COMPONENT.INSTANCE_LIST.NO_RESULT" | transloco }}
      </div>
      <div class="full-width-message" [hidden]="!isLoadCompleted()">
        {{ "COMPONENT.INSTANCE_LIST.LOAD_COMPLETED" | transloco }}
      </div>
      <div class="full-width-message" [hidden]="!shouldRetry()" (click)="loadList()">
        {{ "COMPONENT.INSTANCE_LIST.RETRY" | transloco }}
      </div>
      <app-scroll-to-top/>
    </div>`,
  styles: `
    .instance {
      padding-left: var(--padding-s);
      padding-right: var(--padding-s);
      padding-top: var(--padding-m);
      padding-bottom: var(--padding-m);
    }
  `,
})
export class InstanceListComponent {
  transloco = inject(TranslocoService);
  uiUtilities = inject(UIUtilitiesService);

  instances = input.required<Instance[]>();
  isLoading = input.required<boolean>();
  error = input.required<string | undefined>();
  loadCompleted = input.required<boolean>();
  textSearchDidChange = output<string>();
  pageDidScroll = output<void>();
  reloadList = output<void>();

  isLoadCompleted = computed<boolean>(() => this.instances()?.length > 0 && this.isLoading() === false && this.loadCompleted() === true);
  hasNoData = computed(() => this.instances()?.length === 0 && this.isLoading() === false && this.error() === undefined);
  shouldRetry = computed(() => this.isLoading() === false && this.error() !== undefined);

  isInfiniteScrollDisabled = computed(() => this.isLoading() === true || this.error() !== undefined || this.loadCompleted() === true);

  errorWatcher = effect(() => {
    this.error();
    untracked(() => {
      if (this.error()) {
        const modalAlert: ModalAlert = {
          id: 'instanceListError',
          title: this.transloco.translate('CONTAINER.INSTANCE_LIST.ALERT_TITLE'),
          message: this.error() as string,
          buttonLabel: this.transloco.translate('CONTAINER.INSTANCE_LIST.ALERT_BUTTON'),
        };
        this.uiUtilities.modalAlert(modalAlert);
      }
    });
  });

  onScroll(): void {
    this.pageDidScroll.emit();
  }

  onTextSearchDidChange(value: string): void {
    this.textSearchDidChange.emit(value);
  }

  loadList(): void {
    this.reloadList.emit();
  }
}
