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
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ValidityStateDirective } from '../../../../../shared/validity-state.directive';

import { InstanceDetailStore } from '../../../../store/instance-detail-store';

import { DropdownBlock } from './dropdown-block';

@Component({
  selector: 'app-dropdown',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ValidityStateDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>
          <div class="card-title">{{ "COMPONENT.DROPDOWN.HEADER" | transloco }}</div>
        </mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <mat-form-field appearance="outline" class="card-content">
          <mat-label>{{ label() | transloco }}</mat-label>
          <mat-select [formControl]="control">
            @for (value of choices(); track value) {
              <mat-option [value]="value"> {{ value }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </mat-card-content>
      <mat-card-actions>
        <span appValidityState [valid]="valid()"></span>
      </mat-card-actions>
    </mat-card>`,
})
export class Dropdown implements OnDestroy {
  private readonly instanceDetailStore = inject(InstanceDetailStore);

  readonly instanceId = input.required<string>();
  readonly blockId = input.required<string>();

  protected readonly block = computed<DropdownBlock>(() => {
    return this.instanceDetailStore.getBlock(this.blockId())() as DropdownBlock;
  });

  protected readonly label = computed(() => this.block().label);
  protected readonly choices = computed(() => this.block().choices);
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
    const validators = [...(this.block().required ? [Validators.required] : [])];
    this.control.setValidators(validators);
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
