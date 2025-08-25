import { computed, DestroyRef, inject, Injectable, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { pipe } from 'rxjs';
import { debounceTime, filter, switchMap, tap } from 'rxjs/operators';
import { patchState, signalState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';

import { InstanceDetailDataClient } from './instance-detail-data-client';

type State = {
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
    syncParams: { instanceId: undefined },
    syncOngoing: false,
    syncError: undefined,
  });

  private readonly params = signal<{ instanceId: string } | undefined>(undefined);
  private readonly blocksResource = rxResource({
    params: this.params,
    stream: ({ params }) => this.instanceDetail.getBlocks(params!.instanceId),
    defaultValue: [],
  });

  readonly editedBlocks = linkedSignal(() => this.blocksResource.value());
  private readonly blocksValidity = computed(() => this.editedBlocks()?.every(block => block.valid) ?? false);

  readonly isLoadingBlocks = computed(() => this.blocksResource.isLoading());
  readonly loadingError = computed(() => this.blocksResource.error());

  readonly isSyncingBlocks = computed(() => this.state.syncOngoing());
  readonly syncingError = computed(() => this.state.syncError());

  readonly isSyncRequired = computed(() => this.state.syncParams().instanceId !== undefined);
  readonly isNextStepEnable = computed(() => this.blocksValidity() &&
    !this.blocksResource.isLoading() && this.loadingError() === undefined &&
    !this.state.syncOngoing() && this.state.syncError() === undefined);

  private readonly syncBlocksSub = rxMethod<{ instanceId: string | undefined }>(
    pipe(
      filter(({ instanceId }) => instanceId !== undefined),
      tap(() => patchState(this.state, { syncOngoing: true, syncError: undefined })),
      debounceTime(3000),
      switchMap(({ instanceId }) => this.instanceDetail.syncBlocks(instanceId as string, this.editedBlocks())
        .pipe(
          tapResponse({
            next: data => {
              patchState(this.state, { syncParams: { instanceId: undefined }, syncOngoing: false });
              this.editedBlocks.set(data);
            },
            error: (err: string) => patchState(this.state, { syncOngoing: false, syncError: err }),
          }),
        ),
      ),
    ),
  );

  private readonly unregisterDestroy = this.destroyRef.onDestroy(() => {
    this.syncBlocksSub?.destroy();
  });

  constructor() {
    this.syncBlocksSub(this.state.syncParams);
  }

  loadBlocks(params: { instanceId: string }) {
    this.params.set(params);
  }

  updateBlock(data: { instanceId: string, blockId: string, value: unknown }) {
    const blocks = [...this.editedBlocks()];
    const blockIndex = blocks.findIndex(b => b.id === data.blockId);
    if (blockIndex >= 0) {
      blocks.splice(blockIndex, 1, { ...blocks[blockIndex], value: data.value });
    }
    this.editedBlocks.set(blocks);
    this.syncBlocks(data);
  }

  syncBlocks(data: { instanceId: string }) {
    patchState(this.state, { syncParams: { instanceId: data.instanceId } });
  }
}
