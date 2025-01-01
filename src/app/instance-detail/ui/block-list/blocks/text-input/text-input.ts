import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { TranslocoPipe } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';

import { ValidityState } from '../../../../../shared/validity-state';

import { InstanceDetailStore } from '../../../../store/instance-detail-store';

import { TextInputBlock } from './text-input-block';

@Component({
  selector: 'app-text-input',
  imports: [
    FormsModule,
    TranslocoPipe,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ValidityState,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>
          <div class="card-title">{{ "TEXT_INPUT.HEADER" | transloco }}</div>
        </mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <mat-form-field appearance="outline" class="card-content">
          <mat-label>{{ label() | transloco }}</mat-label>
          <input
            type="text"
            matInput
            [(ngModel)]="value"
            (ngModelChange)="valueDidChange()"
            [disabled]="disabled()"
            [required]="required()"
            placeholder="{{ 'TEXT_INPUT.TEXT_INPUT_PLACEHOLDER' | transloco }}"/>
          @if (isNotEmpty()) {
            <button matSuffix mat-icon-button aria-label="Clear" (click)="resetTextInput()">
              <mat-icon>close</mat-icon>
            </button>
          }
          @if (showHint()) {
            <mat-hint>{{ message() | transloco: hintParams() }}</mat-hint>
          }
        </mat-form-field>
      </mat-card-content>
      <mat-card-actions>
        <span appValidityState [valid]="valid()"></span>
      </mat-card-actions>
    </mat-card>`,
})
export class TextInput {
  private readonly instanceDetailStore = inject(InstanceDetailStore);

  readonly instanceId = input.required<string>();
  readonly block = input.required<TextInputBlock>();

  protected readonly value = linkedSignal(() => this.block().value ?? null);
  protected readonly disabled = computed(() => this.block().disabled);
  protected readonly required = computed(() => this.block().required);
  protected readonly label = computed(() => this.block().label);
  protected readonly valid = computed(() => this.block().valid);

  protected readonly isNotEmpty = computed(() => !isEmpty(this.block().value));
  protected readonly showHint = computed(() => {
    const minLength = this.block().minLength ?? -1;
    const maxLength = this.block().maxLength ?? -1;
    return minLength >= 0 && maxLength >= 0;
  });
  protected readonly message = computed(() => {
    const minLength = this.block().minLength ?? -1;
    const maxLength = this.block().maxLength ?? -1;

    if (minLength >= 0 && maxLength >= 0) {
      return `TEXT_INPUT.TEXT_INPUT_MSG_MIN_MAX_LENGTH`;
    } else if (minLength >= 0) {
      return `TEXT_INPUT.TEXT_INPUT_MSG_MIN_LENGTH`;
    } else if (maxLength >= 0) {
      return `TEXT_INPUT.TEXT_INPUT_MSG_MAX_LENGTH`;
    } else {
      return ``;
    }
  });
  protected readonly hintParams = computed(() => {
    const minLength = this.block().minLength ?? -1;
    const maxLength = this.block().maxLength ?? -1;
    return { minLength, maxLength };
  }, { equal: isEqual });

  resetTextInput() {
    this.value.set(null);
    this.valueDidChange();
  }

  valueDidChange() {
    this.instanceDetailStore.updateBlock({
      instanceId: this.instanceId(),
      blockId: this.block().id,
      value: this.value(),
    });
  }
}
