import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from '@angular/core';
import { NgComponentOutlet } from '@angular/common';

import { Block, BlockType } from '../../../../shared/block.model';

import { CheckBoxContainerComponent } from './check-box/check-box.container';
import { CheckBoxConfirmerContainerComponent } from './check-box-confirmer/check-box-confirmer.container';
import { DatePickerContainerComponent } from './date-picker/date-picker.container';
import { DropdownContainerComponent } from './dropdown/dropdown.container';
import { TextInputContainerComponent } from './text-input/text-input.container';
import { UnknownComponent } from './unknown/unknown.component';

@Component({
  selector: 'app-generic-block-ct',
  standalone: true,
  imports: [
    NgComponentOutlet,
    CheckBoxContainerComponent,
    CheckBoxConfirmerContainerComponent,
    DatePickerContainerComponent,
    DropdownContainerComponent,
    TextInputContainerComponent,
    UnknownComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container [ngComponentOutlet]="component()" [ngComponentOutletInputs]="inputs()"/>
  `,
})
export class GenericBlockContainerComponent {
  instanceId = input.required<string>();
  block = input.required<Block<unknown>>();

  component = computed(() => this.getComponent(this.block()));
  inputs = computed(() => ({
    instanceId: this.instanceId(),
    blockId: this.block().id,
  }));

  private getComponent(block: Block<unknown>): any {
    switch (block.type) {
      case BlockType.CheckBox: {
        return CheckBoxContainerComponent;
      }
      case BlockType.CheckBoxConfirmer: {
        return CheckBoxConfirmerContainerComponent;
      }
      case BlockType.DatePicker: {
        return DatePickerContainerComponent;
      }
      case BlockType.Dropdown: {
        return DropdownContainerComponent;
      }
      case BlockType.TextInput: {
        return TextInputContainerComponent;
      }
      default: {
        return UnknownComponent;
      }
    }
  }
}
