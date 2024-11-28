import { ChangeDetectionStrategy, Component, computed, effect, inject, input, untracked } from '@angular/core';
import { Location } from '@angular/common';

import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { ModalManager } from '../../../shared/modal-manager';
import { ModalAlert } from '../../../shared/modal';

import { InstanceDetailStore } from '../../store/instance-detail-store';

@Component({
  selector: 'app-next-step',
  imports: [
    TranslocoPipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="next-step">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ "COMPONENT.NEXT_STEP.HEADER" | transloco }}</mat-card-title>
        </mat-card-header>
        <mat-card-actions>
          <div class="action-btns">
            <button
              mat-raised-button
              color="primary"
              (click)="moveToNextStep()"
              [disabled]="!instanceDetailStore.isNextStepEnable()">
              {{ "COMPONENT.NEXT_STEP.NEXT_STEP" | transloco }}
            </button>

            @if (isSynchronized()) {
              <div>
                <mat-icon>done</mat-icon>
                <span>{{ "COMPONENT.NEXT_STEP.SYNC" | transloco }}</span>
              </div>
            } @else if (instanceDetailStore.isSyncingBlocks()) {
              <div>
                <mat-icon>sync</mat-icon>
                <span>{{ "COMPONENT.NEXT_STEP.SYNCING" | transloco }}</span>
              </div>
            } @else if (canRetrySync()) {
              <div (click)="retrySynchronization()">
                <mat-icon>redo</mat-icon>
                <span>{{ "COMPONENT.NEXT_STEP.RETRY" | transloco }}</span>
              </div>
            }
          </div>
        </mat-card-actions>
      </mat-card>
    </div>`,
  styles: `
    .next-step {
      position: sticky;
      top: 0;

      .action-btns {
        display: flex;
        flex-direction: column;

        button {
          margin: var(--padding-s);
        }
      }
    }`,
})
export class NextStep {
  private readonly location = inject(Location);
  private readonly transloco = inject(TranslocoService);
  private readonly modalManager = inject(ModalManager);
  protected readonly instanceDetailStore = inject(InstanceDetailStore);

  readonly instanceId = input.required<string>();

  protected readonly isSynchronized = computed(() => {
    return !this.instanceDetailStore.isSyncingBlocks() &&
      this.instanceDetailStore.syncingError() === undefined;
  });
  protected readonly canRetrySync = computed(() => {
    return !this.instanceDetailStore.isSyncingBlocks() &&
      this.instanceDetailStore.syncingError() !== undefined;
  });

  private readonly syncErrorWatcher = effect(() => {
    this.instanceDetailStore.syncingError();
    untracked(() => this.showModalError());
  });

  moveToNextStep() {
    this.location.back();
  }

  retrySynchronization() {
    this.instanceDetailStore.syncBlocks({ instanceId: this.instanceId() });
  }

  private showModalError() {
    if (this.instanceDetailStore.syncingError()) {
      const modalAlert: ModalAlert = {
        id: 'blockListError',
        title: this.transloco.translate('CONTAINER.BLOCK_LIST.ALERT_TITLE'),
        message: this.instanceDetailStore.syncingError() as string,
        buttonLabel: this.transloco.translate('CONTAINER.BLOCK_LIST.ALERT_BUTTON'),
      };
      this.modalManager.modalAlert(modalAlert);
    }
  }
}
