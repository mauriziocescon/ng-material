import { Block } from '../../../../../shared/block.model';

export interface DropdownBlock extends Block<string> {
  choices: string[];
}
