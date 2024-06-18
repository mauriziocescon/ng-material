import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';

import { InstanceListStore } from '../store/instance-list.store';

import { InstanceListComponent } from './instance-list.component';

@Component({
  selector: 'app-instance-list-ct',
  standalone: true,
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
export class InstanceListContainerComponent implements OnInit {
  instanceListStore = inject(InstanceListStore);

  ngOnInit(): void {
    this.textSearchDidChange('');
  }

  textSearchDidChange(value: string): void {
    this.instanceListStore.upsertParams({ textSearch: value, pageNumber: 1 });
  }

  pageDidScroll(): void {
    const textSearch = this.instanceListStore.params.textSearch();
    const pageNumber = this.instanceListStore.params.pageNumber();
    this.instanceListStore.upsertParams({ textSearch, pageNumber: pageNumber + 1 });
  }

  reloadList(): void {
    const textSearch = this.instanceListStore.params.textSearch();
    const pageNumber = this.instanceListStore.params.pageNumber();
    this.instanceListStore.upsertParams({ textSearch, pageNumber });
  }
}
