import { Route } from '@angular/router';

import { InstanceDetailPage } from './ui/page';

export default [
  {
    path: '',
    component: InstanceDetailPage,
    title: 'Instance Detail',
    canDeactivate: [(component: InstanceDetailPage) => component.canDeactivate],
  },
] satisfies Route[];
