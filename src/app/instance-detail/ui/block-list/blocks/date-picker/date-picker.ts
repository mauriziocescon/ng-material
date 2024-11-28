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
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { Subscription } from 'rxjs';

import { TranslocoPipe } from '@jsverse/transloco';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';

import { ValidityStateDirective } from '../../../../../shared/validity-state.directive';

import { InstanceDetailStore } from '../../../../store/instance-detail-store';

import { DatePickerBlock } from './date-picker-block';

@Component({
  selector: 'app-date-picker',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    ValidityStateDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>
          <div class="card-title">{{ "COMPONENT.DATE_PICKER.HEADER" | transloco }}</div>
        </mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <mat-form-field appearance="outline" class="card-content">
          <mat-label>{{ label() | transloco }}</mat-label>
          <input matInput [matDatepicker]="picker1" [formControl]="control"/>
          <mat-hint>MM/DD/YYYY</mat-hint>
          <mat-datepicker-toggle matIconSuffix [for]="picker1"/>
          <mat-datepicker #picker1/>
        </mat-form-field>
      </mat-card-content>
      <mat-card-actions>
        <span appValidityState [valid]="valid()"></span>
      </mat-card-actions>
    </mat-card>`,
})
export class DatePicker implements OnDestroy {
  private readonly instanceDetailStore = inject(InstanceDetailStore);

  readonly instanceId = input.required<string>();
  readonly blockId = input.required<string>();

  protected readonly block = computed<DatePickerBlock>(() => {
    return this.instanceDetailStore.getBlock(this.blockId())() as DatePickerBlock;
  });

  protected readonly label = computed(() => this.block().label);
  protected readonly description = computed(() => this.block().description);
  protected readonly valid = computed(() => this.block().valid);

  readonly control = new FormControl<string>('');
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
    this.setDisableEnable(this.block().disabled, this.control);
    this.control.setValue(this.block().value ?? null);
  }

  private subscribeValueChanges() {
    this.controlSubscription?.unsubscribe();

    this.controlSubscription = this.control
      .valueChanges
      .subscribe(value => this.valueDidChange(value ?? undefined));
  }

  private setDisableEnable(condition: boolean, control: FormControl) {
    if (condition) {
      control.disable();
    } else {
      control.enable();
    }
  }

  private valueDidChange(value: string | undefined) {
    this.instanceDetailStore.updateBlock({ instanceId: this.instanceId(), blockId: this.blockId(), value });
  }
}
