import { Component, ChangeDetectionStrategy, inject, input, computed } from '@angular/core';

import { InstanceDetailStore } from '../../../../store/instance-detail.store';

import { BlockComponent } from '../generic-block.model';

import { DatePickerBlock } from './date-picker.model';
import { DatePickerComponent } from './date-picker.component';

@Component({
  selector: 'app-date-picker-ct',
  standalone: true,
  imports: [
    DatePickerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-date-picker-cp
      [block]="block()"
      (valueDidChange)="valueDidChange($event)"/>`,
})
export class DatePickerContainerComponent implements BlockComponent {
  private instanceDetailStore = inject(InstanceDetailStore);

  instanceId = input.required<string>();
  blockId = input.required<string>();

  block = computed<DatePickerBlock>(() => {
    return this.instanceDetailStore.getBlock(this.blockId())() as DatePickerBlock;
  });

  valueDidChange(value: string | undefined): void {
    this.instanceDetailStore.updateBlock({ instanceId: this.instanceId(), blockId: this.blockId(), value });
  }
}
