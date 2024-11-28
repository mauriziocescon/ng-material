import { inject, Injectable } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';

import { first } from 'rxjs/operators';

import { ModalAlert, ModalConfirmer } from './modal';

import { ModalAlert as ModalAlertComp } from './modal-alert';
import { ModalConfirmer as ModalConfirmerComp } from './modal-confirmer';

@Injectable({
  providedIn: 'root',
})
export class ModalManager {
  private readonly dialog = inject(MatDialog);

  alert(modalAlert: ModalAlert) {
    const dialogRef = this.dialog.open(ModalAlertComp, {
      data: {
        title: modalAlert.title,
        message: modalAlert.message,
        buttonLabel: modalAlert.buttonLabel,
      },
    });
    return dialogRef.afterClosed();
  }

  confirmer(modalConfirmer: ModalConfirmer) {
    const dialogRef = this.dialog.open(ModalConfirmerComp, {
      data: {
        title: modalConfirmer.title,
        message: modalConfirmer.message,
        yesButtonLabel: modalConfirmer.yesButtonLabel,
        noButtonLabel: modalConfirmer.noButtonLabel,
      },
    });
    return dialogRef.afterClosed().pipe(first());
  }
}
