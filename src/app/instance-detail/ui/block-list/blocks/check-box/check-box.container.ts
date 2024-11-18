import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { InstanceDetailStore } from '../../../../store/instance-detail.store';

import { BlockComponent } from '../generic-block.model';

import { CheckBoxBlock } from './check-box.model';
import { CheckBoxComponent } from './check-box.component';

@Component({
  selector: 'app-check-box-ct',
  standalone: true,
  imports: [
    CheckBoxComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-check-box-cp
      [block]="block()"
      (valueDidChange)="valueDidChange($event)"/>`,
})
export class CheckBoxContainerComponent implements BlockComponent {
  private instanceDetailStore = inject(InstanceDetailStore);

  instanceId = input.required<string>();
  blockId = input.required<string>();

  block = computed<CheckBoxBlock>(() => {
    return this.instanceDetailStore.getBlock(this.blockId())() as CheckBoxBlock;
  });

  valueDidChange(value: boolean): void {
    this.instanceDetailStore.updateBlock({ instanceId: this.instanceId(), blockId: this.blockId(), value });
  }
}
