import { input } from '@angular/core';

import { Block } from '../../../../shared/block';

export interface BlockComponent {
  instanceId: ReturnType<typeof input.required<string>>;
  block: ReturnType<typeof input.required<Block<unknown>>>;
}
