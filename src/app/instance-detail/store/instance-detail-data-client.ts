import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AppConstants } from '../../core/app-constants';

import { Block } from '../../shared/block';

@Injectable({
  providedIn: 'root',
})
export class InstanceDetailDataClient {
  private readonly http = inject(HttpClient);
  private readonly appConstants = inject(AppConstants);

  getBlocks(instanceId: string) {
    const options = { params: { instanceId } };

    return this.http
      .get<Block<unknown>[]>(this.appConstants.Api.blocks, options)
      .pipe(
        map(data => data.sort((a: Block<unknown>, b: Block<unknown>) => a.order - b.order)),
        catchError((err: HttpErrorResponse) => this.handleError(err)),
      );
  }

  syncBlocks(instanceId: string, blocks: Block<unknown>[]) {
    const body = { instanceId, blocks };

    return this.http
      .put<Block<unknown>[]>(this.appConstants.Api.blocks, body)
      .pipe(
        map(data => data.sort((a: Block<unknown>, b: Block<unknown>) => a.order - b.order)),
        catchError((err: HttpErrorResponse) => this.handleError(err)),
      );
  }

  private handleError(err: HttpErrorResponse) {
    if (err.status === 0) {
      // A client-side or network error occurred
      return throwError(() => err.error);
    } else {
      // The backend returned an unsuccessful response code.
      return throwError(() => `Code ${err.status}, body: ${err.message}` || 'Server error');
    }
  }
}
