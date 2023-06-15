const { nanoid } = require("nanoid");

const Contact = require("./schemas/contacts");

const getAllcontacts = async () => {
  return Contact.find();
};

const getContactById = (id) => {
  return Contact.findOne({ _id: id });
};

const createContact = ({ name, email, phone }) => {
  return Contact.create({ id: nanoid(), name, email, phone });
};

const updateContact = (id, body) => {
  return Contact.findByIdAndUpdate({ _id: id }, body, { new: true });
};

const updateStatusContact = (id, body) => {
  return Contact.findByIdAndUpdate({ _id: id }, body);
};

const removeContact = (id) => {
  return Contact.findByIdAndRemove({ _id: id });
};

module.exports = {
  getAllcontacts,
  getContactById,
  createContact,
  updateContact,
  updateStatusContact,
  removeContact,
};
