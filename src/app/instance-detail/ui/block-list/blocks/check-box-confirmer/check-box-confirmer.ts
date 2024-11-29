import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Subscription } from 'rxjs';

import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { ValidityState } from '../../../../../shared/validity-state';
import { ModalManager } from '../../../../../shared/modal-manager';

import { InstanceDetailStore } from '../../../../store/instance-detail-store';

import { CheckBoxConfirmerBlock } from './check-box-confirmer-block';

@Component({
  selector: 'app-check-box-confirmer',
  imports: [
    FormsModule,
    TranslocoPipe,
    MatCardModule,
    MatCheckboxModule,
    ValidityState,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>
          <div class="card-title">{{ "COMPONENT.CHECK_BOX_CONFIRMER.HEADER" | transloco }}</div>
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
export class CheckBoxConfirmer {
  private readonly transloco = inject(TranslocoService);
  private readonly modalManager = inject(ModalManager);
  private readonly instanceDetailStore = inject(InstanceDetailStore);

  readonly instanceId = input.required<string>();
  readonly block = input.required<CheckBoxConfirmerBlock>();

  protected readonly value = linkedSignal(() => this.block().value ?? false);
  protected readonly disabled = computed(() => this.block().disabled);
  protected readonly required = computed(() => this.block().required);
  protected readonly label = computed(() => this.block().label);
  protected readonly description = computed(() => this.block().description);
  protected readonly valid = computed(() => this.block().valid);

  private modalSubscription: Subscription | undefined = undefined;

  valueDidChange() {
    if (this.value() === true) {
      this.askForConfirmation();
    } else {
      this.instanceDetailStore.updateBlock({
        instanceId: this.instanceId(),
        blockId: this.block().id,
        value: this.value(),
      });
    }
  }

  private askForConfirmation() {
    this.modalSubscription?.unsubscribe();

    this.modalSubscription = this.modalManager.confirmer({
      id: 'checkBoxConfirmer',
      title: this.transloco.translate('CONTAINER.CHECK_BOX_CONFIRMER.CONFIRMATION_TITLE'),
      message: this.transloco.translate('CONTAINER.CHECK_BOX_CONFIRMER.CONFIRMATION_MESSAGE'),
      yesButtonLabel: this.transloco.translate('CONTAINER.CHECK_BOX_CONFIRMER.CONFIRMATION_YES_BUTTON'),
      noButtonLabel: this.transloco.translate('CONTAINER.CHECK_BOX_CONFIRMER.CONFIRMATION_NO_BUTTON'),
    })
      .subscribe(result => {
        if (result === true) {
          this.instanceDetailStore.updateBlock({
            instanceId: this.instanceId(),
            blockId: this.block().id,
            value: this.value(),
          });
        } else {
          this.value.set(false);
        }
      });
  }
}
