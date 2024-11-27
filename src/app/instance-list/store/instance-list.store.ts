import { computed, inject, Injectable, OnDestroy, Signal } from '@angular/core';

import { pipe, switchMap, tap } from 'rxjs';
import { patchState, signalState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';

import isEqual from 'lodash/isEqual';

import { Instance } from '../models/instance.model';

import { InstanceListService } from './instance-list.service';

interface State {
  params: { textSearch: string | undefined, pageNumber: number };

  instances: Instance[];
  loading: boolean;
  error: string | undefined;
  lastPage: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class InstanceListStore implements OnDestroy {
  private instanceListDataClient = inject(InstanceListService);

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

  instance(id: string): Signal<Instance> {
    return computed(() => this.state.instances()?.find(instance => instance.id === id) as Instance, { equal: isEqual });
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
