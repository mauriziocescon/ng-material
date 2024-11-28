import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-confirmer',
  imports: [
    MatButtonModule,
    MatDialogModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 mat-dialog-title>{{ data.title }}</h1>
    <div mat-dialog-content>
      {{ data.message }}
    </div>
    <div mat-dialog-actions>
      <button mat-button color="primary" (click)="yes()">{{ data.yesButtonLabel }}</button>
      <button mat-button (click)="no()">{{ data.noButtonLabel }}</button>
    </div>`,
})
export class ModalConfirmer {
  protected readonly dialogRef = inject(MatDialogRef<ModalConfirmer>);
  protected readonly data: {
    title: string,
    message: string,
    yesButtonLabel: string,
    noButtonLabel: string
  } = inject(MAT_DIALOG_DATA);

  yes() {
    this.dialogRef.close(true);
  }

  no() {
    this.dialogRef.close(false);
  }
}
