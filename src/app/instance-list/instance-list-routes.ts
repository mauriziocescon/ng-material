import { Route } from '@angular/router';

import { InstanceListPage } from './ui/instance-list-page';

export default [
  {
    path: '',
    component: InstanceListPage,
    title: 'Instance List',
  },
] satisfies Route[];
