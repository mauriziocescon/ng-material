import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { InstanceDetailStore } from '../../../../store/instance-detail.store';

import { BlockComponent } from '../generic-block.model';

import { TextInputBlock } from './text-input.model';
import { TextInputComponent } from './text-input.component';

@Component({
  selector: 'app-text-input-ct',
  standalone: true,
  imports: [
    TextInputComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-text-input-cp
      [block]="block()"
      (valueDidChange)="valueDidChange($event)"/>`,
})
export class TextInputContainerComponent implements BlockComponent {
  private instanceDetailStore = inject(InstanceDetailStore);

  instanceId = input.required<string>();
  blockId = input.required<string>();

  block = computed<TextInputBlock>(() => {
    return this.instanceDetailStore.getBlock(this.blockId())() as TextInputBlock;
  });

  valueDidChange(value: string | undefined): void {
    this.instanceDetailStore.updateBlock({ instanceId: this.instanceId(), blockId: this.blockId(), value });
  }
}
