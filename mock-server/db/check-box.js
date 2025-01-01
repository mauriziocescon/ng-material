const faker = require('faker');

exports.getCheckBox = (index) => {
  const value = faker.datatype.boolean() ? true : undefined;

  return {
    id: faker.datatype.uuid(),
    type: 'check-box',
    order: parseInt(index),
    label: 'CHECK_BOX.CHECK_BOX_LABEL',
    value: value,
    description: 'CHECK_BOX.CHECK_BOX_DESC',
    required: true,
    disabled: false,
    valid: !!value,
  };
};
