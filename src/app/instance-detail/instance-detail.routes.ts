import { Route } from '@angular/router';

import { InstanceDetailContainerComponent } from './ui/instance-detail.container';

export default [
  {
    path: '',
    component: InstanceDetailContainerComponent,
    title: 'Instance Detail',
    canDeactivate: [(component: InstanceDetailContainerComponent) => component.canDeactivate],
  },
] satisfies Route[];
