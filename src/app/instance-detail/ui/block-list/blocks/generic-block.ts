import { input } from '@angular/core';

export interface BlockComponent {
  instanceId: ReturnType<typeof input.required<string>>;
  blockId: ReturnType<typeof input.required<string>>;
}
