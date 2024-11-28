import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AppConstants } from '../../core/app-constants';

import { Instance } from '../models/instance';

@Injectable()
export class InstanceListDataClient {
  private readonly http = inject(HttpClient);
  private readonly appConstants = inject(AppConstants);

  getInstances(textSearch: string | undefined, page: number) {
    const url = this.appConstants.Api.instances;
    const _start = (page - 1) * 20, _limit = 20;
    const params = { q: textSearch || '', _start, _limit };

    return this.http.get<Instance[]>(url, { params, observe: 'response' })
      .pipe(
        map(response => {
          const xTotalCount = response.headers.get('X-Total-Count') ?? '0';
          const numOfItems = parseInt(xTotalCount, 10);
          const lastPage = _start + _limit >= numOfItems;

          return { instances: response.body as Instance[], lastPage };
        }),
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
