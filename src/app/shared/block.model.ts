export class BlockType {
  static CheckBox = 'check-box';
  static CheckBoxConfirmer = 'check-box-confirmer';
  static DatePicker = 'date-picker';
  static Dropdown = 'dropdown';
  static TextInput = 'text-input';
}

export interface Block<T> {
  id: string;
  type: BlockType;
  order: number;
  label: string;
  required: boolean;
  disabled: boolean;
  value?: T;
  valid: boolean;
}
