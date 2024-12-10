import { computed, DestroyRef, inject, Injectable } from '@angular/core';

import { pipe } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import { patchState, signalState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';

import { Instance } from '../model/instance';

import { InstanceListDataClient } from './instance-list-data-client';

type State = {
  params: { textSearch: string | undefined, pageNumber: number };

  instances: Instance[];
  loading: boolean;
  error: string | undefined;
  lastPage: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class InstanceListStore {
  private readonly destroyRef = inject(DestroyRef);
  private readonly instanceListDataClient = inject(InstanceListDataClient);

  private readonly state = signalState<State>({
    params: { textSearch: undefined, pageNumber: 1 },

    instances: [],
    loading: false,
    error: undefined,
    lastPage: false,
  });

  readonly textSearch = computed(() => this.state.params.textSearch());
  readonly pageNumber = computed(() => this.state.params.pageNumber());
  readonly instances = computed(() => this.state.instances());
  readonly loading = computed(() => this.state.loading());
  readonly error = computed(() => this.state.error());
  readonly lastPage = computed(() => this.state.lastPage());

  readonly isLoadCompleted = computed<boolean>(() => this.instances()?.length > 0 && !this.loading() && this.lastPage());
  readonly hasNoData = computed(() => this.instances()?.length === 0 && !this.loading() && this.error() === undefined);
  readonly shouldRetry = computed(() => !this.loading() && this.error() !== undefined);

  readonly isInfiniteScrollDisabled = computed(() => this.loading() || this.error() !== undefined || this.lastPage());

  private readonly loadInstances = rxMethod<{ textSearch: string | undefined, pageNumber: number }>(
    pipe(
      filter(({ textSearch }) => textSearch !== undefined),
      tap(({ pageNumber }) => {
        if (pageNumber === 1) {
          patchState(this.state, { instances: [] });
        }
      }),
      tap(() => patchState(this.state, { loading: true, error: undefined })),
      switchMap(({ textSearch, pageNumber }) => this.instanceListDataClient.getInstances(textSearch, pageNumber)
        .pipe(
          tapResponse({
            next: data => patchState(this.state, {
              instances: [...this.state.instances(), ...data.instances],
              lastPage: data.lastPage,
            }),
            error: (err: string) => patchState(this.state, ({ error: err })),
            finalize: () => patchState(this.state, { loading: false }),
          }),
        ),
      ),
    ),
  );

  private readonly unregisterDestroy = this.destroyRef.onDestroy(() => this.loadInstances?.unsubscribe());

  constructor() {
    this.loadInstances(this.state.params);
  }

  updateParams(params: { textSearch: string | undefined, pageNumber: number }) {
    patchState(this.state, { params: { ...params } });
  }
}
