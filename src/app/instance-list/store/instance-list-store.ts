import { computed, inject, Injectable, OnDestroy } from '@angular/core';

import { pipe, switchMap, tap } from 'rxjs';
import { patchState, signalState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';

import { Instance } from '../models/instance';

import { InstanceListDataClient } from './instance-list-data-client';

type State = {
  params: { textSearch: string | undefined, pageNumber: number };

  instances: Instance[];
  loading: boolean;
  error: string | undefined;
  lastPage: boolean;
};

@Injectable()
export class InstanceListStore implements OnDestroy {
  private instanceListDataClient = inject(InstanceListDataClient);

  private state = signalState<State>({
    params: { textSearch: undefined, pageNumber: 1 },

    instances: [],
    loading: false,
    error: undefined,
    lastPage: false,
  });

  textSearch = computed(() => this.state.params.textSearch());
  pageNumber = computed(() => this.state.params.pageNumber());
  instances = computed(() => this.state.instances());
  loading = computed(() => this.state.loading());
  error = computed(() => this.state.error());
  lastPage = computed(() => this.state.lastPage());

  isLoadCompleted = computed<boolean>(() => this.instances()?.length > 0 && !this.loading() && this.lastPage());
  hasNoData = computed(() => this.instances()?.length === 0 && !this.loading() && this.error() === undefined);
  shouldRetry = computed(() => !this.loading() && this.error() !== undefined);

  isInfiniteScrollDisabled = computed(() => this.loading() || this.error() !== undefined || this.lastPage());

  private paramsSubscription = rxMethod<{ textSearch: string | undefined, pageNumber: number }>(
    pipe(
      tap(({ pageNumber }) => {
        if (pageNumber === 1) {
          patchState(this.state, { instances: [] });
        }
      }),
      tap(({ pageNumber }) => patchState(this.state, { loading: true, error: undefined })),
      switchMap(({ textSearch, pageNumber }) => {
        return this.instanceListDataClient.getInstances(textSearch, pageNumber).pipe(
          tapResponse({
            next: data => patchState(this.state, {
              instances: [...this.state.instances(), ...data.instances],
              lastPage: data.lastPage,
            }),
            error: (err: string) => patchState(this.state, ({ error: err })),
            finalize: () => patchState(this.state, { loading: false }),
          }),
        );
      }),
    ),
  );

  setup(): void {
    this.paramsSubscription(this.state.params);
  }

  ngOnDestroy(): void {
    this.paramsSubscription?.unsubscribe();
  }

  updateParams(params: { textSearch: string | undefined, pageNumber: number }): void {
    patchState(this.state, () => ({ params: { ...params } }));
  }

  reset(): void {
    patchState(this.state, () => ({
        params: { textSearch: undefined, pageNumber: 1 },

        instances: [],
        loading: false,
        error: undefined,
        lastPage: false,
      }),
    );
  }
}
