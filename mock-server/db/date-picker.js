const faker = require('faker');

exports.getDatePicker = (index) => {
  const value = faker.date.future().toISOString();

  return {
    id: faker.datatype.uuid(),
    type: 'date-picker',
    order: parseInt(index),
    label: 'DATE_PICKER.DATE_PICKER_LABEL',
    value: value,
    description: 'DATE_PICKER.DATE_PICKER_DESC',
    required: true,
    disabled: false,
    valid: !!value,
  };
};
