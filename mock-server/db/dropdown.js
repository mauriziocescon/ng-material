const faker = require('faker');

exports.getDropdown = (index) => {
  const value = faker.datatype.boolean() ? '1' : undefined;

  return {
    id: faker.datatype.uuid(),
    type: 'dropdown',
    order: parseInt(index),
    label: 'DROPDOWN.DROPDOWN_LABEL',
    value: value,
    choices: ['1', '2', '3'],
    required: true,
    disabled: false,
    valid: !!value,
  };
};
