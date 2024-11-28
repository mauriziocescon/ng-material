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

import { TranslocoPipe } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { ValidityStateDirective } from '../../../../../shared/validity-state.directive';

import { InstanceDetailStore } from '../../../../store/instance-detail-store';

import { CheckBoxBlock } from './check-box-block';

@Component({
  selector: 'app-check-box',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    ValidityStateDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>
          <div class="card-title">{{ "COMPONENT.CHECK_BOX.HEADER" | transloco }}</div>
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
export class CheckBox implements OnDestroy {
  private readonly instanceDetailStore = inject(InstanceDetailStore);

  readonly instanceId = input.required<string>();
  readonly blockId = input.required<string>();

  protected readonly block = computed<CheckBoxBlock>(() => {
    return this.instanceDetailStore.getBlock(this.blockId())() as CheckBoxBlock;
  });

  protected readonly label = computed(() => this.block().label);
  protected readonly description = computed(() => this.block().description);
  protected readonly valid = computed(() => this.block().valid);

  readonly control = new FormControl<boolean>(false);
  private controlSubscription: Subscription | undefined = undefined;

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
      .subscribe(value => this.valueDidChange(value ?? false));
  }

  private setDisableEnable(condition: boolean, control: FormControl) {
    if (condition) {
      control.disable();
    } else {
      control.enable();
    }
  }

  private valueDidChange(value: boolean) {
    this.instanceDetailStore.updateBlock({ instanceId: this.instanceId(), blockId: this.blockId(), value });
  }
}
