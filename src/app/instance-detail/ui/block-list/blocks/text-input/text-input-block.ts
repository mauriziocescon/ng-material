import { Block } from '../../../../../shared/block';

export interface TextInputBlock extends Block<string> {
  minLength?: number;
  maxLength?: number;
}
