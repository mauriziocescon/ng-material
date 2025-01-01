import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { TranslocoPipe } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { ValidityState } from '../../../../../shared/validity-state';

import { InstanceDetailStore } from '../../../../store/instance-detail-store';

import { CheckBoxBlock } from './check-box-block';

@Component({
  selector: 'app-check-box',
  imports: [
    FormsModule,
    TranslocoPipe,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    ValidityState,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>
          <div class="card-title">{{ "CHECK_BOX.HEADER" | transloco }}</div>
        </mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <label>{{ label() | transloco }}</label>
        <mat-checkbox
          [(ngModel)]="value"
          (ngModelChange)="valueDidChange()"
          [disabled]="disabled()"
          [required]="required()">
          {{ description() | transloco }}
        </mat-checkbox>
      </mat-card-content>
      <mat-card-actions>
        <span appValidityState [valid]="valid()"></span>
      </mat-card-actions>
    </mat-card>`,
})
export class CheckBox {
  private readonly instanceDetailStore = inject(InstanceDetailStore);

  readonly instanceId = input.required<string>();
  readonly block = input.required<CheckBoxBlock>();

  protected readonly value = linkedSignal(() => this.block().value ?? false);
  protected readonly disabled = computed(() => this.block().disabled);
  protected readonly required = computed(() => this.block().required);
  protected readonly label = computed(() => this.block().label);
  protected readonly description = computed(() => this.block().description);
  protected readonly valid = computed(() => this.block().valid);

  valueDidChange() {
    this.instanceDetailStore.updateBlock({
      instanceId: this.instanceId(),
      blockId: this.block().id,
      value: this.value(),
    });
  }
}
