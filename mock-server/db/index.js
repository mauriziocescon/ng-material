import faker from 'faker';

import {getUnknownComponent} from './unknown.js';
import {getCheckBox} from './check-box.js';
import {getCheckBoxConfirmer} from './check-box-confirmer.js';
import {getDatePicker} from './date-picker.js';
import {getDropdown} from './dropdown.js';
import {getTextInput} from './text-input.js';

export const mocks = {
  instances: [],
};

const getRandomBlock = (index) => {
  const choice = Math.random();

  if (choice < 0.05) {
    return getUnknownComponent(index);
  } else if (choice < 0.20) {
    return getCheckBox(index);
  } else if (choice < 0.40) {
    return getCheckBoxConfirmer(index);
  } else if (choice < 0.60) {
    return getDatePicker(index);
  } else if (choice < 0.80) {
    return getDropdown(index);
  } else {
    return getTextInput(index);
  }
};

// #items
Array.from({length: 160}, (v1, i) => {
  const instance = {id: `${i} - ${faker.lorem.word()}`, description: faker.lorem.sentences(), blocks: []};

  Array.from({length: faker.datatype.number({min: 1, max: 20})}, (v2, j) => {
    instance.blocks.push(getRandomBlock(j));
  });

  mocks.instances.push(instance);
});
