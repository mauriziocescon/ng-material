import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { InstanceDetailStore } from '../../../../store/instance-detail.store';

import { BlockComponent } from '../generic-block.model';

import { DropdownBlock } from './dropdown-block.model';
import { DropdownComponent } from './dropdown.component';

@Component({
  selector: 'app-dropdown-ct',
  imports: [
    DropdownComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dropdown-cp
      [block]="block()"
      (valueDidChange)="valueDidChange($event)"/>`,
})
export class DropdownContainerComponent implements BlockComponent {
  private instanceDetailStore = inject(InstanceDetailStore);

  instanceId = input.required<string>();
  blockId = input.required<string>();

  block = computed<DropdownBlock>(() => {
    return this.instanceDetailStore.getBlock(this.blockId())() as DropdownBlock;
  });

  valueDidChange(value: string | undefined): void {
    this.instanceDetailStore.updateBlock({ instanceId: this.instanceId(), blockId: this.blockId(), value });
  }
}
