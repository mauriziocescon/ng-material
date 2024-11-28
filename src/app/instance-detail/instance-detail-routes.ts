import { Route } from '@angular/router';

import { InstanceDetail } from './ui/instance-detail';

export default [
  {
    path: '',
    component: InstanceDetail,
    title: 'Instance Detail',
    canDeactivate: [(component: InstanceDetail) => component.canDeactivate],
  },
] satisfies Route[];
