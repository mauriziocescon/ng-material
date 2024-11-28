import { computed, inject, Injectable, OnDestroy } from '@angular/core';

import { pipe } from 'rxjs';
import { debounceTime, filter, switchMap, tap } from 'rxjs/operators';
import { patchState, signalState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';

import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';

import { Block } from '../../shared/block';

import { InstanceDetailDataClient } from './instance-detail-data-client';

type State = {
  loadParams: { instanceId: string | undefined };
  loadedBlocks: Block<unknown>[];
  loadOngoing: boolean;
  loadError: string | undefined;

  blocks: Block<unknown>[];
  syncRequired: { instanceId: string | undefined, timestamp?: number } | undefined;

  syncParams: { instanceId: string | undefined, timestamp?: number };
  syncOngoing: boolean;
  syncError: string | undefined;
};

@Injectable()
export class InstanceDetailStore implements OnDestroy {
  private readonly instanceDetail = inject(InstanceDetailDataClient);

  private readonly state = signalState<State>({
    loadParams: { instanceId: undefined },
    loadedBlocks: [],
    loadOngoing: false,
    loadError: undefined,

    blocks: [],
    syncRequired: undefined,

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

  readonly isSyncRequired = computed(() => this.state.syncRequired()?.timestamp !== undefined);
  readonly isNextStepEnable = computed(() => this.blocksValidity() &&
    !this.state.loadOngoing() && this.loadingError() === undefined &&
    !this.state.syncOngoing() && this.state.syncError() === undefined);

  private readonly loadBlocksSub = rxMethod<{ instanceId: string | undefined }>(
    pipe(
      filter(({ instanceId }) => instanceId !== undefined),
      tap(() => patchState(this.state, () => ({ loadedBlocks: [], loadOngoing: true, loadError: undefined }))),
      switchMap(({ instanceId }) => this.instanceDetail.getBlocks(instanceId as string)
        .pipe(
          tapResponse({
            next: data => patchState(this.state, state => ({ loadedBlocks: data, blocks: cloneDeep(data) })),
            error: (err: string) => patchState(this.state, state => ({ loadError: err })),
            finalize: () => patchState(this.state, state => ({ loadOngoing: false })),
          }),
        ),
      ),
    ),
  );

  private readonly syncBlocksSub = rxMethod<{ instanceId: string | undefined, timestamp?: number }>(
    pipe(
      filter(({ timestamp }) => timestamp !== undefined),
      tap(() => patchState(this.state, () => ({ syncOngoing: true, syncError: undefined }))),
      debounceTime(3000),
      switchMap(({ instanceId }) => this.instanceDetail.syncBlocks(instanceId as string, this.state.blocks())
        .pipe(
          tapResponse({
            next: data => patchState(this.state, () => ({ blocks: data, syncParams: { instanceId } })),
            error: (err: string) => patchState(this.state, () => ({ syncError: err })),
            finalize: () => patchState(this.state, state => ({ syncOngoing: false })),
          }),
        ),
      ),
    ),
  );

  setup() {
    this.loadBlocksSub(this.state.loadParams);
    this.syncBlocksSub(this.state.syncParams);
  }

  ngOnDestroy() {
    this.loadBlocksSub?.unsubscribe();
    this.syncBlocksSub?.unsubscribe();
  }

  getBlock(id: string) {
    return computed(() => this.state.blocks().find(b => b.id === id) as Block<unknown>, { equal: isEqual });
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
    patchState(this.state, () => ({ syncParams: { instanceId: data.instanceId, timestamp: Date.now() } }));
  }

  reset() {
    patchState(this.state, () => ({
        loadParams: { instanceId: undefined },
        loadedBlocks: [],
        loadOngoing: false,
        loadError: undefined,

        blocks: [],
        syncRequired: undefined,

        syncParams: { instanceId: undefined },
        syncOngoing: false,
        syncError: undefined,
      }),
    );
  }
}
