import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
  output,
  untracked,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { Subscription } from 'rxjs';

import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { ValidityStateDirective } from '../../../../../shared/validity-state.directive';
import { UIUtilitiesService } from '../../../../../shared/ui-utilities.service';

import { CheckBoxConfirmerBlock } from './check-box-confirmer.model';

@Component({
  selector: 'app-check-box-confirmer-cp',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    MatCardModule,
    MatCheckboxModule,
    ValidityStateDirective,
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
export class CheckBoxConfirmerComponent implements OnDestroy {
  private transloco = inject(TranslocoService);
  private uiUtilities = inject(UIUtilitiesService);

  block = input.required<CheckBoxConfirmerBlock>();
  valueDidChange = output<boolean>();

  label = computed(() => this.block().label);
  description = computed(() => this.block().description);
  valid = computed(() => this.block().valid);

  control = new FormControl<boolean>(false);
  private controlSubscription: Subscription | undefined;

  private modalSubscription: Subscription | undefined;

  private blockWatcher = effect(() => {
    this.block();
    untracked(() => {
      this.controlSubscription?.unsubscribe();
      this.setupController();
      this.subscribeValueChanges();
    });
  });

  ngOnDestroy(): void {
    this.controlSubscription?.unsubscribe();
    this.modalSubscription?.unsubscribe();
  }

  private setupController(): void {
    const validators = [...(this.block().required ? [Validators.required] : [])];
    this.control.setValidators(validators);
    this.setDisableEnable(this.block().disabled, this.control);
    this.control.setValue(this.block()?.value ?? false);
  }

  private subscribeValueChanges(): void {
    this.controlSubscription?.unsubscribe();

    this.controlSubscription = this.control
      .valueChanges
      .subscribe(value => {
        if (value === true) {
          this.askForConfirmation();
        } else {
          this.valueDidChange.emit(false);
        }
      });
  }

  private setDisableEnable(condition: boolean, control: FormControl): void {
    if (condition) {
      control.disable();
    } else {
      control.enable();
    }
  }

  private askForConfirmation(): void {
    this.modalSubscription?.unsubscribe();

    this.modalSubscription = this.uiUtilities.modalConfirmer({
      id: 'checkBoxConfirmer',
      title: this.transloco.translate('CONTAINER.CHECK_BOX_CONFIRMER.CONFIRMATION_TITLE'),
      message: this.transloco.translate('CONTAINER.CHECK_BOX_CONFIRMER.CONFIRMATION_MESSAGE'),
      yesButtonLabel: this.transloco.translate('CONTAINER.CHECK_BOX_CONFIRMER.CONFIRMATION_YES_BUTTON'),
      noButtonLabel: this.transloco.translate('CONTAINER.CHECK_BOX_CONFIRMER.CONFIRMATION_NO_BUTTON'),
    })
      .subscribe(result => {
        if (result === true) {
          this.valueDidChange.emit(true);
        } else {
          this.control.setValue(false);
          this.valueDidChange.emit(false);
        }
      });
  }
}
