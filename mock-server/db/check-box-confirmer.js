const faker = require('faker');

exports.getCheckBoxConfirmer = (index) => {
  const value = faker.datatype.boolean() ? true : undefined;

  return {
    id: faker.datatype.uuid(),
    type: 'check-box-confirmer',
    order: parseInt(index),
    label: 'COMPONENT.CHECK_BOX_CONFIRMER.CHECK_BOX_CONFIRMER_LABEL',
    value: value,
    description: 'COMPONENT.CHECK_BOX_CONFIRMER.CHECK_BOX_CONFIRMER_DESC',
    required: true,
    disabled: false,
    valid: !!value,
  };
};
