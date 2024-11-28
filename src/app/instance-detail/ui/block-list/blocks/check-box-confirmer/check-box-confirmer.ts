import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
  untracked,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

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
    ReactiveFormsModule,
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
        <mat-checkbox [formControl]="control">{{ description() | transloco }}</mat-checkbox>
      </mat-card-content>
      <mat-card-actions>
        <span appValidityState [valid]="valid()"></span>
      </mat-card-actions>
    </mat-card>`,
})
export class CheckBoxConfirmer implements OnDestroy {
  private readonly transloco = inject(TranslocoService);
  private readonly modalManager = inject(ModalManager);
  private readonly instanceDetailStore = inject(InstanceDetailStore);

  readonly instanceId = input.required<string>();
  readonly blockId = input.required<string>();

  protected readonly block = computed<CheckBoxConfirmerBlock>(() => {
    return this.instanceDetailStore.getBlock(this.blockId())() as CheckBoxConfirmerBlock;
  });

  protected readonly label = computed(() => this.block().label);
  protected readonly description = computed(() => this.block().description);
  protected readonly valid = computed(() => this.block().valid);

  readonly control = new FormControl<boolean>(false);
  private controlSubscription: Subscription | undefined = undefined;

  private modalSubscription: Subscription | undefined = undefined;

  private readonly blockWatcher = effect(() => {
    this.block();
    untracked(() => {
      this.controlSubscription?.unsubscribe();
      this.setupController();
      this.subscribeValueChanges();
    });
  });

  ngOnDestroy() {
    this.controlSubscription?.unsubscribe();
    this.modalSubscription?.unsubscribe();
  }

  private setupController() {
    const validators = [...(this.block().required ? [Validators.required] : [])];
    this.control.setValidators(validators);
    this.setDisableEnable(this.block().disabled, this.control);
    this.control.setValue(this.block()?.value ?? false);
  }

  private subscribeValueChanges() {
    this.controlSubscription?.unsubscribe();

    this.controlSubscription = this.control
      .valueChanges
      .subscribe(value => {
        if (value === true) {
          this.askForConfirmation();
        } else {
          this.valueDidChange(false);
        }
      });
  }

  private setDisableEnable(condition: boolean, control: FormControl) {
    if (condition) {
      control.disable();
    } else {
      control.enable();
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
          this.valueDidChange(true);
        } else {
          this.control.setValue(false);
          this.valueDidChange(false);
        }
      });
  }

  private valueDidChange(value: boolean) {
    this.instanceDetailStore.updateBlock({ instanceId: this.instanceId(), blockId: this.blockId(), value });
  }
}
