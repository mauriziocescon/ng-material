import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-alert',
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
      <button mat-button color="primary" (click)="close()">{{ data.buttonLabel }}</button>
    </div>`,
})
export class ModalAlert {
  protected readonly dialogRef = inject(MatDialogRef<ModalAlert>);
  protected readonly data: {
    title: string,
    message: string,
    buttonLabel: string,
  } = inject(MAT_DIALOG_DATA);

  close() {
    this.dialogRef.close();
  }
}
