import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';

import { Block, BlockType } from '../../../../shared/block';

import { CheckBox } from './check-box/check-box';
import { CheckBoxConfirmer } from './check-box-confirmer/check-box-confirmer';
import { DatePicker } from './date-picker/date-picker';
import { Dropdown } from './dropdown/dropdown';
import { TextInput } from './text-input/text-input';
import { Unknown } from './unknown/unknown';

@Component({
  selector: 'app-block-comp-generator',
  imports: [
    NgComponentOutlet,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container [ngComponentOutlet]="$any(component())" [ngComponentOutletInputs]="inputs()" />`,
})
export class BlockCompGenerator {
  readonly instanceId = input.required<string>();
  readonly block = input.required<Block<unknown>>();

  protected readonly component = computed(() => this.getComponent(this.block()));
  protected readonly inputs = computed(() => ({
    instanceId: this.instanceId(),
    block: this.block(),
  }));

  private getComponent(block: Block<unknown>) {
    switch (block.type) {
      case BlockType.CheckBox: {
        return CheckBox;
      }
      case BlockType.CheckBoxConfirmer: {
        return CheckBoxConfirmer;
      }
      case BlockType.DatePicker: {
        return DatePicker;
      }
      case BlockType.Dropdown: {
        return Dropdown;
      }
      case BlockType.TextInput: {
        return TextInput;
      }
      default: {
        return Unknown;
      }
    }
  }
}
