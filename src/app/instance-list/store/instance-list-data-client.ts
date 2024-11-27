import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AppConstantsService } from '../../core/app-constants.service';

import { Instance } from '../models/instance';

@Injectable()
export class InstanceListDataClient {
  private http = inject(HttpClient);
  private appConstants = inject(AppConstantsService);

  getInstances(textSearch: string | undefined, page: number): Observable<{ instances: Instance[], lastPage: boolean }> {
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
        map(data => data),
        catchError((err: HttpErrorResponse) => this.handleError(err)),
      );
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    if (err.status === 0) {
      // A client-side or network error occurred
      return throwError(() => err.error);
    } else {
      // The backend returned an unsuccessful response code.
      return throwError(() => `Code ${err.status}, body: ${err.message}` || 'Server error');
    }
  }
}
