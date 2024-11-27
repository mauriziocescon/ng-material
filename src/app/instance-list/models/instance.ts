import { Block } from '../../shared/block.model';

export interface Instance {
  id: string;
  description: string;
  blocks: Block<unknown>[];
}
