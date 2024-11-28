import { Block } from '../../../../../shared/block.model';

export interface TextInputBlock extends Block<string> {
  minLength?: number;
  maxLength?: number;
}
