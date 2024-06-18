import { Component, ChangeDetectionStrategy, inject, input, computed } from '@angular/core';

import { InstanceDetailStore } from '../../../../store/instance-detail.store';

import { BlockComponent } from '../generic-block.model';

import { CheckBoxConfirmerBlock } from './check-box-confirmer.model';
import { CheckBoxConfirmerComponent } from './check-box-confirmer.component';

@Component({
  selector: 'app-check-box-confirmer-ct',
  standalone: true,
  imports: [
    CheckBoxConfirmerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-check-box-confirmer-cp
      [block]="block()"
      (valueDidChange)="valueDidChange($event)"/>`,
})
export class CheckBoxConfirmerContainerComponent implements BlockComponent {
  private instanceDetailStore = inject(InstanceDetailStore);

  instanceId = input.required<string>();
  blockId = input.required<string>();

  block = computed<CheckBoxConfirmerBlock>(() => {
    return this.instanceDetailStore.getBlock(this.blockId())() as CheckBoxConfirmerBlock;
  });

  valueDidChange(value: boolean): void {
    this.instanceDetailStore.updateBlock({ instanceId: this.instanceId(), blockId: this.blockId(), value });
  }
}
