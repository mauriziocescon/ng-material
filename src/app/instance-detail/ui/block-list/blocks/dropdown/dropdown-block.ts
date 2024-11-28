import { Block } from '../../../../../shared/block';

export interface DropdownBlock extends Block<string> {
  choices: string[];
}
