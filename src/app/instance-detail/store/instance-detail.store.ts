import { computed, inject, Injectable, OnDestroy, signal, Signal } from '@angular/core';

import { firstValueFrom } from 'rxjs';

import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';

import { Block } from '../../shared/block.model';

import { InstanceDetailService } from './instance-detail.service';

@Injectable({
  providedIn: 'root',
})
export class InstanceDetailStore implements OnDestroy {
  private instanceDetail = inject(InstanceDetailService);

  private loadedBlocks = signal<Block<unknown>[]>([]);
  private loadOngoing = signal<boolean>(false);
  private loadError = signal<string | undefined>(undefined);

  private blocks = signal<Block<unknown>[]>([]);
  private syncRequired = signal<{ instanceId: string, timestamp?: number } | undefined>(undefined);

  private syncOngoing = signal<boolean>(false);
  private syncError = signal<string | undefined>(undefined);

  private blocksValidity = computed(() => this.blocks()?.every(block => block.valid) ?? false);

  editedBlocks = computed(() => this.blocks());
  isLoadingBlocks = computed(() => this.loadOngoing());
  loadingError = computed(() => this.loadError());

  isSyncingBlocks = computed(() => this.syncOngoing());
  syncingError = computed(() => this.syncError());

  isSyncRequired = computed(() => this.syncRequired()?.timestamp !== undefined);
  isNextStepEnable = computed(() => this.blocksValidity() &&
    !this.loadOngoing() && this.loadingError() === undefined &&
    !this.syncOngoing() && this.syncError() === undefined);

  private timer: any = undefined;

  ngOnDestroy(): void {
    clearTimeout(this.timer);
    this.reset();
  }

  getBlock(id: string): Signal<Block<unknown>> {
    return computed(() => this.blocks().find(b => b.id === id) as Block<unknown>, { equal: isEqual });
  }

  updateBlock(data: { instanceId: string, blockId: string, value: unknown }): void {
    this.blocks.update(blocks => {
      const blockIndex = blocks.findIndex(b => b.id === data.blockId);
      if (blockIndex >= 0) {
        blocks.splice(blockIndex, 1, { ...blocks[blockIndex], value: data.value });
      }
      return blocks;
    });
    this.syncBlocks({ instanceId: data.instanceId, debounceTime: 3000 });
  }

  loadBlocks(params: { instanceId: string }): void {
    this.loadedBlocks.set([]);
    this.loadOngoing.set(true);
    this.loadError.set(undefined);
    firstValueFrom(this.instanceDetail.getBlocks(params.instanceId))
      .then(blocks => {
        this.loadedBlocks.set(blocks);
        this.blocks.set(cloneDeep(blocks));
      })
      .catch(err => this.loadError.set(err))
      .finally(() => this.loadOngoing.set(false));
  }

  syncBlocks(params: { instanceId: string, debounceTime?: number }): void {
    this.syncRequired.set({ instanceId: params.instanceId, timestamp: Date.now() });
    this.syncOngoing.set(true);
    this.syncError.set(undefined);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      firstValueFrom(this.instanceDetail.syncBlocks(params.instanceId, this.blocks()))
        .then(blocks => {
          this.syncRequired.set(undefined);
          this.blocks.set(blocks);
        })
        .catch(err => this.syncError.set(err))
        .finally(() => this.syncOngoing.set(false));
    }, params.debounceTime ?? 0);
  }

  reset(): void {
    this.loadedBlocks.set([]);
    this.loadOngoing.set(false);
    this.loadError.set(undefined);

    this.blocks.set([]);
    this.syncRequired.set(undefined);

    this.syncOngoing.set(false);
    this.syncError.set(undefined);
  }
}
