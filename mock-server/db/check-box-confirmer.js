const faker = require('faker');

exports.getCheckBoxConfirmer = (index) => {
  const value = faker.datatype.boolean() ? true : undefined;

  return {
    id: faker.datatype.uuid(),
    type: 'check-box-confirmer',
    order: parseInt(index),
    label: 'CHECK_BOX_CONFIRMER.CHECK_BOX_CONFIRMER_LABEL',
    value: value,
    description: 'CHECK_BOX_CONFIRMER.CHECK_BOX_CONFIRMER_DESC',
    required: true,
    disabled: false,
    valid: !!value,
  };
};
