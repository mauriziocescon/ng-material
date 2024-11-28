import { Block } from '../../shared/block';

export interface Instance {
  id: string;
  description: string;
  blocks: Block<unknown>[];
}
