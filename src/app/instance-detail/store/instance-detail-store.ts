import { computed, DestroyRef, inject, Injectable } from '@angular/core';

import { pipe } from 'rxjs';
import { debounceTime, filter, switchMap, tap } from 'rxjs/operators';
import { patchState, signalState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';

import { Block } from '../../shared/block';

import { InstanceDetailDataClient } from './instance-detail-data-client';

type State = {
  loadParams: { instanceId: string | undefined };
  loadedBlocks: Block<unknown>[];
  loadOngoing: boolean;
  loadError: string | undefined;

  blocks: Block<unknown>[];

  syncParams: { instanceId: string | undefined };
  syncOngoing: boolean;
  syncError: string | undefined;
};

@Injectable({
  providedIn: 'root',
})
export class InstanceDetailStore {
  private readonly destroyRef = inject(DestroyRef);
  private readonly instanceDetail = inject(InstanceDetailDataClient);

  private readonly state = signalState<State>({
    loadParams: { instanceId: undefined },
    loadedBlocks: [],
    loadOngoing: false,
    loadError: undefined,

    blocks: [],

    syncParams: { instanceId: undefined },
    syncOngoing: false,
    syncError: undefined,
  });

  private readonly blocksValidity = computed(() => this.state.blocks()?.every(block => block.valid) ?? false);

  readonly editedBlocks = computed(() => this.state.blocks());
  readonly isLoadingBlocks = computed(() => this.state.loadOngoing());
  readonly loadingError = computed(() => this.state.loadError());

  readonly isSyncingBlocks = computed(() => this.state.syncOngoing());
  readonly syncingError = computed(() => this.state.syncError());

  readonly isSyncRequired = computed(() => this.state.syncParams().instanceId !== undefined);
  readonly isNextStepEnable = computed(() => this.blocksValidity() &&
    !this.state.loadOngoing() && this.loadingError() === undefined &&
    !this.state.syncOngoing() && this.state.syncError() === undefined);

  private readonly loadBlocksSub = rxMethod<{ instanceId: string | undefined }>(
    pipe(
      filter(({ instanceId }) => instanceId !== undefined),
      tap(() => patchState(this.state, { loadOngoing: true, loadError: undefined })),
      switchMap(({ instanceId }) => this.instanceDetail.getBlocks(instanceId as string)
        .pipe(
          tapResponse({
            next: data => patchState(this.state, { loadedBlocks: data, blocks: structuredClone(data) }),
            error: (err: string) => patchState(this.state, { loadError: err }),
            finalize: () => patchState(this.state, { loadOngoing: false }),
          }),
        ),
      ),
    ),
  );

  private readonly syncBlocksSub = rxMethod<{ instanceId: string | undefined }>(
    pipe(
      filter(({ instanceId }) => instanceId !== undefined),
      tap(() => patchState(this.state, { syncOngoing: true, syncError: undefined })),
      debounceTime(3000),
      switchMap(({ instanceId }) => this.instanceDetail.syncBlocks(instanceId as string, this.state.blocks())
        .pipe(
          tapResponse({
            next: data => patchState(this.state, { blocks: data, syncParams: { instanceId: undefined } }),
            error: (err: string) => patchState(this.state, { syncError: err }),
            finalize: () => patchState(this.state, { syncOngoing: false }),
          }),
        ),
      ),
    ),
  );

  private readonly unregisterDestroy = this.destroyRef.onDestroy(() => {
    this.loadBlocksSub?.destroy();
    this.syncBlocksSub?.destroy();
  });

  constructor() {
    this.loadBlocksSub(this.state.loadParams);
    this.syncBlocksSub(this.state.syncParams);
  }

  loadBlocks(data: { instanceId: string }) {
    patchState(this.state, () => ({ loadParams: { instanceId: data.instanceId } }));
  }

  updateBlock(data: { instanceId: string, blockId: string, value: unknown }) {
    patchState(this.state, state => {
      const blocks = [...state.blocks];
      const blockIndex = blocks.findIndex(b => b.id === data.blockId);
      if (blockIndex >= 0) {
        blocks.splice(blockIndex, 1, { ...blocks[blockIndex], value: data.value });
      }
      return { blocks };
    });
    this.syncBlocks(data);
  }

  syncBlocks(data: { instanceId: string }) {
    patchState(this.state, { syncParams: { instanceId: data.instanceId } });
  }
}
