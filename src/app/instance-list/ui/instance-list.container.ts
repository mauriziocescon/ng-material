import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';

import { InstanceListStore } from '../store/instance-list.store';

import { InstanceListComponent } from './instance-list.component';

@Component({
  selector: 'app-instance-list-ct',
  imports: [
    InstanceListComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-instance-list-cp
      [instances]="instanceListStore.instances()"
      [isLoading]="instanceListStore.loading()"
      [error]="instanceListStore.error()"
      [loadCompleted]="instanceListStore.lastPage()"
      (textSearchDidChange)="textSearchDidChange($event)"
      (pageDidScroll)="pageDidScroll()"
      (reloadList)="reloadList()"/>`,
})
export class InstanceListContainerComponent implements OnInit, OnDestroy {
  instanceListStore = inject(InstanceListStore);

  ngOnInit(): void {
    this.instanceListStore.setup();
    this.textSearchDidChange('');
  }

  ngOnDestroy(): void {
    this.instanceListStore.reset();
  }

  textSearchDidChange(value: string): void {
    this.instanceListStore.updateParams({ textSearch: value, pageNumber: 1 });
  }

  pageDidScroll(): void {
    const textSearch = this.instanceListStore.textSearch();
    const pageNumber = this.instanceListStore.pageNumber();
    this.instanceListStore.updateParams({ textSearch, pageNumber: pageNumber + 1 });
  }

  reloadList(): void {
    const textSearch = this.instanceListStore.textSearch();
    const pageNumber = this.instanceListStore.pageNumber();
    this.instanceListStore.updateParams({ textSearch, pageNumber });
  }
}
