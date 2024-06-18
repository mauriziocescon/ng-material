import {
  Component,
  OnInit,
  OnDestroy,
  input,
  output,
  computed,
  effect,
  untracked,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';

import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, skip } from 'rxjs/operators';

import { TranslocoPipe } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { ValidityStateDirective } from '../../../../../shared/validity-state.directive';

import { TextInputBlock } from './text-input.model';

@Component({
  selector: 'app-text-input-cp',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ValidityStateDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>
          <div class="card-title">{{ "COMPONENT.TEXT_INPUT.HEADER" | transloco }}</div>
        </mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <mat-form-field appearance="outline" class="card-content">
          <mat-label>{{ label() | transloco }}</mat-label>
          <input type="text"
                 matInput [formControl]="control"
                 placeholder="{{ 'COMPONENT.TEXT_INPUT.TEXT_INPUT_PLACEHOLDER' | transloco }}"/>
          @if (isTextInputNotEmpty()) {
            <button matSuffix mat-icon-button aria-label="Clear" (click)="resetTextInput()">
              <mat-icon>close</mat-icon>
            </button>
          }
          <mat-hint>{{ inputGroupMessage() | transloco: inputGroupParams() }}</mat-hint>
        </mat-form-field>
      </mat-card-content>
      <mat-card-actions>
        <span appValidityState [valid]="valid()"></span>
      </mat-card-actions>
    </mat-card>`,
})
export class TextInputComponent implements OnInit, OnDestroy {
  block = input.required<TextInputBlock>();
  valueDidChange = output<string | undefined>();

  label = computed(() => this.block().label);
  isTextInputNotEmpty = computed(() => !!this.block().value);
  inputGroupMessage = computed(() => {
    const minLength = this.block().minLength ?? -1;
    const maxLength = this.block().maxLength ?? -1;

    if (minLength >= 0 && maxLength >= 0) {
      return 'COMPONENT.TEXT_INPUT.TEXT_INPUT_MSG_MIN_MAX_LENGTH';
    } else if (minLength >= 0) {
      return 'COMPONENT.TEXT_INPUT.TEXT_INPUT_MSG_MIN_LENGTH';
    } else if (maxLength >= 0) {
      return 'COMPONENT.TEXT_INPUT.TEXT_INPUT_MSG_MAX_LENGTH';
    } else {
      return ``;
    }
  });
  inputGroupParams = computed(() => {
    const minLength = this.block().minLength ?? -1;
    const maxLength = this.block().maxLength ?? -1;

    if (minLength >= 0 && maxLength >= 0) {
      return {
        minLength: this.block().minLength,
        maxLength: this.block().maxLength,
      };
    } else if (minLength >= 0) {
      return {
        minLength: this.block().minLength,
      };
    } else if (maxLength >= 0) {
      return {
        maxLength: this.block().maxLength,
      };
    } else {
      return undefined;
    }
  });
  valid = computed(() => this.block().valid);

  control = new FormControl<string>('');
  private controlSubscription: Subscription | undefined;

  private blockWatcher = effect(() => {
    this.block();
    untracked(() => this.setupController());
  });

  ngOnInit(): void {
    this.setupController();
    this.subscribeValueChanges();
  }

  ngOnDestroy(): void {
    this.controlSubscription?.unsubscribe();
  }

  resetTextInput(): void {
    this.control.setValue('');
  }

  private setupController(): void {
    const minLength = this.block().minLength ?? -1;
    const maxLength = this.block().maxLength ?? -1;

    const validators = [
      ...this.insertIf(this.block().required, Validators.required),
      ...this.insertIf(
        minLength >= 0,
        Validators.minLength(this.block().minLength as number),
      ),
      ...this.insertIf(
        maxLength >= 0,
        Validators.maxLength(this.block().maxLength as number),
      ),
    ];
    this.control.setValidators(validators);
    this.setDisableEnable(this.block().disabled, this.control);
    this.control.setValue(this.block().value ?? null, { emitEvent: false });
  }

  private subscribeValueChanges(): void {
    this.controlSubscription?.unsubscribe();

    this.controlSubscription = this.control
      .valueChanges
      .pipe(debounceTime(500), distinctUntilChanged(), skip(1))
      .subscribe(value => this.valueDidChange.emit(value ?? undefined));
  }

  private setDisableEnable(condition: boolean, control: FormControl): void {
    if (condition) {
      control.disable();
    } else {
      control.enable();
    }
  }

  private insertIf(condition: boolean, element: any): any[] {
    return condition ? [element] : [];
  }
}
