import { computed, inject, Signal } from '@angular/core';

import { pipe, switchMap, tap } from 'rxjs';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';

import isEqual from 'lodash/isEqual';

import { Instance } from '../models/instance.model';

import { withLogger } from './logger.feature';
import { InstanceListService } from './instance-list.service';

interface State {
  params: { textSearch: string | undefined, pageNumber: number };

  instances: Instance[];
  loading: boolean;
  error: string | undefined;
  lastPage: boolean;
}

const initialState: State = {
  params: { textSearch: undefined, pageNumber: 1 },

  instances: [],
  loading: false,
  error: undefined,
  lastPage: false,
};

export const InstanceListStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, instanceList = inject(InstanceListService)) => ({
    instance(id: string): Signal<Instance> {
      return computed(() => store.instances()?.find(instance => instance.id === id) as Instance, { equal: isEqual });
    },
    upsertParams(params: { textSearch: string | undefined, pageNumber: number }): void {
      patchState(store, (state) => ({ params: { ...params } }));
    },
    _loadInstances: rxMethod<{ textSearch: string | undefined, pageNumber: number }>(
      pipe(
        tap(({ pageNumber }) => {
          if (pageNumber === 1) {
            patchState(store, { instances: [] });
          }
        }),
        tap(({ pageNumber }) => patchState(store, { loading: true, error: undefined })),
        switchMap(({ textSearch, pageNumber }) => {
          return instanceList.getInstances(textSearch, pageNumber).pipe(
            tapResponse({
              next: data => patchState(store, {
                instances: [...store.instances(), ...data.instances],
                lastPage: data.lastPage,
              }),
              error: (err: string) => patchState(store, ({ error: err })),
              finalize: () => patchState(store, { loading: false }),
            }),
          );
        }),
      ),
    ),
    reset(): void {
      patchState(store, (state) => ({ ...initialState }));
    },
  })),
  withHooks({
    onInit(store): void {
      store._loadInstances(store.params);
    },
  }),
  withLogger('instanceList'),
);
