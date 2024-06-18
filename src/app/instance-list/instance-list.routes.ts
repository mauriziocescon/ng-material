import { Route } from '@angular/router';

import { InstanceListContainerComponent } from './ui/instance-list.container';

export default [
  {
    path: '',
    component: InstanceListContainerComponent,
    title: 'Instance List',
  },
] satisfies Route[];
